"use client";

import {
    Archive,
    Layout,
    LucideIcon,
    Menu,
    SlidersHorizontal,
    User,
    ArrowLeftRight,
    ShoppingCart,
    Clipboard
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useGlobalState } from "@/app/(context)/GlobalStateContext";

interface SidebarLinkProps {
    href: string;
    icon: LucideIcon;
    label: string;
    isCollapsed: boolean;
}

const SidebarLink = ({
    href,
    icon: Icon,
    label,
    isCollapsed
}: SidebarLinkProps) => {
    const pathname = usePathname();
    const isActive = pathname === href || (pathname === "/" && href === "/dashboard");

    return (
        <Link href={href} title={`${label}`}>
            <div
                className={`
                    cursor-pointer flex items-center
                    ${isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"}
                    hover:text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950 dark:hover:text-blue-400
                    gap-3 transition-colors
                    ${isActive 
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400" 
                        : ""}
                `}
            >
                <Icon className={`w-6 h-6 ${isActive 
                    ? "text-blue-600 dark:text-blue-400" 
                    : "text-gray-700 dark:text-gray-300"}`} 
                />
                <span
                    className={`
                        ${isCollapsed ? "hidden" : "block"}
                        font-medium
                        ${isActive 
                            ? "text-blue-600 dark:text-blue-400" 
                            : "text-gray-700 dark:text-gray-300"}
                    `}
                >
                    {label}
                </span>
            </div>
        </Link>
    );
};

const Sidebar = () => {
    const { isSidebarCollapsed, setIsSidebarCollapsed } = useGlobalState();

    const toggleSidebar = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const sidebarClassNames = `
        fixed flex flex-col
        ${isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"}
        bg-white dark:bg-gray-800
        transition-all duration-300
        overflow-hidden h-full
        shadow-md dark:shadow-gray-900
        z-40
    `;

    return (
        <div className={sidebarClassNames}>
            {/* TOP LOGO */}
            <div className={`
                flex items-center
                pt-8 pb-4
                border-b border-gray-100 dark:border-gray-700
                ${isSidebarCollapsed ? "px-3 justify-center" : "px-6"}
            `}>
                <div className="flex items-center gap-3">
                    <img
                        src="/spegpine_logo_no_background.png"
                        alt="Company Logo"
                        className={`object-contain ${isSidebarCollapsed ? "w-10 h-10" : "w-14 h-14"}`}
                    />
                    {!isSidebarCollapsed && (
                        <h1 className="font-extrabold text-xl text-gray-800 dark:text-gray-100">
                            Inventory
                        </h1>
                    )}
                </div>

                <button
                    className="md:hidden ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={toggleSidebar}
                >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
            </div>

            {/* LINKS */}
            <div className="flex-grow mt-4">
            <SidebarLink
                    href="/dashboard"
                    icon={Layout}
                    label="Dashboard"
                    isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                    href="/dashboard/inventory"
                    icon={Archive}
                    label="Inventory"
                    isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                    href="/dashboard/transactions"
                    icon={ArrowLeftRight}
                    label="Transactions"
                    isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                    href="/dashboard/products"
                    icon={Clipboard}
                    label="Products"
                    isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                    href="/dashboard/orders"
                    icon={ShoppingCart}
                    label="Orders"
                    isCollapsed={isSidebarCollapsed}
                />
                <SidebarLink
                    href="/dashboard/users"
                    icon={User}
                    label="Users"
                    isCollapsed={isSidebarCollapsed}
                />
            </div>

            {/* FOOTER */}
            <div className={`
                ${isSidebarCollapsed ? "hidden" : "block"}
                mb-6 px-6
                text-center text-xs
                text-gray-500 dark:text-gray-400
            `}>
                &copy; {new Date().getFullYear()} Developed by Junior Consultants
            </div>
        </div>
    );
};

export default Sidebar;