import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const isWeb = Platform.OS === "web";

interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: object | null;
  accessTokenExpiration: number | null;
  _hasHydrated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  checkAuth: () => Promise<boolean>;
  updateAuthData: (data: {
    accessToken?: string;
    refreshToken?: string;
    user?: object;
    accessTokenExpiration?: number;
    isAuthenticated?: boolean;
  }) => void;
  refreshAccessToken: () => Promise<boolean>;
}

export const useAuthStore = create(
  persist<AuthStore>(
    (set) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
      accessTokenExpiration: null,
      _hasHydrated: false,
      login: async (username: string, password: string) => {
        try {
          // Call API to Login
          const response = await fetch("https://dummyjson.com/auth/login", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              username,
              password,
            }),
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          const dataAuth = {
            isAuthenticated: true,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            user: data,
            accessTokenExpiration: Date.now() + (60 * 60 * 1000),
          };
          // Set to Zustand (persist will handle storage)
          set(dataAuth);
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          accessTokenExpiration: null,
        });
      },
      setHasHydrated: (value: boolean) => {
        set({ _hasHydrated: value });
      },
      checkAuth: async () => {
        try {
          if (isWeb) {
            // Check localStorage for web
            const stored = localStorage.getItem("auth-store");
            if (!stored) return false;

            const data = JSON.parse(stored);
            if (!data.state?.isAuthenticated || !data.state?.accessToken) {
              return false;
            }

            // Check if token is expired
            if (data.state?.accessTokenExpiration) {
              const now = Date.now();
              if (now >= data.state.accessTokenExpiration) {
                return false;
              }
            }

            // If we reach here, valid auth data exists in storage
            // Update the store state to reflect this
            useAuthStore.getState().updateAuthData({
              isAuthenticated: true,
              accessToken: data.state.accessToken,
              refreshToken: data.state.refreshToken,
              user: data.state.user,
              accessTokenExpiration: data.state.accessTokenExpiration,
            });

            return true;
          } else {
            // Check SecureStore for native
            const stored = await SecureStore.getItemAsync("auth-store");
            if (!stored) return false;

            const data = JSON.parse(stored);
            if (!data.state?.isAuthenticated || !data.state?.accessToken) {
              return false;
            }

            // Check if token is expired
            if (data.state?.accessTokenExpiration) {
              const now = Date.now();
              if (now >= data.state.accessTokenExpiration) {
                return false;
              }
            }

            // If we reach here, valid auth data exists in storage
            // Update the store state to reflect this
            useAuthStore.getState().updateAuthData({
              isAuthenticated: true,
              accessToken: data.state.accessToken,
              refreshToken: data.state.refreshToken,
              user: data.state.user,
              accessTokenExpiration: data.state.accessTokenExpiration,
            });

            return true;
          }
        } catch (error) {
          console.error("Error checking auth:", error);
          return false;
        }
      },
      updateAuthData: (data) => {
        set((state) => ({
          ...state,
          ...data,
          // Ensure isAuthenticated is true if we're updating with valid tokens
          isAuthenticated: data.isAuthenticated !== undefined
            ? data.isAuthenticated
            : (data.accessToken ? true : state.isAuthenticated),
        }));
      },
      refreshAccessToken: async () => {
        try {
          const currentState = useAuthStore.getState();

          // Prepare request body according to DummyJSON API
          const requestBody: any = {
            expiresInMins: 60, // optional, defaults to 60 minutes for access token
          };

          // Only include refreshToken if available (server can use cookies)
          if (currentState.refreshToken) {
            requestBody.refreshToken = currentState.refreshToken;
          }

          // Call refresh token API endpoint according to documentation
          const response = await fetch("https://dummyjson.com/auth/refresh", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            credentials: "include", // Include cookies in the request
          });

          if (!response.ok) {
            throw new Error(`Failed to refresh token: ${response.status}`);
          }

          const data = await response.json();
          console.log("Refresh token response:", data);

          // Update auth data with new tokens
          currentState.updateAuthData({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken || currentState.refreshToken, // Keep existing if not provided
            user: data.user || currentState.user,
            accessTokenExpiration: Date.now() + (data.expiresIn * 1000 || 60 * 60 * 1000), // Use returned expiration or default to 1 hour
            isAuthenticated: true,
          });

          console.log("Token refreshed successfully");
          return true;
        } catch (error) {
          console.error("Error refreshing token:", error);
          return false;
        }
      },
    }),
    {
      name: "auth-store",
      storage: isWeb
        ? createJSONStorage(() => localStorage)
        : createJSONStorage(() => ({
            setItem: (key: string, value: string) =>
              SecureStore.setItemAsync(key, value),
            getItem: (key: string) => SecureStore.getItemAsync(key),
            removeItem: (key: string) => SecureStore.deleteItemAsync(key),
          })),
      onRehydrateStorage: () => {
        return (state) => {
          state?.setHasHydrated(true);
        };
      },
    },
  ),
);
