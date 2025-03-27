"use client";

import { useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setSystemPrefersDark } from "@/redux/features/theme/themeSlice";


export function ThemeInitializer() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme);
  

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemPrefersDark(e.matches));
    };
    

    dispatch(setSystemPrefersDark(mediaQuery.matches));
    

    mediaQuery.addEventListener("change", handleChange);
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [dispatch]);
  

  const applyAccentColor = useCallback((accentColor: string) => {
    const root = document.documentElement;
    

    const accentColors = {
      orange: {
        primary: "24 89% 55%",
        accent: "24 89% 55%",
        ring: "24 89% 55%"
      },
      blue: {
        primary: "221 83% 53%",
        accent: "221 83% 53%",
        ring: "221 83% 53%"
      },
      green: {
        primary: "142 71% 45%",
        accent: "142 71% 45%",
        ring: "142 71% 45%"
      },
      purple: {
        primary: "262 83% 58%",
        accent: "262 83% 58%",
        ring: "262 83% 58%"
      },
      red: {
        primary: "0 84% 60%",
        accent: "0 84% 60%",
        ring: "0 84% 60%"
      },
      teal: {
        primary: "173 80% 40%",
        accent: "173 80% 40%",
        ring: "173 80% 40%"
      }
    };
    
    // Aplica as cores de destaque
    const colors = accentColors[accentColor as keyof typeof accentColors] || accentColors.orange;
    
    root.style.setProperty("--primary", colors.primary);
    root.style.setProperty("--accent", colors.accent);
    root.style.setProperty("--ring", colors.ring);
    
    // Mantém as cores de foreground consistentes
    if (theme.mode === "dark") {
      root.style.setProperty("--primary-foreground", "210 40% 98%");
      root.style.setProperty("--accent-foreground", "210 40% 98%");
    } else {
      root.style.setProperty("--primary-foreground", "0 0% 100%");
      root.style.setProperty("--accent-foreground", "0 0% 100%");
    }
  }, [theme.mode]);
  
  // Aplica as configurações de tema ao documento
  useEffect(() => {
    const isDark = 
      theme.mode === "dark" || 
      (theme.mode === "system" && theme.systemPrefersDark);
    
    // Aplica classe dark
    document.documentElement.classList.toggle("dark", isDark);
    
    // Aplica tamanho da fonte
    document.documentElement.dataset.fontSize = theme.fontSize;
    
    // Aplica configurações de movimento reduzido
    if (theme.reducedMotion) {
      document.documentElement.setAttribute("data-reduced-motion", "true");
    } else {
      document.documentElement.removeAttribute("data-reduced-motion");
    }
    
    // Aplica configurações de alto contraste
    if (theme.highContrast) {
      document.documentElement.setAttribute("data-high-contrast", "true");
    } else {
      document.documentElement.removeAttribute("data-high-contrast");
    }
    
    // Aplica esquema de cores personalizado se ativo
    if (theme.activeSchemeId) {
      const activeScheme = theme.customSchemes.find(
        (scheme) => scheme.id === theme.activeSchemeId
      );
      
      if (activeScheme) {
        // Aplica todas as variáveis de cor
        const root = document.documentElement;
        const colors = activeScheme.colors;
        
        Object.entries(colors).forEach(([key, value]) => {
          const cssVarName = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
          root.style.setProperty(cssVarName, value);
        });
      }
    } else {
      // Se não houver esquema personalizado ativo, aplica a cor de destaque predefinida
      applyAccentColor(theme.accentColor);
    }
  }, [
    theme.mode,
    theme.systemPrefersDark,
    theme.fontSize,
    theme.reducedMotion,
    theme.highContrast,
    theme.activeSchemeId,
    theme.customSchemes,
    theme.accentColor,
    applyAccentColor
  ]);
  
  // Este componente não renderiza nada visualmente
  return null;
}
