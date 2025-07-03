// app/layout.tsx
import { Inter } from "next/font/google";
import "./globals.css";
import { ProductProvider } from "./(context)/ProductContext";
import { Toaster } from "react-hot-toast";
import React from "react";
import { GlobalStateProvider } from "./(context)/GlobalStateContext";
import AxiosInterceptorWrapper from "./ConnectWithAuth";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Speg Inventory Management System",
    description: "This is an inventory management system for Speg"
};

export default function RootLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <link
                rel="icon"
                href="https://i.ibb.co/0VCphJDg/spegpine-logo-no-background.png"
                sizes="12x12"
            />
            <body className={`${inter.className} js-loading`}>
                <AxiosInterceptorWrapper>
                    <GlobalStateProvider>
                        <ProductProvider>
                            <Toaster
                                position="top-right"
                                reverseOrder={false}
                            />
                            {children}
                        </ProductProvider>
                    </GlobalStateProvider>
                </AxiosInterceptorWrapper>
            </body>
        </html>
    );
}
