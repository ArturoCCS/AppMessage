import { ChatService } from "@/src/services/chats/ChatService";
import type { ChatSummary, Message, User } from "@/src/types/chat";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type ChatContextType = {
  me: User;
  chats: ChatSummary[];
  loadingChats: boolean;
  refreshChats: () => Promise<void>;
  getMessages: (chatId: string) => Promise<Message[]>;
  subscribe: (chatId: string, cb: (messages: Message[]) => void) => () => void;
  sendMessage: (chatId: string, text: string) => Promise<void>;
  getUser: (userId: string) => User | undefined;
};

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const me = useMemo(() => ChatService.getCurrentUser(), []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const list = await ChatService.listChats();
      setChats(list);
      setLoading(false);
    })();
  }, []);

  const value: ChatContextType = {
    me,
    chats,
    loadingChats: loading,
    refreshChats: async () => {
      setLoading(true);
      const list = await ChatService.listChats();
      setChats(list);
      setLoading(false);
    },
    getMessages: (chatId) => ChatService.getMessages(chatId),
    subscribe: (chatId, cb) => ChatService.subscribe(chatId, cb),
    sendMessage: async (chatId, text) => ChatService.sendMessage(chatId, me.id, text),
    getUser: (id) => ChatService.getParticipant(id),
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}