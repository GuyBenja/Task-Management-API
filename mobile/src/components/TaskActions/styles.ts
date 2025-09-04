import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: theme.colors.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    alignItems: 'center',
  },
  dangerRow: {
    marginTop: theme.spacing.sm,
  },
});
