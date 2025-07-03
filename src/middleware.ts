// middleware.ts (or middleware.js)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/verify"]; // Fixed: added leading slash to "/verify"

// Middleware function
export async function middleware(request: NextRequest) {
    // Get the pathname from the request
    const { pathname } = request.nextUrl;

    // Check if the request is for the home route ("/")
    if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    // Allow public routes to proceed without authentication
    if (
        publicRoutes.some(
            (route) => pathname === route || pathname.startsWith(route)
        )
    ) {
        return NextResponse.next();
    }

    const accessToken = request.cookies.get("accessToken")?.value;

    if (!accessToken) {
        // No token: redirect to login
        const refreshToken = request.cookies.get("token")?.value;

        if (!refreshToken) {
            // No refresh token available
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }

        try {
            const refreshResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/refresh_auth`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }
            );

            if (refreshResponse.ok) {
                const { accessToken: newAccessToken } =
                    await refreshResponse.json();
                const response = NextResponse.next();

                // Fixed cookie configuration
                response.cookies.set("accessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: "lax", // Changed from "none" to "strict" for better security
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 60
                });
                return response;
            } else {
                // Refresh failed: clear cookies and redirect to login
                const loginUrl = new URL("/login", request.url);
                const redirectResponse = NextResponse.redirect(loginUrl);
                redirectResponse.cookies.delete("accessToken");
                redirectResponse.cookies.delete("token");
                return redirectResponse;
            }
        } catch (error) {
            console.error("Error during token verification:", error);
            const loginUrl = new URL("/login", request.url);
            return NextResponse.redirect(loginUrl);
        }
    }

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/verify_token`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            }
        );

        if (!response.ok) {
            // Token invalid: attempt to refresh
            const refreshToken = request.cookies.get("refreshToken")?.value;

            if (!refreshToken) {
                // No refresh token available
                const loginUrl = new URL("/login", request.url);
                return NextResponse.redirect(loginUrl);
            }

            const refreshResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/refresh_auth`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    credentials: "include"
                }
            );

            if (refreshResponse.ok) {
                const { accessToken: newAccessToken } =
                    await refreshResponse.json();
                const response = NextResponse.next();

                // Fixed cookie configuration
                response.cookies.set("accessToken", newAccessToken, {
                    httpOnly: true,
                    sameSite: "lax", // Changed from "none" to "strict" for better security
                    secure: process.env.NODE_ENV === "production",
                    maxAge: 60 * 60 // 1 hour
                });
                return response;
            } else {
                // Refresh failed: clear cookies and redirect to login
                const loginUrl = new URL("/login", request.url);
                const redirectResponse = NextResponse.redirect(loginUrl);
                redirectResponse.cookies.delete("accessToken");
                redirectResponse.cookies.delete("refreshToken");
                return redirectResponse;
            }
        }

        // Token is valid, proceed with the request
        return NextResponse.next();
    } catch (error) {
        console.error("Token verification error:", error);
        const loginUrl = new URL("/login", request.url);
        return NextResponse.redirect(loginUrl);
    }
}

export const config = {
    matcher: ["/((?!_next|api|_static|favicon.ico).*)"]
};
