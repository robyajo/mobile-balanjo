import { Link } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

export default function Index() {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, styles.circle1]} />
      <View style={[styles.circle, styles.circle2]} />
      <View style={[styles.circle, styles.circle3]} />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>✨</Text>
          </View>
          <Text style={styles.title}>Selamat Datang</Text>
          <Text style={styles.subtitle}>
            Mulai perjalanan Anda bersama kami
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <View style={styles.primaryButton}>
            <Link href="/login" asChild>
              <TouchableOpacity style={styles.buttonContent} activeOpacity={0.8}>
                <Text style={styles.primaryButtonText}>Masuk</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <Link href="/register" asChild>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.footerText}>
          Dengan melanjutkan, Anda menyetujui{"\n"}
          <Text style={styles.linkText}>Syarat & Ketentuan</Text> dan{" "}
          <Text style={styles.linkText}>Kebijakan Privasi</Text>
        </Text>
      </View>
    </View>
  );
}

// Styles tetap sama...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
    backgroundColor: "#667eea", // Fallback color
  },
  circle: {
    position: "absolute",
    borderRadius: 1000,
    opacity: 0.1,
    backgroundColor: "#ffffff",
  },
  circle1: {
    width: 300,
    height: 300,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 200,
    height: 200,
    bottom: 100,
    left: -50,
  },
  circle3: {
    width: 150,
    height: 150,
    top: height / 2,
    right: 50,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: height * 0.15,
    paddingBottom: 50,
  },
  headerSection: {
    alignItems: "center",
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  logoText: {
    fontSize: 50,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 16,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    backgroundColor: "#ffffff", // Fallback for gradient
  },
  buttonContent: {
    paddingVertical: 18,
    alignItems: "center",
    backgroundColor: "#ffffff", // Solid color fallback
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#667eea",
  },
  secondaryButton: {
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 18,
  },
  linkText: {
    fontWeight: "600",
    color: "#ffffff",
    textDecorationLine: "underline",
  },
});
