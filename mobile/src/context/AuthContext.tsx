import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import { setAuthToken } from "../api/client";
import { login as apiLogin, register as apiRegister } from "../api/auth";

type AuthContextType = {
  token: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  token: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load token from secure storage at startup
  useEffect(() => {
    (async () => {
      const t = await SecureStore.getItemAsync("token");
      setToken(t);
      setAuthToken(t);
      setLoading(false);
    })();
  }, []);

  const actions = useMemo(
    () => ({
      login: async (username: string, password: string) => {
        const { success, data, error } = await apiLogin(username, password);
        if (!success || !data?.token)
          throw new Error(error?.details || "Login failed");
        await SecureStore.setItemAsync("token", data.token);
        setToken(data.token);
        setAuthToken(data.token);
      },
      register: async (username: string, password: string) => {
        const reg = await apiRegister(username, password);
        if (!reg.success)
          throw new Error(reg.error?.details || "Register failed");
        const { success, data, error } = await apiLogin(username, password);
        if (!success || !data?.token)
          throw new Error(error?.details || "Login failed");
        await SecureStore.setItemAsync("token", data.token);
        setToken(data.token);
        setAuthToken(data.token);
      },
      logout: async () => {
        await SecureStore.deleteItemAsync("token");
        setToken(null);
        setAuthToken(null);
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ token, loading, ...actions }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
