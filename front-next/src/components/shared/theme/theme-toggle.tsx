"use client";

import { useEffect } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setThemeMode, ThemeMode } from "@/redux/features/theme/themeSlice";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * ThemeToggle component
 * 
 * A dropdown menu that allows users to switch between light, dark, and system themes.
 * Uses Redux directly to interact with the theme state.
 */
export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const systemPrefersDark = useAppSelector((state) => state.theme.systemPrefersDark);
  
  // Função para definir o modo do tema diretamente com Redux
  const setMode = (newMode: ThemeMode) => {
    dispatch(setThemeMode(newMode));
  };
  
  // Determina se o tema atual é escuro
  const isDarkMode = mode === "dark" || (mode === "system" && systemPrefersDark);
  
  // Aplica a classe dark ao documento quando o tema muda
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => setMode('light')}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          <span>Claro</span>
          {mode === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setMode('dark')}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          <span>Escuro</span>
          {mode === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setMode('system')}
          className="flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          <span>Sistema</span>
          {mode === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}