import React from "react";
import { SafeAreaView, View } from "react-native";
import { theme } from "../../theme";

// Basic screen container
export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
