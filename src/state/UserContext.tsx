import { connectSocket, disconnectSocket } from "@/src/realtime/socket";
import { api, updateProfile as apiUpdateProfile, uploadAvatar as apiUploadAvatar, type User } from "@/src/utils/api";
import { API_URL } from "@/src/utils/config";
import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Ctx = {
  loading: boolean;
  me: User | null;
  token: string | null;
  requestOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: { name?: string }) => Promise<void>;
  uploadAvatar: (uri: string) => Promise<string>;
  removeAvatar: () => Promise<void>;
  exportIdentity: () => Promise<string>;
  updateName: (name: string) => Promise<void>;
  updateAvatar: (uri?: string) => Promise<void>;
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
  const [me, setMe] = useState<User | null>(null);

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
          } catch {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            if (!cancelled) setToken(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function requestOtp(email: string) {
    await api.requestOtp(email);
  }

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

  async function updateProfile(data: { name?: string }) {
    if (!token) throw new Error("no_token");
    console.log("[updateProfile] sending", data);
    const res = await apiUpdateProfile(token, data);
    const updated = (res as any).user || null;
    if (updated) {
      console.log("[updateProfile] response user.name =", updated.name);
      setMe(qualifyUser(updated));
    } else {
      const u = await api.me(token);
      console.log("[updateProfile] fallback /me name =", u.name);
      setMe(qualifyUser(u));
    }
  }

  async function uploadAvatar(uri: string) {
    if (!token) throw new Error("no_token");
    console.log("[uploadAvatar] uri", uri);
    const res = await apiUploadAvatar(token, uri);
    const raw = (res as any).avatarUrl || ((res as any).user && (res as any).user.avatarUrl);
    const qualified = qualifyAvatarUrl(raw);
    if (!qualified) throw new Error("avatarUrl_missing");
    const urlWithBuster = `${qualified}?t=${Date.now()}`;
    setMe(prev => prev ? { ...prev, avatarUrl: urlWithBuster } : prev);
    console.log("[uploadAvatar] updated avatarUrl =", urlWithBuster);
    return urlWithBuster;
  }

  async function removeAvatar() {
    if (!token) throw new Error("no_token");
    await apiUpdateProfile(token, { avatarUrl: "" as any });
    setMe(prev => prev ? { ...prev, avatarUrl: undefined } : prev);
  }

  async function exportIdentity() {
    if (!me) throw new Error("no_user");
    return JSON.stringify({
      id: me.id,
      email: me.email,
      name: me.name ?? null,
      avatarUrl: me.avatarUrl ?? null,
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  async function updateName(name: string) {
    await updateProfile({ name });
  }
  async function updateAvatar(uri?: string) {
    if (!uri) {
      await removeAvatar();
    } else {
      await uploadAvatar(uri);
    }
  }

  const value: Ctx = useMemo(() => ({
    loading, me, token,
    requestOtp, verifyOtp, signOut,
    updateProfile, uploadAvatar, removeAvatar, exportIdentity,
    updateName, updateAvatar,
  }), [loading, me, token]);

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>;
}

export function useUser() {
  const ctx = useContext(UserCtx);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}