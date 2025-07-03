"use client";
import React from "react";

const LogoLoader = () => {
    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 bg-opacity-95 dark:bg-opacity-95 transition-colors duration-200">
            {/* Logo container with combined animations */}
            <div className="relative">
                {/* Animated ring around the logo */}
                <div className="absolute inset-0 animate-spin">
                    <div className="w-32 h-32 rounded-full border-4 border-t-green-500 border-r-yellow-400 border-b-green-500 border-l-yellow-400" />
                </div>

                {/* Logo with pulse animation */}
                <div className="w-32 h-32 flex items-center justify-center animate-pulse">
                    {/* Replace the src with your actual logo path */}
                    <img
                        src="https://i.ibb.co/0VCphJDg/spegpine-logo-no-background.png"
                        alt="Company Logo"
                        className="w-24 h-24 object-contain"
                    />
                </div>
            </div>

            {/* Loading text */}
            <div className="mt-6">
                <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse transition-colors duration-200">
                    Loading...
                </p>
            </div>
        </div>
    );
};

export default LogoLoader;
