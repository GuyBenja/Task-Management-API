import React, { useLayoutEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import Screen from "../components/layout/Screen";
import AppButton from "../components/ui/AppButton";
import FiltersBar from "../components/FiltersBar";
import TaskCard from "../components/TaskCard";
import { theme } from "../theme";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../hooks/useTasks";

export default function TasksScreen({ navigation }: any) {
  const { logout } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  // Put Logout in the header (top-right)
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <AppButton title="Logout" color="#555" onPress={logout} />
      ),
    });
  }, [navigation, logout]);

  const {
    tasks,
    counts,
    status,
    sortBy,
    hasMore,
    loading,
    setStatus,
    setSortBy,
    loadMore,
    refresh,
    onDelete,
    onStatus,
    onPriority,
  } = useTasks({ status: "ALL", sortBy: "id", pageSize: 10 });

  return (
    <Screen>
      {/* Top actions: New Task + Filters toggle */}
      <View
        style={{
          padding: theme.spacing.md,
          flexDirection: "row",
          gap: theme.spacing.sm,
          flexWrap: "wrap",
        }}
      >
        <AppButton
          title="New Task"
          onPress={() => navigation.navigate("NewTask")}
        />
        <AppButton
          title={showFilters ? "Hide Filters" : "Show Filters"}
          onPress={() => setShowFilters((v) => !v)}
        />
      </View>

      {/* Collapsible filters */}
      {showFilters && (
        <FiltersBar
          status={status}
          sortBy={sortBy}
          counts={counts}
          onChangeStatus={setStatus}
          onChangeSort={setSortBy}
        />
      )}

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: theme.spacing.md }}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onUpdateStatus={onStatus}
            onUpdatePriority={onPriority}
            onDelete={onDelete}
          />
        )}
        onEndReachedThreshold={0.5}
        onEndReached={() => {
          if (hasMore && !loading) loadMore();
        }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: theme.spacing.xl }}>
            No tasks
          </Text>
        }
      />
    </Screen>
  );
}
