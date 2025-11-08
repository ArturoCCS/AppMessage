import { API_URL } from "./config";

export type User = {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  deliveredAt?: string | null;
  readAt?: string | null;
};

export type Conversation = {
  id: string;
  type: string;
  createdAt: string;
};

async function request<T>(path: string, opts: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  const text = await res.text();
  let data: any;
  try { data = text ? JSON.parse(text) : undefined; } catch {}
  if (!res.ok) {
    const err = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(err);
  }
  return data as T;
}

export const api = {
  requestOtp(email: string) {
    return request<{ ok: true }>("/auth/request-otp", { method: "POST", body: JSON.stringify({ email }) });
  },
  verifyOtp(email: string, code: string) {
    return request<{ token: string; user: User }>("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code }) });
  },
  me(token: string) {
    return request<User>("/me", { headers: { Authorization: `Bearer ${token}` } });
  },

  listContacts(token: string) {
    return request<Array<{ id: string; email: string; name?: string | null; avatarUrl?: string | null; status?: string }>>(
      "/contacts",
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
  addContactByUserId(token: string, userId: string) {
    return request<{ ok: true }>("/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` } as any,
      body: JSON.stringify({ userId }),
    });
  },
  addContactByEmail(token: string, email: string) {
    return request<{ ok: true }>("/contacts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` } as any,
      body: JSON.stringify({ email }),
    });
  },
  removeContact(token: string, userId: string) {
    return request<{ ok: true }>(`/contacts/${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` } as any,
    });
  },

  getConversations(token: string) {
    return request<Conversation[]>("/conversations", { headers: { Authorization: `Bearer ${token}` } });
  },
  getMessages(token: string, conversationId: string, since?: string) {
    const q = new URLSearchParams({ conversationId, ...(since ? { since } : {}) }).toString();
    return request<Message[]>(`/messages?${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
  sendMessage(token: string, toUserId: string, content: string) {
    return request<{ conversationId: string; message: Message }>(
      "/messages",
      { method: "POST", headers: { Authorization: `Bearer ${token}` } as any, body: JSON.stringify({ toUserId, content }) }
    );
  },
  ackRead(token: string, conversationId: string, until?: string) {
    return request<{ ok: true }>(
      "/messages/ack-read",
      { method: "POST", headers: { Authorization: `Bearer ${token}` } as any, body: JSON.stringify({ conversationId, ...(until ? { until } : {}) }) }
    );
  },

  sync(token: string, since?: string) {
    const q = since ? `?since=${encodeURIComponent(since)}` : "";
    return request<{ messages: Message[] }>(`/sync${q}`, { headers: { Authorization: `Bearer ${token}` } });
  },
};

// Acepta avatarUrl null explícitamente
export function updateProfile(token: string, data: { name?: string | null; avatarUrl?: string | null }) {
  return request<{ ok: true; user?: User }>("/me", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` } as any,
    body: JSON.stringify(data),
  });
}

export async function uploadAvatar(token: string, fileUri: string) {
  const filename = fileUri.split("/").pop() || "avatar.jpg";
  const match = /\.(\w+)$/.exec(filename);
  const ext = (match ? match[1] : "jpg").toLowerCase();
  const type = `image/${ext === "jpg" ? "jpeg" : ext}`;

  const form = new FormData();
  // @ts-ignore FormData para RN
  form.append("avatar", { uri: fileUri, name: filename, type });

  const res = await fetch(`${API_URL}/me/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` } as any,
    body: form as any,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return await res.json();
}