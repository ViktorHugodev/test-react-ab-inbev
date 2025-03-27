import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'orange' | 'blue' | 'green' | 'purple';

interface ThemeState {
  mode: ThemeMode;
  accentColor: AccentColor;
  fontSize: 'normal' | 'large' | 'extra-large';
  reducedMotion: boolean;
  highContrast: boolean;
}


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
    if (savedColor && ['orange', 'blue', 'green', 'purple'].includes(savedColor)) {
      return savedColor;
    }
  }
  return 'orange';
};

const initialState: ThemeState = {
  mode: getInitialTheme(),
  accentColor: getInitialAccentColor(),
  fontSize: 'normal',
  reducedMotion: false,
  highContrast: false,
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
    },
    toggleReducedMotion: (state) => {
      state.reducedMotion = !state.reducedMotion;
    },
    toggleHighContrast: (state) => {
      state.highContrast = !state.highContrast;
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
} = themeSlice.actions;

export default themeSlice.reducer;