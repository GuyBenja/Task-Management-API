import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import TasksScreen from "../screens/TasksScreen";
import NewTaskScreen from "../screens/NewTaskScreen";
import { useAuth } from "../context/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tasks: undefined;
  NewTask: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { token, loading } = useAuth();
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {token ? (
          <>
            <Stack.Screen
              name="Tasks"
              component={TasksScreen}
              options={{ title: "Tasks" }}
            />
            <Stack.Screen
              name="NewTask"
              component={NewTaskScreen}
              options={{ title: "New Task" }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: "Login" }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Register" }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
