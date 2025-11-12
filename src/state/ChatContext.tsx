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
    
    // Primero busca si ya existe una conversación con este ID directo
    let conv = chatKey;
    
    // Si el chatKey no empieza con 'c_', busca por contacto
    if (!chatKey.startsWith('c_')) {
      const existingConv = convByContact.current.get(chatKey);
      if (existingConv) {
        conv = existingConv;
      }
    }
    
    const have = messagesByConv.current.get(conv);
    if (have) return have;
    
    try {
      const msgs = await api.getMessages(token, conv);
      messagesByConv.current.set(conv, msgs);
      
      // Mapea el contacto a esta conversación
      if (!chatKey.startsWith('c_')) {
        convByContact.current.set(chatKey, conv);
      }
      
      return msgs;
    } catch {
      return [];
    }
  }

  function subscribe(chatKey: string, cb: Subscriber) {
    // Busca conversación existente
    let conv = chatKey;
    if (!chatKey.startsWith('c_')) {
      const existingConv = convByContact.current.get(chatKey);
      if (existingConv) {
        conv = existingConv;
      }
    }
    
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

    // Busca conversación existente
    let conversationId = chatKey;
    
    // Si el chatKey empieza con 'c_', es un ID de conversación directo
    if (chatKey.startsWith('c_')) {
      conversationId = chatKey;
    } else {
      // Es un ID de contacto, busca si ya existe conversación
      const existingConv = convByContact.current.get(chatKey);
      if (existingConv) {
        conversationId = existingConv;
      } else {
        // Primera vez enviando a este contacto
        const res = await api.sendMessage(token, chatKey, text);
        conversationId = res.conversationId;
        convByContact.current.set(chatKey, conversationId);

        const message = res.message;
        const list = messagesByConv.current.get(conversationId) || [];
        if (!list.find((x) => x.id === message.id)) {
          list.push(message);
          list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
          messagesByConv.current.set(conversationId, list);
        }
        emit(conversationId);
        await refreshChats();
        return;
      }
    }

    // Envía mensaje a conversación existente
    const res = await api.sendMessage(token, conversationId, text);
    const message = res.message;
    const list = messagesByConv.current.get(conversationId) || [];
    
    // Evita duplicados
    if (!list.find((x) => x.id === message.id)) {
      list.push(message);
      list.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      messagesByConv.current.set(conversationId, list);
    }
    
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
      
      // Cuenta solo mensajes NO leídos que NO son míos
      const unread = msgs.filter((m) => {
        const isNotMine = m.senderId !== me?.id;
        const isUnread = !m.readAt;
        return isNotMine && isUnread;
      }).length;
      
      rows.push({
        id: c.id,
        title: c.type === "direct" ? "Direct" : c.type,
        lastMessageText: last?.content,
        lastMessageAt: last?.createdAt ?? null,
        unreadCount: unread,
      });
      
      if (msgs.length) {
        messagesByConv.current.set(c.id, msgs);
        
        // Mapea conversaciones a contactos
        msgs.forEach((m) => {
          if (m.senderId !== me?.id) {
            convByContact.current.set(m.senderId, c.id);
          }
        });
      }
    }
    
    // Ordena por mensaje más reciente
    const sorted = rows.sort((a, b) => {
      const ta = a.lastMessageAt ?? "";
      const tb = b.lastMessageAt ?? "";
      return tb.localeCompare(ta);
    });
    
    // Elimina duplicados por ID
    const uniqueChats = Array.from(
      new Map(sorted.map(chat => [chat.id, chat])).values()
    );
    
    setChats(uniqueChats);
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