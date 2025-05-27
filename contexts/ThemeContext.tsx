import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors, { ThemeMode, getThemeColors } from '@/constants/Colors';

type ThemeContextType = {
  theme: ThemeMode;
  colors: ReturnType<typeof getThemeColors>;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemColorScheme = useColorScheme() as ThemeMode;
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      
      if (savedTheme) {
        setThemeState(savedTheme);
      } else {
        // If no saved theme, use system preference
        setThemeState(systemColorScheme || 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference', error);
      setThemeState('dark'); // Default to dark theme on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadThemePreference();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  if (isLoading) {
    return null; // or a loading spinner
  }

  const colors = getThemeColors(theme);

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
