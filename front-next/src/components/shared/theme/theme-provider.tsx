"use client";

import { ReactNode, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider component
 * 
 * Initializes theme settings and provides theme context to the application.
 * This component should be placed near the root of your application.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  // Use our custom hook to access theme state and actions
  const { isDarkMode } = useTheme();
  
  // Apply theme class to html element
  useEffect(() => {
    // This effect is handled by the useTheme hook
    // but we keep this component as a logical container
    // for theme-related initialization
  }, [isDarkMode]);
  
  return <>{children}</>;
}
