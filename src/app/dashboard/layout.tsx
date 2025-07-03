"use client";

import React, { useEffect, useMemo } from "react";
import Navbar from "@/app/(components)/Navbar";
import Sidebar from "@/app/(components)/Sidebar";
import { useGlobalState } from "@/app/(context)/GlobalStateContext";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const createAppTheme = (isDarkMode: boolean) =>
    createTheme({
        palette: {
            mode: isDarkMode ? "dark" : "light",
            background: {
                default: isDarkMode ? "#111827" : "#ffffff", // Deep dark base
                paper: isDarkMode ? "#1f2937" : "#ffffff" // Card background with contrast
            },
            text: {
                primary: isDarkMode ? "#f9fafb" : "#111827", // Bright text for dark mode
                secondary: isDarkMode ? "#9ca3af" : "#4b5563" // Muted text for clarity
            }
        },
        components: {
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
                        color: isDarkMode ? "#f9fafb" : "#111827",
                        boxShadow: isDarkMode
                            ? "0 2px 8px rgba(0, 0, 0, 0.3)" // Subtle depth in dark mode
                            : "0 2px 4px rgba(0, 0, 0, 0.1)"
                    }
                }
            }
        },
        typography: {
             fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontWeight: 700 },
            h2: { fontWeight: 600 },
            body1: { fontWeight: 400 },
            button: { fontWeight: 500, textTransform: "none" }
        }
    });

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}): JSX.Element {
    const { isDarkMode, isSidebarCollapsed } = useGlobalState();

    const theme = useMemo(() => createAppTheme(isDarkMode), [isDarkMode]);

    useEffect(
        () => {
            const root = document.documentElement;
            root.classList.remove("dark", "light");
            root.classList.add(isDarkMode ? "dark" : "light");
        },
        [isDarkMode]
    );

    return (
        <ThemeProvider theme={theme}>
            <div className="flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 w-full min-h-screen overflow-hidden">
                <Sidebar />
                <main
                    className={`
            flex flex-col w-full h-full
            py-7 px-9
            bg-gray-50 dark:bg-gray-900
            transition-all duration-300 ease-in-out
            ${isSidebarCollapsed ? "md:pl-24" : "md:pl-72"}
          `}
                >
                    <Navbar />
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    );
}
