import { useColorScheme } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemeProvider as NavigationThemeProvider, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme } from "@react-navigation/native";
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "/",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    hafs: require('../assets/fonts/hafs.ttf'),
    warsh: require('../assets/fonts/warsh.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <CustomThemeProvider>
      <RootLayoutNav />
    </CustomThemeProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const defaultTheme = colorScheme === "dark" ? NavigationDarkTheme : NavigationDefaultTheme;

  return (
    <NavigationThemeProvider value={defaultTheme}>
      <StatusBar style="auto" />
      <Stack screenOptions={{ autoHideHomeIndicator: true, headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="surah" options={{ headerShown: false }} />
        <Stack.Screen name="mushaf" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="bookmarks" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="search" options={{ headerShown: false, presentation: 'modal' }} />
        <Stack.Screen name="theme" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}
