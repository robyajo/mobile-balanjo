import { useAuthStore } from "@/store/authStore";
import React from "react";
import { Button, Text, View } from "react-native";

const profile = () => {
  const { logout } = useAuthStore();
  return (
    <View>
      <Text>profile</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
};

export default profile;
