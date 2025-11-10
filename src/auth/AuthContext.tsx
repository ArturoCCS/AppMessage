import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { connectSocket, disconnectSocket, onMessage, onPending } from "../realtime/socket";
import { api, type User } from "../utils/api";

type AuthContextType = {
  loading: boolean;
  user: User | null;
  token: string | null;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const TOKEN_KEY = "auth_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          setToken(saved);
          const u = await api.me(saved);
          setUser(u);
          connectSocket(saved);
          onPending((msgs) => console.log("PENDING:", msgs.length));
          onMessage((m) => console.log("NEW:", m.content));
        }
      } catch (e) {
        console.warn("auth bootstrap:", (e as Error).message);
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function requestOtp(email: string) {
    await api.requestOtp(email);
  }

  async function verifyOtp(email: string, code: string) {
    const { token, user } = await api.verifyOtp(email, code);
    setToken(token);
    setUser(user);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    connectSocket(token);
    onPending((msgs) => console.log("PENDING:", msgs.length));
    onMessage((m) => console.log("NEW:", m.content));
  }

  async function signOut() {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    disconnectSocket();
  }

  const value = useMemo(() => ({ loading, user, token, requestOtp, verifyOtp, signOut }), [loading, user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}