import { onMessage, onPending } from "@/src/realtime/socket";
import type { Message } from "@/src/utils/api";
import { api } from "@/src/utils/api";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "./UserContext";

export type ChatListRow = {
  id: string;
  title: string;
  lastMessageText?: string;
  lastMessageAt?: string | null;
  unreadCount?: number;
};

type Subscriber = (msgs: Message[]) => void;

type Ctx = {
  me: { id: string; email: string } | null;
  chats: ChatListRow[];
  loadingChats: boolean;
  refreshChats: () => Promise<void>;

  getMessages: (chatKey: string) => Promise<Message[]>;
  subscribe: (chatKey: string, cb: Subscriber) => () => void;
  sendMessage: (chatKey: string, text: string) => Promise<void>;
};

const ChatCtx = createContext<Ctx | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { token, me } = useUser();

  const messagesByConv = useRef(new Map<string, Message[]>());
  const subsByConv = useRef(new Map<string, Set<Subscriber>>());
  const convByContact = useRef(new Map<string, string>());

  const [chats, setChats] = useState<ChatListRow[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);

  function emit(conversationId: string) {
    const subs = subsByConv.current.get(conversationId);
    const list = messagesByConv.current.get(conversationId) || [];
    if (subs) subs.forEach((fn) => fn(list));
  }

  useEffect(() => {
    onPending((msgs) => {
      for (const m of msgs) {
        const list = messagesByConv.current.get(m.conversationId) || [];
        if (!list.find((x) => x.id === m.id)) {
          list.push(m);
          list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          messagesByConv.current.set(m.conversationId, list);
        }
        if (me && m.senderId !== me.id) {
          convByContact.current.set(m.senderId, m.conversationId);
        }
        emit(m.conversationId);
      }
      refreshChats().catch(() => {});
    });
    onMessage((m) => {
      const list = messagesByConv.current.get(m.conversationId) || [];
      if (!list.find((x) => x.id === m.id)) {
        list.push(m);
        list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
        messagesByConv.current.set(m.conversationId, list);
      }
      if (me && m.senderId !== me.id) {
        convByContact.current.set(m.senderId, m.conversationId);
      }
      emit(m.conversationId);
      refreshChats().catch(() => {});
    });
  }, [me?.id, token]);

  async function getMessages(chatKey: string) {
    if (!token) return [];
    const conv = convByContact.current.get(chatKey) || chatKey;
    const have = messagesByConv.current.get(conv);
    if (have) return have;
    try {
      const msgs = await api.getMessages(token, conv);
      messagesByConv.current.set(conv, msgs);
      return msgs;
    } catch {
      return [];
    }
  }

  function subscribe(chatKey: string, cb: Subscriber) {
    const conv = convByContact.current.get(chatKey) || chatKey;
    let set = subsByConv.current.get(conv);
    if (!set) {
      set = new Set();
      subsByConv.current.set(conv, set);
    }
    set.add(cb);
    const curr = messagesByConv.current.get(conv) || [];
    cb(curr);
    return () => {
      const s = subsByConv.current.get(conv);
      if (!s) return;
      s.delete(cb);
      if (s.size === 0) subsByConv.current.delete(conv);
    };
  }

  async function sendMessage(chatKey: string, text: string) {
    if (!token) return;
    const toUserId = chatKey;
    const { conversationId, message } = await api.sendMessage(token, toUserId, text);
    convByContact.current.set(toUserId, conversationId);
    const list = messagesByConv.current.get(conversationId) || [];
    list.push(message);
    list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    messagesByConv.current.set(conversationId, list);
    emit(conversationId);
    await refreshChats();
  }

  async function refreshChats() {
    if (!token) {
      setChats([]);
      return;
    }
    setLoadingChats(true);
    try {
      const convs = await api.getConversations(token);
      const rows: ChatListRow[] = [];
      for (const c of convs) {
        const msgs = await api.getMessages(token, c.id).catch(() => []);
        const last = msgs.length ? msgs[msgs.length - 1] : undefined;
        const unread = msgs.filter((m) => m.senderId !== me?.id && !m.readAt).length;
        rows.push({
          id: c.id,
          title: c.type === "direct" ? "Direct" : c.type,
          lastMessageText: last?.content,
          lastMessageAt: last?.createdAt ?? null,
          unreadCount: unread,
        });
        if (msgs.length) messagesByConv.current.set(c.id, msgs);
      }
      setChats(rows.sort((a, b) => {
        const ta = a.lastMessageAt ?? "";
        const tb = b.lastMessageAt ?? "";
        return tb.localeCompare(ta);
      }));
    } catch (e) {
      console.warn("refreshChats error:", (e as Error).message);
    } finally {
      setLoadingChats(false);
    }
  }

  useEffect(() => {
    refreshChats().catch(() => {});
  }, [token]);

  const value: Ctx = useMemo(() => ({
    me: me ? { id: me.id, email: me.email } : null,
    chats,
    loadingChats,
    refreshChats,
    getMessages,
    subscribe,
    sendMessage,
  }), [me?.id, chats, loadingChats, token]);

  return <ChatCtx.Provider value={value}>{children}</ChatCtx.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatCtx);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}