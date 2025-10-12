import { router } from "expo-router";
import { Button, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Button title="Login" onPress={() => router.push("/login")} />
      <Button title="Register" onPress={() => router.push("/register")} />
    </View>
  );
}
