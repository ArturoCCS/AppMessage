import { connectSocket, disconnectSocket } from "@/src/realtime/socket";
import { api, updateProfile as apiUpdateProfile, uploadAvatar as apiUploadAvatar, type User } from "@/src/utils/api";
import { API_URL } from "@/src/utils/config";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
  loading: boolean;
  me: (User & { avatar?: string | null }) | null;
  token: string | null;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateName: (name: string) => Promise<void>;
  updateAvatar: (uri?: string) => Promise<void>;
  removeAvatar: () => Promise<void>;
  forceRefresh: () => Promise<void>;
};

const UserCtx = createContext<Ctx | undefined>(undefined);
const TOKEN_KEY = "auth_token";

function qualifyAvatarUrl(u?: string | null): string | null {
  if (!u) return null;
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("/")) return `${API_URL}${u}`;
  return u;
}
function qualifyUser(u: User): User & { avatar?: string | null } {
  const avatarUrl = qualifyAvatarUrl(u.avatarUrl) ?? null;
  return { ...u, avatarUrl: avatarUrl || undefined, avatar: avatarUrl };
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [me, setMe] = useState<(User & { avatar?: string | null }) | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          setToken(saved);
          try {
            const u = await api.me(saved);
            if (!cancelled) {
              setMe(qualifyUser(u));
              connectSocket(saved);
            }
          } catch (e: any) {
            const msg = (e?.message || "").toLowerCase();
            if (msg.includes("401") || msg.includes("unauthorized")) {
              await SecureStore.deleteItemAsync(TOKEN_KEY);
              if (!cancelled) setToken(null);
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function forceRefresh() {
    if (!token) return;
    const u = await api.me(token);
    setMe(qualifyUser(u));
  }

  async function requestOtp(email: string) { await api.requestOtp(email); }

  async function verifyOtp(email: string, code: string) {
    const { token: tk, user } = await api.verifyOtp(email, code);
    setToken(tk);
    setMe(qualifyUser(user));
    await SecureStore.setItemAsync(TOKEN_KEY, tk);
    connectSocket(tk);
  }

  async function signOut() {
    setMe(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    disconnectSocket();
  }

  async function updateName(name: string) {
    if (!token) throw new Error("no_token");
    const trimmed = (name ?? "").trim();
    const payload = { name: trimmed === "" ? null : trimmed };
    const prev = me;
    setMe(p => p ? { ...p, name: payload.name } : p);
    try {
      const res = await apiUpdateProfile(token, payload);
      const updated = (res as any).user;
      if (updated) setMe(qualifyUser(updated));
      else await forceRefresh();
    } catch (e) {
      setMe(prev);
      throw e;
    }
  }

  async function updateAvatar(uri?: string) {
    if (!token) throw new Error("no_token");
    if (!uri) {
      const res = await apiUpdateProfile(token, { avatarUrl: null as any });
      const u = (res as any).user;
      if (u) setMe(qualifyUser(u));
      else {
        setMe(prev => prev ? { ...prev, avatarUrl: undefined, avatar: null } : prev);
        await forceRefresh();
      }
      return;
    }
    const res = await apiUploadAvatar(token, uri);
    const raw = (res as any).avatarUrl || ((res as any).user && (res as any).user.avatarUrl);
    const qualified = qualifyAvatarUrl(raw);
    if (qualified) {
      const bust = `${qualified}?t=${Date.now()}`;
      setMe(prev => prev ? { ...prev, avatarUrl: bust, avatar: bust } : prev);
    }
    await forceRefresh();
  }

  async function removeAvatar() {
    await updateAvatar(undefined);
  }

  const value: Ctx = useMemo(() => ({
    loading, me, token,
    requestOtp, verifyOtp, signOut,
    updateName, updateAvatar, removeAvatar,
    forceRefresh,
  }), [loading, me, token]);

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}