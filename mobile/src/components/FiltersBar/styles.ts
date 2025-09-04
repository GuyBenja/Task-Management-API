import { StyleSheet } from "react-native";
import { theme } from "../../theme";

export const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    alignItems: "center",
  },
});
