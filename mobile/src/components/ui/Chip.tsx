import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { theme } from "../../theme";

type Props = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export default function Chip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radii.pill,
        borderWidth: 1,
        borderColor: theme.colors.border,
        backgroundColor: active
          ? theme.colors.chipActiveBg
          : theme.colors.chipBg,
      }}
    >
      <Text
        style={{
          color: active ? theme.colors.chipActiveText : theme.colors.text,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
