"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

interface GlobalStateContextType {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (value: boolean) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize state from localStorage, falling back to defaults if not set
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('darkMode');
      return savedMode ? JSON.parse(savedMode) : false;
    }
    return false;
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const savedSidebar = localStorage.getItem('sidebarCollapsed');
      return savedSidebar ? JSON.parse(savedSidebar) : false;
    }
    return false;
  });

  // Update localStorage when isDarkMode changes
  useEffect(() => {
    // Apply dark mode class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Update localStorage when isSidebarCollapsed changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Custom setters that both update state and localStorage
  const handleSetDarkMode = (value: boolean) => {
    setIsDarkMode(value);
  };

  const handleSetSidebarCollapsed = (value: boolean) => {
    setIsSidebarCollapsed(value);
  };

  return (
    <GlobalStateContext.Provider
      value={{
        isDarkMode,
        setIsDarkMode: handleSetDarkMode,
        isSidebarCollapsed,
        setIsSidebarCollapsed: handleSetSidebarCollapsed,
      }}
    >
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
};