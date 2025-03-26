import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SidebarState {
  isOpen: boolean;
}

interface UIState {
  sidebar: SidebarState;
  isMobileMenuOpen: boolean;
  lastNotification: string | null;
  showWelcomeDialog: boolean;
  showOnboarding: boolean;
}

const initialState: UIState = {
  sidebar: {
    isOpen: true,
  },
  isMobileMenuOpen: false,
  lastNotification: null,
  showWelcomeDialog: false,
  showOnboarding: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebar.isOpen = !state.sidebar.isOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebar.isOpen = action.payload;
    },
    toggleMobileMenu: (state) => {
      state.isMobileMenuOpen = !state.isMobileMenuOpen;
    },
    setMobileMenuOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileMenuOpen = action.payload;
    },
    setLastNotification: (state, action: PayloadAction<string | null>) => {
      state.lastNotification = action.payload;
    },
    setShowWelcomeDialog: (state, action: PayloadAction<boolean>) => {
      state.showWelcomeDialog = action.payload;
    },
    setShowOnboarding: (state, action: PayloadAction<boolean>) => {
      state.showOnboarding = action.payload;
    },
    dismissOnboarding: (state) => {
      state.showOnboarding = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  toggleMobileMenu,
  setMobileMenuOpen,
  setLastNotification,
  setShowWelcomeDialog,
  setShowOnboarding,
  dismissOnboarding,
} = uiSlice.actions;

export default uiSlice.reducer;