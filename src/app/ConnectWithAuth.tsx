"use client"
import axiosInstance from "@/utils/axiosInstance";
import React, { useEffect, useState } from "react";
import LogoLoader from "./(components)/Preloader/Preloader";
import {  refreshAuth } from "@/state/api";

export default function AxiosInterceptorWrapper({
    children
}: {
    children: React.ReactNode;
}) {
   const [isLoading, setIsLoading] = useState(true);
    

    // Setup axios interceptor for automatic token refresh
    useEffect(() => {
      
        const responseIntercept = axiosInstance.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If error is 401 and we haven't tried to refresh token yet
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await refreshAuth();
                        return axiosInstance(originalRequest, { withCredentials: true });
                    } catch (refreshError) {
                        // If refresh fails, logout user
                       console.error("Token refresh failed:", refreshError);
                       throw refreshError;
                    }
                }
                return Promise.reject(error);
            }
        );

        setIsLoading(false);

        return () => {
            axiosInstance.interceptors.response.eject(responseIntercept);
        };
    }, []);

 

    // Handle loading state
    if (isLoading) {
        return <LogoLoader/>; 
    }
  

    return  (
  <>{children}</>
        );
}