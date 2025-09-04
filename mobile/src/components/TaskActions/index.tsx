import React from "react";
import { Modal, Pressable, View, Text } from "react-native";
import { styles } from "./styles";
import Chip from "../ui/Chip";
import AppButton from "../ui/AppButton";

type Status = "PENDING" | "LATE" | "DONE";
type Priority = "LOW" | "MID" | "HIGH";

type Props = {
  visible: boolean;
  onClose: () => void;
  currentStatus: Status;
  currentPriority: Priority;
  onChangeStatus: (s: Status) => void;
  onChangePriority: (p: Priority) => void;
  onDelete: () => void;
};

export default function TaskActions({
  visible,
  onClose,
  currentStatus,
  currentPriority,
  onChangeStatus,
  onChangePriority,
  onDelete,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Tap outside to dismiss */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Stop propagation when pressing inside the sheet */}
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View>
            <Text style={styles.sectionTitle}>Status</Text>
            <View style={styles.row}>
              {(["PENDING", "LATE", "DONE"] as const).map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={currentStatus === s}
                  onPress={() => onChangeStatus(s)}
                />
              ))}
            </View>
          </View>

          <View>
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.row}>
              {(["LOW", "MID", "HIGH"] as const).map((p) => (
                <Chip
                  key={p}
                  label={p}
                  active={currentPriority === p}
                  onPress={() => onChangePriority(p)}
                />
              ))}
            </View>
          </View>

          <View style={styles.dangerRow}>
            <AppButton title="Delete Task" color="#c00" onPress={onDelete} />
          </View>

          <AppButton title="Done" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
