import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'teal';

export interface ColorScheme {
  id: string;
  name: string;
  colors: {
    background: string;
    foreground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
  };
}

export interface ThemeState {
  mode: ThemeMode;
  accentColor: AccentColor;
  fontSize: 'normal' | 'large' | 'extra-large';
  reducedMotion: boolean;
  highContrast: boolean;
  customSchemes: ColorScheme[];
  activeSchemeId: string | null;
  systemPrefersDark: boolean;
}

const defaultColorSchemes: ColorScheme[] = [
  {
    id: 'default',
    name: 'Padrão',
    colors: {
      background: '0 0% 100%',
      foreground: '224 71% 4%',
      primary: '24 89% 55%',
      primaryForeground: '0 0% 100%',
      secondary: '220 14% 96%',
      secondaryForeground: '224 71% 4%',
      accent: '24 89% 55%',
      accentForeground: '0 0% 100%',
      muted: '220 14% 96%',
      mutedForeground: '220 8% 46%',
      border: '220 13% 91%',
      input: '220 13% 91%',
      ring: '24 89% 55%',
    },
  },
  {
    id: 'blue',
    name: 'Azul',
    colors: {
      background: '0 0% 100%',
      foreground: '222 47% 11%',
      primary: '221 83% 53%',
      primaryForeground: '0 0% 100%',
      secondary: '210 40% 96%',
      secondaryForeground: '222 47% 11%',
      accent: '221 83% 53%',
      accentForeground: '0 0% 100%',
      muted: '210 40% 96%',
      mutedForeground: '215 16% 47%',
      border: '214 32% 91%',
      input: '214 32% 91%',
      ring: '221 83% 53%',
    },
  },
];

const getInitialTheme = (): ThemeMode => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('theme-mode') as ThemeMode;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      return savedTheme;
    }
  }
  return 'system';
};

const getInitialAccentColor = (): AccentColor => {
  if (typeof window !== 'undefined') {
    const savedColor = localStorage.getItem('accent-color') as AccentColor;
    if (savedColor && ['orange', 'blue', 'green', 'purple', 'red', 'teal'].includes(savedColor)) {
      return savedColor;
    }
  }
  return 'orange';
};

const getInitialActiveScheme = (): string | null => {
  if (typeof window !== 'undefined') {
    const savedScheme = localStorage.getItem('active-color-scheme');
    return savedScheme || null;
  }
  return null;
};

const getInitialCustomSchemes = (): ColorScheme[] => {
  if (typeof window !== 'undefined') {
    const savedSchemes = localStorage.getItem('custom-color-schemes');
    if (savedSchemes) {
      try {
        return JSON.parse(savedSchemes);
      } catch (e) {
        console.error('Failed to parse custom color schemes', e);
      }
    }
  }
  return defaultColorSchemes;
};

const getSystemPrefersDark = (): boolean => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  accentColor: getInitialAccentColor(),
  fontSize: 'normal',
  reducedMotion: false,
  highContrast: false,
  customSchemes: getInitialCustomSchemes(),
  activeSchemeId: getInitialActiveScheme(),
  systemPrefersDark: getSystemPrefersDark(),
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.mode = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', action.payload);
      }
    },
    toggleThemeMode: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme-mode', state.mode);
      }
    },
    setAccentColor: (state, action: PayloadAction<AccentColor>) => {
      state.accentColor = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accent-color', action.payload);
      }
    },
    setFontSize: (state, action: PayloadAction<'normal' | 'large' | 'extra-large'>) => {
      state.fontSize = action.payload;
      if (typeof window !== 'undefined') {
        localStorage.setItem('font-size', action.payload);
      }
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
      if (typeof window !== 'undefined') {
        localStorage.setItem('reduced-motion', String(state.reducedMotion));
      }
    },
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
      if (typeof window !== 'undefined') {
        localStorage.setItem('high-contrast', String(state.highContrast));
      }
    },
    setSystemPrefersDark: (state, action: PayloadAction<boolean>) => {
      state.systemPrefersDark = action.payload;
    },
    addCustomColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      const exists = state.customSchemes.some(scheme => scheme.id === action.payload.id);
      if (!exists) {
        state.customSchemes.push(action.payload);
        if (typeof window !== 'undefined') {
          localStorage.setItem('custom-color-schemes', JSON.stringify(state.customSchemes));
        }
      }
    },
    updateCustomColorScheme: (state, action: PayloadAction<ColorScheme>) => {
      const index = state.customSchemes.findIndex(scheme => scheme.id === action.payload.id);
      if (index !== -1) {
        state.customSchemes[index] = action.payload;
        if (typeof window !== 'undefined') {
          localStorage.setItem('custom-color-schemes', JSON.stringify(state.customSchemes));
        }
      }
    },
    removeCustomColorScheme: (state, action: PayloadAction<string>) => {
      state.customSchemes = state.customSchemes.filter(scheme => scheme.id !== action.payload);
      if (state.activeSchemeId === action.payload) {
        state.activeSchemeId = null;
        if (typeof window !== 'undefined') {
          localStorage.removeItem('active-color-scheme');
        }
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('custom-color-schemes', JSON.stringify(state.customSchemes));
      }
    },
    setActiveColorScheme: (state, action: PayloadAction<string | null>) => {
      state.activeSchemeId = action.payload;
      if (typeof window !== 'undefined') {
        if (action.payload) {
          localStorage.setItem('active-color-scheme', action.payload);
        } else {
          localStorage.removeItem('active-color-scheme');
        }
      }
    },
  },
});

export const {
  setThemeMode,
  toggleThemeMode,
  setAccentColor,
  setFontSize,
  toggleReducedMotion,
  toggleHighContrast,
  setSystemPrefersDark,
  addCustomColorScheme,
  updateCustomColorScheme,
  removeCustomColorScheme,
  setActiveColorScheme,
} = themeSlice.actions;

export default themeSlice.reducer;