import React from "react";
import { TextInput, View, TextInputProps } from "react-native";
import { theme } from "../../theme";

export default function AppTextInput({ style, ...rest }: TextInputProps) {
  return (
    <View style={{ gap: theme.spacing.xs }}>
      <TextInput
        style={[
          {
            borderWidth: 1,
            borderColor: theme.colors.border,
            padding: theme.spacing.sm,
            borderRadius: theme.radii.md,
          },
          style,
        ]}
        placeholderTextColor={theme.colors.mutedText}
        {...rest}
      />
    </View>
  );
}
