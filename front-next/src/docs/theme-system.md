# Theme System Documentation

This document provides comprehensive information about the theme system implemented in this application. The theme system is built using Redux and integrates with Tailwind CSS to provide dynamic theming capabilities.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Redux Implementation](#redux-implementation)
3. [Theme Features](#theme-features)
4. [Using the Theme System](#using-the-theme-system)
5. [Extending the Theme System](#extending-the-theme-system)
6. [Integration with shadcn/ui](#integration-with-shadcnui)
7. [Best Practices](#best-practices)

## Architecture Overview

The theme system follows Clean Architecture principles with a clear separation of concerns:

- **State Management**: Redux manages the theme state (mode, colors, preferences)
- **UI Components**: React components for user interaction with the theme system
- **Theme Application**: CSS variables and Tailwind CSS for applying themes

The system is designed to be modular, extensible, and maintainable.

## Redux Implementation

The theme system is implemented using Redux Toolkit with the following components:

### Theme Slice

Located at `src/redux/features/theme/themeSlice.ts`, the theme slice defines:

- State structure for theme settings
- Actions for modifying theme settings
- Reducers that handle state changes
- Persistence logic using localStorage

### Key State Properties

```typescript
interface ThemeState {
  mode: 'light' | 'dark' | 'system';
  accentColor: 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'teal';
  fontSize: 'normal' | 'large' | 'extra-large';
  reducedMotion: boolean;
  highContrast: boolean;
  customSchemes: ColorScheme[];
  activeSchemeId: string | null;
  systemPrefersDark: boolean;
}
```

### Available Actions

- `setThemeMode`: Set theme mode (light/dark/system)
- `toggleThemeMode`: Toggle between light and dark modes
- `setAccentColor`: Set the accent color
- `setFontSize`: Set the font size
- `toggleReducedMotion`: Toggle reduced motion setting
- `toggleHighContrast`: Toggle high contrast setting
- `addCustomColorScheme`: Add a new color scheme
- `updateCustomColorScheme`: Update an existing color scheme
- `removeCustomColorScheme`: Remove a color scheme
- `setActiveColorScheme`: Set the active color scheme
- `setSystemPrefersDark`: Update system preference detection

## Theme Features

The theme system provides the following features:

1. **Light/Dark Mode**
   - Manual selection (light/dark)
   - System preference detection
   - Automatic application to UI

2. **Accent Colors**
   - Predefined color options
   - Applied to primary UI elements

3. **Custom Color Schemes**
   - Create, edit, and delete custom color schemes
   - Define all color variables in a scheme
   - Switch between schemes

4. **Accessibility Features**
   - Font size adjustment
   - Reduced motion option
   - High contrast mode

5. **Persistence**
   - All settings are saved to localStorage
   - Settings are restored on page reload

## Using the Theme System

### Initialization

Add the `ThemeInitializer` component near the root of your application:

```tsx
// In your layout or root component
import { ThemeInitializer } from "@/components/shared/theme/theme-initializer";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ThemeInitializer />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
```

### Theme Controls

Add theme controls to your UI:

```tsx
import { ThemeToggle } from "@/components/shared/theme/theme-toggle";
import { ThemeCustomizer } from "@/components/shared/theme/theme-customizer";

export function Header() {
  return (
    <header>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ThemeCustomizer />
      </div>
    </header>
  );
}
```

### Accessing Theme State in Components

Access theme state directly from Redux:

```tsx
import { useAppSelector } from "@/redux/hooks";

export function MyComponent() {
  const { mode, accentColor } = useAppSelector(state => state.theme);
  
  return (
    <div>
      <p>Current theme: {mode}</p>
      <p>Accent color: {accentColor}</p>
    </div>
  );
}
```

### Dispatching Theme Actions

Dispatch theme actions directly:

```tsx
import { useAppDispatch } from "@/redux/hooks";
import { setThemeMode, toggleThemeMode } from "@/redux/features/theme/themeSlice";

export function ThemeControls() {
  const dispatch = useAppDispatch();
  
  return (
    <div>
      <button onClick={() => dispatch(setThemeMode('light'))}>
        Light Mode
      </button>
      <button onClick={() => dispatch(setThemeMode('dark'))}>
        Dark Mode
      </button>
      <button onClick={() => dispatch(toggleThemeMode())}>
        Toggle Mode
      </button>
    </div>
  );
}
```

## Extending the Theme System

### Adding New Accent Colors

To add new accent colors:

1. Update the `AccentColor` type in `themeSlice.ts`:

```typescript
export type AccentColor = 'orange' | 'blue' | 'green' | 'purple' | 'red' | 'teal' | 'pink';
```

2. Update the validation in `getInitialAccentColor` function
3. Add the new color to the UI in `ThemeCustomizer`
4. Add the color to your Tailwind configuration if needed

### Creating New Color Schemes

Color schemes can be created through the UI or programmatically:

```typescript
import { useAppDispatch } from "@/redux/hooks";
import { addCustomColorScheme } from "@/redux/features/theme/themeSlice";
import { v4 as uuidv4 } from 'uuid';

export function AddDefaultSchemes() {
  const dispatch = useAppDispatch();
  
  const addCorporateScheme = () => {
    dispatch(addCustomColorScheme({
      id: uuidv4(),
      name: "Corporate",
      colors: {
        background: "0 0% 100%",
        foreground: "222 47% 11%",
        primary: "221 83% 53%",
        primaryForeground: "0 0% 100%",
        // Add all required colors...
      }
    }));
  };
  
  return (
    <button onClick={addCorporateScheme}>
      Add Corporate Theme
    </button>
  );
}
```

### Adding New Theme Properties

To add new theme properties:

1. Update the `ThemeState` interface in `themeSlice.ts`
2. Add initial state and persistence logic
3. Create new actions and reducers
4. Update UI components to use the new properties

## Integration with shadcn/ui

The theme system integrates with shadcn/ui components through CSS variables and Tailwind classes.

### CSS Variables

The theme system sets CSS variables that shadcn/ui components use:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 224 71% 4%;
  --primary: 24 89% 55%;
  /* other variables */
}

.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;
  /* other variables */
}
```

### Example Usage with shadcn/ui

```tsx
import { useAppSelector } from "@/redux/hooks";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ThemedComponent() {
  const { mode, fontSize, reducedMotion } = useAppSelector(state => state.theme);
  
  // Apply conditional classes based on theme settings
  const buttonClasses = cn(
    "transition-all",
    reducedMotion && "transition-none",
    fontSize === "large" && "text-lg py-3",
    fontSize === "extra-large" && "text-xl py-4"
  );
  
  return (
    <Card className="p-4">
      <h2>Themed Component</h2>
      <p>Current theme: {mode}</p>
      <Button className={buttonClasses}>
        Themed Button
      </Button>
    </Card>
  );
}
```

## Best Practices

1. **Direct Redux Usage**
   - Always use Redux directly for theme state management
   - Dispatch actions directly rather than through helper functions

2. **CSS Variables**
   - Use CSS variables for theme values when possible
   - Avoid hardcoding colors in components

3. **Conditional Classes**
   - Use the `cn` utility for conditional class application
   - Create responsive designs that work well in all theme modes

4. **Accessibility**
   - Always consider accessibility when implementing themed components
   - Test with screen readers and keyboard navigation

5. **Performance**
   - Avoid unnecessary re-renders by selecting only needed state
   - Use memoization for complex theme-dependent calculations
