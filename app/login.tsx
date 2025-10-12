import { useAuthStore } from "@/store/authStore";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const [userName, setUserName] = useState<any>("");
  const [password, setPassword] = useState<any>("");
  const { login } = useAuthStore();

  const handleLogin = async () => {
    const result = await login(userName, password);
    if (!result) {
      Alert.alert("Error", "Invalid Credential");
    }
  };
  return (
    <View style={styles.container}>
      <Text>Username</Text>
      <TextInput
        placeholder="Username"
        style={styles.input}
        value={userName}
        onChangeText={setUserName}
      />
      <Text>Password</Text>
      <TextInput
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
});
