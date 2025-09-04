import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { styles } from "./styles";
import dayjs from "dayjs";
import type { Task } from "../../types/task";
import TaskActions from "../TaskActions";
import { Entypo } from "@expo/vector-icons";

type Props = {
  task: Task;
  onUpdateStatus: (id: string, s: Task["status"]) => void;
  onUpdatePriority: (id: string, p: Task["priority"]) => void;
  onDelete: (id: string) => void;
};

export default function TaskCard({
  task,
  onUpdateStatus,
  onUpdatePriority,
  onDelete,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Helpers forwarded to the actions sheet
  const handleStatus = (s: Task["status"]) => onUpdateStatus(task.id, s);
  const handlePriority = (p: Task["priority"]) => onUpdatePriority(task.id, p);
  const handleDelete = () => onDelete(task.id);

  return (
    <View style={styles.card}>
      {/* Header: title + overflow menu */}
      <View style={styles.header}>
        <Text style={styles.title}>{task.title}</Text>
        <Pressable
          hitSlop={10}
          onPress={() => setMenuOpen(true)}
          style={styles.dots}
        >
          <Entypo name="dots-three-vertical" size={18} />
        </Pressable>
      </View>

      <Text style={styles.body}>{task.content}</Text>
      <Text style={styles.meta}>
        Due: {dayjs(task.dueDate).format("YYYY-MM-DD HH:mm")} | Status:{" "}
        {task.status} | Priority: {task.priority}
      </Text>

      {/* Per-task action sheet */}
      <TaskActions
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentStatus={task.status}
        currentPriority={task.priority}
        onChangeStatus={handleStatus}
        onChangePriority={handlePriority}
        onDelete={handleDelete}
      />
    </View>
  );
}
