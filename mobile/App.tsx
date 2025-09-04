import "react-native-gesture-handler";
import React from "react";
import { AuthProvider } from "./src/context/AuthContext";
import RootNavigator from "./src/navigation";

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
