"use server";

import axiosInstance from "@/utils/axiosInstance";
import { cookies } from "next/headers";

export const verifyUser = async (userId: string) => {
    try {
        const token = cookies().get("accessToken")?.value;
        if (!token) throw new Error("No access token in cookie")
        const data = { adminVerified: true };
        await axiosInstance.patch(`/users/${userId}/adminverify`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
        return { success: true };
    } catch (error) {
        console.error("Error verifying user:", error);
        return { success: false, error: "Failed to verify user" };
    }
};

export const loginIn = async (email: string, password: string) => {
    try {
        const response = await axiosInstance.post("/users/login", {
            email,
            password
        });

        const cookieStore = cookies();

        cookieStore.set("accessToken", response.data.accessToken, {
            httpOnly: true,
            maxAge: 60 * 60,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return { success: true, data: response.data };
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
};

export const logOut = async () => {
    try {
        await axiosInstance.get("/users/logout", { withCredentials: true });

        const cookieStore = cookies();
        cookieStore.delete("accessToken");

        return { success: true };
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
};

export const refreshAuth = async () => {
    try {
        const response = await axiosInstance.get("/users/refresh_auth", {
            withCredentials: true
        });

        const cookieStore = cookies();

        cookieStore.set("accessToken", response.data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60,
            sameSite: "lax"
        });

        return { success: true };
    } catch (error) {
        console.error("Refresh auth error:", error);
        throw error;
    }
};

export async function deleteUser(userId: string) {
  try {
    // Grab the HttpOnly cookie that Next set on login
    const token = cookies().get("accessToken")?.value;
    if (!token) {
      console.error("No access token in cookie");
      return { success: false, error: "Not authenticated" };
    }

    // Forward it as a Bearer token
    const response = await axiosInstance.delete(
      `/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.status !== 200) {
      console.error("Delete failed with status", response.status);
      return { success: false, error: "Delete request failed" };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error in deleteUserAction:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}
