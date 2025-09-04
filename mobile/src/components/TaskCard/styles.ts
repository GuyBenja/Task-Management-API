import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  dots: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.h2,
    fontWeight: '700',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  body: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  meta: {
    fontSize: theme.typography.small,
    color: theme.colors.mutedText,
  },
});
