import React from "react";
import { TouchableOpacity, Text, ViewStyle, TextStyle } from "react-native";
import { theme } from "../../theme";

type Props = {
  title: string;
  onPress?: () => void;
  color?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export default function AppButton({
  title,
  onPress,
  color,
  style,
  textStyle,
  disabled,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          backgroundColor: color ?? theme.colors.primary,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.md,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text
        style={[
          { color: "#fff", fontWeight: "600", textAlign: "center" },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}
