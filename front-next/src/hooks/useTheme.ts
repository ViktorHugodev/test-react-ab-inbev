import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import {
  ThemeMode,
  AccentColor,
  ColorScheme,
  setThemeMode,
  toggleThemeMode,
  setAccentColor,
  setFontSize,
  toggleReducedMotion,
  toggleHighContrast,
  setActiveColorScheme,
  addCustomColorScheme,
  updateCustomColorScheme,
  removeCustomColorScheme,
  setSystemPrefersDark,
} from '@/redux/features/theme/themeSlice';

/**
 * Custom hook for managing theme settings
 * 
 * This hook provides a clean interface for interacting with the theme state
 * and follows Clean Architecture principles by separating UI concerns from business logic.
 * All theme-related actions are dispatched directly to Redux.
 */
export function useTheme() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme);
  
  // Listen for system color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Update the state when the system preference changes
    const handleChange = (e: MediaQueryListEvent) => {
      dispatch(setSystemPrefersDark(e.matches));
    };
    
    // Add event listener
    mediaQuery.addEventListener('change', handleChange);
    
    // Initial check
    dispatch(setSystemPrefersDark(mediaQuery.matches));
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [dispatch]);
  
  // Apply theme to document based on current settings
  useEffect(() => {
    const isDark = 
      theme.mode === 'dark' || 
      (theme.mode === 'system' && theme.systemPrefersDark);
    
    // Apply dark mode class
    document.documentElement.classList.toggle('dark', isDark);
    
    // Apply font size
    document.documentElement.dataset.fontSize = theme.fontSize;
    
    // Apply reduced motion
    if (theme.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
    
    // Apply high contrast
    if (theme.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
    
    // Apply custom color scheme if active
    if (theme.activeSchemeId) {
      const activeScheme = theme.customSchemes.find(
        (scheme) => scheme.id === theme.activeSchemeId
      );
      
      if (activeScheme) {
        applyColorScheme(activeScheme, isDark);
      }
    }
  }, [
    theme.mode, 
    theme.systemPrefersDark, 
    theme.fontSize, 
    theme.reducedMotion, 
    theme.highContrast,
    theme.activeSchemeId,
    theme.customSchemes
  ]);
  
  /**
   * Applies a color scheme to the document root
   */
  const applyColorScheme = (scheme: ColorScheme, isDark: boolean) => {
    const root = document.documentElement;
    const colors = scheme.colors;
    
    // Apply all color variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssVarName = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVarName, value);
    });
  };
  
  /**
   * Creates a new custom color scheme
   */
  const createColorScheme = (scheme: ColorScheme) => {
    dispatch(addCustomColorScheme(scheme));
  };
  
  /**
   * Updates an existing color scheme
   */
  const updateColorScheme = (scheme: ColorScheme) => {
    dispatch(updateCustomColorScheme(scheme));
  };
  
  /**
   * Removes a custom color scheme
   */
  const deleteColorScheme = (schemeId: string) => {
    dispatch(removeCustomColorScheme(schemeId));
  };
  
  /**
   * Sets the active color scheme
   */
  const setColorScheme = (schemeId: string | null) => {
    dispatch(setActiveColorScheme(schemeId));
  };
  
  /**
   * Sets the theme mode (light, dark, system)
   */
  const setMode = (mode: ThemeMode) => {
    dispatch(setThemeMode(mode));
  };
  
  /**
   * Toggles between light and dark mode
   */
  const toggleMode = () => {
    dispatch(toggleThemeMode());
  };
  
  /**
   * Sets the accent color
   */
  const setAccent = (color: AccentColor) => {
    dispatch(setAccentColor(color));
  };
  
  /**
   * Checks if the current theme is dark mode
   */
  const isDarkMode = theme.mode === 'dark' || 
    (theme.mode === 'system' && theme.systemPrefersDark);
  
  /**
   * Gets the current active color scheme
   */
  const getActiveColorScheme = () => {
    if (!theme.activeSchemeId) return null;
    return theme.customSchemes.find(scheme => scheme.id === theme.activeSchemeId) || null;
  };
  
  return {
    // State
    mode: theme.mode,
    accentColor: theme.accentColor,
    fontSize: theme.fontSize,
    reducedMotion: theme.reducedMotion,
    highContrast: theme.highContrast,
    customSchemes: theme.customSchemes,
    activeSchemeId: theme.activeSchemeId,
    systemPrefersDark: theme.systemPrefersDark,
    isDarkMode,
    
    // Actions - Todas as ações usam diretamente o Redux
    setMode,
    toggleMode,
    setAccent,
    setFontSize: (size: 'normal' | 'large' | 'extra-large') => dispatch(setFontSize(size)),
    toggleReducedMotion: () => dispatch(toggleReducedMotion()),
    toggleHighContrast: () => dispatch(toggleHighContrast()),
    createColorScheme,
    updateColorScheme,
    deleteColorScheme,
    setColorScheme,
    getActiveColorScheme,
  };
}
