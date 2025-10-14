import { useAuthStore } from "@/store/authStore";
import React from "react";
import { Button, Text, View, StyleSheet, Image, TouchableOpacity, Alert } from "react-native";

const Profile = () => {
  const { logout, user, isAuthenticated } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Apakah Anda yakin ingin keluar?",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Keluar",
          style: "destructive",
          onPress: logout,
        },
      ]
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>User tidak terautentikasi</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user.name || "Nama User"}</Text>
        <Text style={styles.role}>{user.role || "Role"}</Text>
      </View>

      {/* User Information Section */}
      <View style={styles.infoSection}>
        <View style={styles.infoItem}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email || "Tidak ada email"}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Telepon</Text>
          <Text style={styles.value}>{user.phone || "Tidak ada telepon"}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Alamat</Text>
          <Text style={styles.value}>
            {user.address && user.city
              ? `${user.address}, ${user.city}`
              : "Tidak ada alamat"}
          </Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.label}>Status</Text>
          <Text style={[styles.value, styles.status]}>
            {user.active === "active" ? "Aktif" : "Tidak Aktif"}
          </Text>
        </View>

        {user.email_verified_at && (
          <View style={styles.infoItem}>
            <Text style={styles.label}>Email Terverifikasi</Text>
            <Text style={styles.value}>
              {new Date(user.email_verified_at).toLocaleDateString("id-ID")}
            </Text>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Keluar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#667eea",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  role: {
    fontSize: 16,
    color: "#667eea",
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: "#333",
    flex: 2,
    textAlign: "right",
  },
  status: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  buttonSection: {
    marginTop: 10,
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginTop: 50,
  },
});

export default Profile;
