import React, { useState } from "react";
import { Alert, View } from "react-native";
import { useAuth } from "../context/AuthContext";
import AppTextInput from "../components/ui/AppTextInput";
import AppButton from "../components/ui/AppButton";
import Screen from "../components/layout/Screen";
import { theme } from "../theme";

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onLogin() {
    try {
      await login(username.trim(), password);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Unknown error");
    }
  }

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: theme.spacing.lg,
        }}
      >
        <View
          style={{
            width: "90%",
            maxWidth: 420,
            borderWidth: 1,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.lg,
            padding: theme.spacing.lg,
            gap: theme.spacing.sm,
            backgroundColor: theme.colors.bg,
          }}
        >
          <AppTextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <AppTextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <AppButton title="Login" onPress={onLogin} />
          <AppButton
            title="Create an account"
            onPress={() => navigation.navigate("Register")}
          />
        </View>
      </View>
    </Screen>
  );
}
