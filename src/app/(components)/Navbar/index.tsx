"use client";

import { Bell, LogOut, Menu, Moon, Sun } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useGlobalState } from "@/app/(context)/GlobalStateContext";
import { useRouter } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import { logOut } from "@/state/api";

const Navbar = () => {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [pendingOrders, setPendingOrders] = useState(0);
    const {
        isDarkMode,
        setIsDarkMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed
    } = useGlobalState();

    useEffect(() => {
        // Fetch user details when component mounts
        const fetchUserDetails = async () => {
            try {
                const response = await axiosInstance.get("/users/profile", {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    const { firstName, lastName } = response.data.user;
                    setUserName(`${firstName.charAt(0).toUpperCase() + firstName.slice(1)} ${lastName.charAt(0).toUpperCase() + lastName.slice(1)}`);
                }
            } catch (error: any) {
                console.error("Error fetching user details:", error);
                if (error.response?.status === 401) {
                    router.push("/login");
                }
            }
        };

        // Fetch pending orders count
        const fetchPendingOrders = async () => {
            try {
                const response = await axiosInstance.get("/orders/pending-count", {
                    withCredentials: true
                });
                
                if (response.data.success) {
                    setPendingOrders(response.data.count);
                }
            } catch (error) {
                console.error("Error fetching pending orders:", error);
            }
        };

        fetchUserDetails();
        fetchPendingOrders();

        // Set up an interval to refresh the pending orders count every minute
        const intervalId = setInterval(fetchPendingOrders, 60000);

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, [router]);

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
    };

    const handleLogout = async() => {
        // Clear localStorage
        localStorage.clear();
      
        // Optionally clear the refresh token cookie
        await logOut();
        router.push("/login");
    };

    const handleBellClick = () => {
        // Navigate to orders page or pending orders view
        router.push("/dashboard/orders?status=pending");
    };

    return (
        <div className="flex justify-between items-center w-full mb-7">
            {/* LEFT SIDE */}
            <div className="flex justify-between items-center gap-5">
                <button
                    className="px-3 py-3 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </button>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex justify-between items-center gap-5">
                <div className="hidden md:flex justify-between items-center gap-5">
                    <div>
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            {isDarkMode
                                ? <Sun
                                      className="cursor-pointer text-gray-500 dark:text-gray-300"
                                      size={24}
                                  />
                                : <Moon
                                      className="cursor-pointer text-gray-500 dark:text-gray-300"
                                      size={24}
                                  />}
                        </button>
                    </div>
                    <div className="relative">
                        <button
                            onClick={handleBellClick}
                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                            title={`You have ${pendingOrders} pending order(s)`}
                        >
                            <Bell
                                className="cursor-pointer text-gray-500 dark:text-gray-300"
                                size={24}
                                
                            />
                            {pendingOrders > 0 && (
                                <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-[0.4rem] py-1 text-xs font-semibold leading-none text-red-100 bg-red-400 rounded-full">
                                    {pendingOrders}
                                </span>
                            )}
                        </button>
                    </div>
                    <hr className="w-0 h-7 border border-solid border-l border-gray-300 dark:border-gray-600 mx-3" />
                    <div className="flex items-center gap-3 cursor-pointer">
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {userName || "Loading..."}
                        </span>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-300"
                    title="logout"
                >
                    <LogOut size={24} />
                </button>
            </div>
        </div>
    );
};

export default Navbar;