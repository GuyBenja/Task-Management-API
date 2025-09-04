import React from "react";
import { View, Text } from "react-native";
import { styles } from "./styles";
import Chip from "../ui/Chip";
import { STATUSES, SORTS, StatusFilter, SortKey } from "../../constants";

type Props = {
  status: StatusFilter;
  sortBy: SortKey;
  counts: Record<string, number>;
  onChangeStatus: (s: StatusFilter) => void;
  onChangeSort: (s: SortKey) => void;
};

export default function FiltersBar({
  status,
  sortBy,
  counts,
  onChangeStatus,
  onChangeSort,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text>Status:</Text>
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={`${s} (${counts[s] ?? 0})`}
            active={status === s}
            onPress={() => onChangeStatus(s)}
          />
        ))}
      </View>
      <View style={styles.row}>
        <Text>Sort:</Text>
        {SORTS.map((s) => (
          <Chip
            key={s}
            label={s}
            active={sortBy === s}
            onPress={() => onChangeSort(s)}
          />
        ))}
      </View>
    </View>
  );
}
