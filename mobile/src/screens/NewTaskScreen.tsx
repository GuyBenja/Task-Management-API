import React, { useState } from "react";
import { Alert, Platform, View } from "react-native";
import Screen from "../components/layout/Screen";
import AppTextInput from "../components/ui/AppTextInput";
import AppButton from "../components/ui/AppButton";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createTask } from "../api/tasks";
import { theme } from "../theme";
import { PRIORITIES, Priority } from "../constants";
import Chip from "../components/ui/Chip";

export default function NewTaskScreen({ navigation }: any) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [priority, setPriority] = useState<Priority>("LOW");
  const [showPicker, setShowPicker] = useState(Platform.OS === "ios");

  async function onCreate() {
    try {
      const dueDate = date.getTime();
      const res = await createTask({ title, content, dueDate, priority });
      if (!res.success) throw new Error(res.error?.details || res.message);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Create failed", e?.message || "Unknown error");
    }
  }

  return (
    <Screen>
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <AppTextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
        />
        <AppTextInput
          placeholder="Content"
          value={content}
          onChangeText={setContent}
        />

        {Platform.OS !== "ios" && (
          <AppButton
            title={date.toLocaleString()}
            onPress={() => setShowPicker(true)}
          />
        )}
        {showPicker && (
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={(_, d) => {
              if (d) setDate(d);
              if (Platform.OS !== "ios") setShowPicker(false);
            }}
          />
        )}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: theme.spacing.sm,
          }}
        >
          {PRIORITIES.map((p) => (
            <Chip
              key={p}
              label={`Priority: ${p}`}
              active={priority === p}
              onPress={() => setPriority(p)}
            />
          ))}
        </View>

        <AppButton title="Create" onPress={onCreate} />
      </View>
    </Screen>
  );
}
