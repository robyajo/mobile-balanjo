import { useAuthStore } from "@/store/authStore";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
const isWeb = Platform.OS === "web";

if (!isWeb) {
  SplashScreen.preventAutoHideAsync();
}

export default function RootLayout() {
  const { isAuthenticated, _hasHydrated, checkAuth } = useAuthStore();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  console.log("isAuthenticated", isAuthenticated);

  useEffect(() => {
    if (_hasHydrated) {
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated]);

  useEffect(() => {
    const performAuthCheck = async () => {
      if (_hasHydrated && !hasCheckedAuth) {
        try {
          const isAuthValid = await checkAuth();
          console.log("Auth check result:", isAuthValid);

          if (isAuthValid) {
            // Valid auth found in storage, user should be authenticated
            console.log("Valid authentication found in storage");
          } else {
            // No valid auth found, ensure user is logged out
            console.log("No valid authentication found in storage");
          }
        } catch (error) {
          console.error("Error during auth check:", error);
        } finally {
          setHasCheckedAuth(true);
          setIsLoading(false);
        }
      }
    };

    performAuthCheck();
  }, [_hasHydrated, hasCheckedAuth, checkAuth]);

  // Show loading only during initial hydration check
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
      </Stack.Protected>
    </Stack>
  );
}
