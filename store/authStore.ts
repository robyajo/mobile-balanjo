import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const isWeb = Platform.OS === "web";

// Get API URL from environment variables
const API_URL = process.env.EXPO_PUBLIC_API_URL || "https://api.balanjo.web.id";

interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  avatar: string;
  avatar_url: string;
  role: string;
  active: string;
  profile: string;
  email_verified_at: string;
  created_at: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  accessTokenExpiration: number | null;
  _hasHydrated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setHasHydrated: (value: boolean) => void;
  checkAuth: () => Promise<boolean>;
  updateAuthData: (data: {
    accessToken?: string;
    refreshToken?: string;
    user?: User;
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
      login: async (email: string, password: string) => {
        try {
          console.log("Attempting login for user:", email);

          // Try main API first
          let apiUrl = `${API_URL}/api/auth/login`;

          // Call API to Login
          let response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email,
              password,
            }),
            credentials: "include",
          });

          console.log("Login response status:", response.status);

          // If main API fails, try fallback (for testing)
          if (!response.ok && response.status >= 500) {
            console.log("Main API failed, trying fallback...");
            apiUrl = "https://dummyjson.com/auth/login";
            response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                username: email, // Map email to username for fallback API
                password,
              }),
            });
            console.log("Fallback response status:", response.status);
          }

          console.log(
            "Login response headers:",
            Object.fromEntries(response.headers.entries())
          );

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Login failed with status:", response.status);
            console.error("Error response:", errorText);

            // Try to parse as JSON if possible
            try {
              const errorData = JSON.parse(errorText);
              throw new Error(
                `Login failed: ${errorData.message || "Unknown error"}`
              );
            } catch (parseError) {
              throw new Error(
                `Login failed with status ${response.status}: ${errorText}`
              );
            }
          }

          const data = await response.json();
          console.log("Login successful, received data:", data);

          // Handle different response structures
          let accessToken, userData;

          if (data.access_token) {
            // Main API structure
            accessToken = data.access_token;
            userData = data.data;
          } else if (data.token) {
            // Fallback API structure
            accessToken = data.token;
            userData = {
              id: data.id,
              name: data.firstName + " " + data.lastName,
              email: data.email,
              avatar_url: data.image,
              role: "User",
              active: "active",
            };
          }

          const dataAuth = {
            isAuthenticated: true,
            accessToken: accessToken,
            refreshToken: undefined,
            user: userData,
            accessTokenExpiration: Date.now() + 60 * 60 * 1000, // Default 1 hour
          };

          // Set to Zustand (persist will handle storage)
          set(dataAuth);
          console.log("Auth state updated successfully");
          return true;
        } catch (error) {
          console.error("Login error:", error);
          return false;
        }
      },
      logout: async () => {
        try {
          // Get current state to access accessToken
          const currentState = useAuthStore.getState();
          console.log("Current state:", currentState);
          // Call logout API endpoint with authorization header
          await fetch(`${API_URL}/api/auth/logout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentState.accessToken}`,
            },
            credentials: "include", // Include cookies in the request
          });
          console.log("Logout API call completed");
        } catch (error) {
          console.error("Logout API call failed:", error);
          // Continue with local logout even if API call fails
        }

        // Clear local auth state regardless of API response
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          accessTokenExpiration: null,
        });

        console.log("Local logout completed");
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
          isAuthenticated:
            data.isAuthenticated !== undefined
              ? data.isAuthenticated
              : data.accessToken
              ? true
              : state.isAuthenticated,
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

          // Try main API first
          let apiUrl = `${API_URL}/api/auth/refresh`;

          // Call refresh token API endpoint according to documentation
          let response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
            credentials: "include", // Include cookies in the request
          });

          console.log("Refresh response status:", response.status);

          // If main API fails, try fallback
          if (!response.ok && response.status >= 500) {
            console.log("Main refresh API failed, trying fallback...");
            apiUrl = "https://dummyjson.com/auth/refresh";
            response = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            });
            console.log("Fallback refresh response status:", response.status);
          }

          if (!response.ok) {
            throw new Error(`Failed to refresh token: ${response.status}`);
          }

          const data = await response.json();
          console.log("Refresh token response:", data);

          // Handle different response structures
          let accessToken, userData;

          if (data.access_token) {
            // Main API structure
            accessToken = data.access_token;
            userData = data.data || currentState.user;
          } else if (data.token) {
            // Fallback API structure
            accessToken = data.token;
            userData = currentState.user; // Keep existing user data
          }

          // Update auth data with new tokens
          currentState.updateAuthData({
            accessToken: accessToken,
            refreshToken: undefined, // API doesn't provide refresh token
            user: userData,
            accessTokenExpiration: Date.now() + 60 * 60 * 1000, // Default 1 hour
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
    }
  )
);
