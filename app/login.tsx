import { useAuthStore } from "@/store/authStore";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const { height } = Dimensions.get("window");

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { login } = useAuthStore();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) {
      setEmailError("");
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) {
      setPasswordError("");
    }
  };

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    const errors: string[] = [];

    if (!email.trim()) {
      setEmailError("Email is required.");
      errors.push("Email is required.");
    }
    if (!password.trim()) {
      setPasswordError("Password is required.");
      errors.push("Password is required.");
    }

    if (errors.length > 0) {
      // Set field-specific errors instead of showing alert
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      // Clear previous field errors first
      setEmailError("");
      setPasswordError("");

      // Try to parse the error message to extract the meaningful part
      let errorMessage = result.error || "Login gagal. Silakan coba lagi.";

      console.log("Raw error from API:", result.error);

      // If the error contains JSON-like structure, try to parse it
      if (result.error) {
        try {
          // Look for the JSON part in the error message
          const jsonStart = result.error.indexOf('{');
          const jsonEnd = result.error.lastIndexOf('}');

          if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
            const jsonString = result.error.substring(jsonStart, jsonEnd + 1);
            console.log("Extracted JSON:", jsonString);

            const errorData = JSON.parse(jsonString);
            console.log("Parsed error data:", errorData);

            if (errorData.errors) {
              // Set field-specific errors based on API response
              if (errorData.errors.email) {
                const emailErrors = Array.isArray(errorData.errors.email)
                  ? errorData.errors.email
                  : [errorData.errors.email];
                setEmailError(emailErrors[0]);
                console.log("Setting email error:", emailErrors[0]);
              }

              if (errorData.errors.password) {
                const passwordErrors = Array.isArray(errorData.errors.password)
                  ? errorData.errors.password
                  : [errorData.errors.password];
                setPasswordError(passwordErrors[0]);
                console.log("Setting password error:", passwordErrors[0]);
              }

              // For alert, use general message or first error
              if (errorData.message) {
                errorMessage = errorData.message;
              } else {
                const allErrors = [];
                if (errorData.errors.email) {
                  allErrors.push(...(Array.isArray(errorData.errors.email) ? errorData.errors.email : [errorData.errors.email]));
                }
                if (errorData.errors.password) {
                  allErrors.push(...(Array.isArray(errorData.errors.password) ? errorData.errors.password : [errorData.errors.password]));
                }
                errorMessage = allErrors[0] || "Validation failed";
              }
            } else if (errorData.message) {
              errorMessage = errorData.message;
              console.log("Using message:", errorMessage);
            }
          } else {
            console.log("No JSON structure found in error message");
          }
        } catch (parseError) {
          // If parsing fails, use the original error message
          console.log("Could not parse error message:", parseError);
          console.log("Parse error details:", parseError instanceof Error ? parseError.message : String(parseError));
        }
      }

      console.log("Final error message to display:", errorMessage);

      Alert.alert(
        "Login Gagal",
        errorMessage,
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Text style={styles.logoEmoji}>💰</Text>
              </View>
            </View>
            <Text style={styles.title}>Balanjo</Text>
            <Text style={styles.subtitle}>Kelola Keuangan Rumah Tangga</Text>
            <Text style={styles.description}>
              Catat dan kelola pengeluaran rumah tangga dengan mudah dan efisien
            </Text>
          </View>

          {/* Login Form Card */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Masuk ke Akun</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputContainer, email && styles.inputContainerActive]}>
                <Text style={[styles.inputIcon, email && styles.inputIconActive]}>📧</Text>
                <TextInput
                  placeholder="nama@email.com"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={email}
                  onChangeText={handleEmailChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputContainer, password && styles.inputContainerActive]}>
                <Text style={[styles.inputIcon, password && styles.inputIconActive]}>🔒</Text>
                <TextInput
                  placeholder="Masukkan password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  onChangeText={handlePasswordChange}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={[styles.eyeIcon, isLoading && styles.eyeIconDisabled]}>
                    {showPassword ? "🙈" : "👁️"}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotButton}
              onPress={() =>
                Alert.alert("Info", "Fitur lupa password segera hadir")
              }
              disabled={isLoading}
            >
              <Text style={[styles.forgotText, isLoading && styles.forgotTextDisabled]}>
                Lupa Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[
                styles.loginButton,
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                  <Text style={styles.loginButtonText}>Memproses...</Text>
                </View>
              ) : (
                <Text style={styles.loginButtonText}>Masuk</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Section */}
            <View style={styles.registerSection}>
              <Text style={styles.registerText}>Belum punya akun? </Text>
              <TouchableOpacity
                onPress={() => router.push("/register")}
                disabled={isLoading}
                style={styles.registerButton}
              >
                <Text style={[
                  styles.registerLink,
                  isLoading && styles.registerLinkDisabled
                ]}>
                  Daftar Sekarang
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Dengan masuk, Anda menyetujui{" "}
              <Text style={styles.footerLink}>Syarat & Ketentuan</Text> dan{" "}
              <Text style={styles.footerLink}>Kebijakan Privasi</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoEmoji: {
    fontSize: 36,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10B981",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    elevation: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: 56,
  },
  inputContainerActive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#10B981",
  },
  inputIcon: {
    fontSize: 18,
    marginRight: 12,
    color: "#9CA3AF",
  },
  inputIconActive: {
    color: "#10B981",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1F2937",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  eyeButton: {
    padding: 4,
  },
  eyeIcon: {
    fontSize: 18,
    color: "#6B7280",
  },
  eyeIconDisabled: {
    opacity: 0.5,
  },
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: 4,
    marginBottom: 24,
  },
  forgotText: {
    color: "#10B981",
    fontSize: 14,
    fontWeight: "600",
  },
  forgotTextDisabled: {
    opacity: 0.5,
  },
  loginButton: {
    backgroundColor: "#10B981",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    elevation: 4,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    color: "#6B7280",
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "500",
  },
  registerSection: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerText: {
    color: "#6B7280",
    fontSize: 15,
  },
  registerButton: {
    padding: 4,
  },
  registerLink: {
    color: "#10B981",
    fontSize: 15,
    fontWeight: "600",
  },
  registerLinkDisabled: {
    opacity: 0.5,
  },
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    color: "#10B981",
    fontWeight: "600",
  },
});
