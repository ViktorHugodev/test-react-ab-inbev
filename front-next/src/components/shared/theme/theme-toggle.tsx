"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { toggleThemeMode } from "@/redux/features/theme/themeSlice";
import type { RootState } from "@/redux/store";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state: RootState) => state.theme.mode);
  
  
  useEffect(() => {
    const isDark = 
      themeMode === "dark" || 
      (themeMode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    document.documentElement.classList.toggle("dark", isDark);
  }, [themeMode]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => dispatch({ type: 'theme/setThemeMode', payload: 'light' })}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch({ type: 'theme/setThemeMode', payload: 'dark' })}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => dispatch({ type: 'theme/setThemeMode', payload: 'system' })}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}