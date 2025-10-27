import { ChatSummary, Message, User } from "@/src/types/chat";

type Unsubscribe = () => void;

class InMemoryChatService {
  private users: Record<string, User> = {};
  private chats: Record<string, ChatSummary> = {};
  private messages: Record<string, Message[]> = {};
  private listeners: Record<string, Set<(msgs: Message[]) => void>> = {};

  constructor() {
    const u1: User = { id: "u1", name: "Tú", avatar: undefined };
    const u2: User = { id: "u2", name: "María" };
    const u3: User = { id: "u3", name: "Carlos" };
    const u4: User = { id: "u4", name: "ESP32" };

    [u1, u2, u3, u4].forEach((u) => (this.users[u.id] = u));

    const c1: ChatSummary = {
      id: "c1",
      title: "María",
      participants: [u1, u2],
      lastMessageText: "¡Hola! ¿Cómo va el proyecto?",
      lastMessageAt: Date.now() - 1000 * 60 * 2,
      unreadCount: 1,
    };
    const c2: ChatSummary = {
      id: "c2",
      title: "Carlos",
      participants: [u1, u3],
      lastMessageText: "Te pasé el diagrama del NRF24",
      lastMessageAt: Date.now() - 1000 * 60 * 60,
      unreadCount: 0,
    };
    const c3: ChatSummary = {
      id: "c3",
      title: "ESP32",
      participants: [u1, u4],
      lastMessageText: "UART listo",
      lastMessageAt: Date.now() - 1000 * 60 * 180,
      unreadCount: 0,
    };

    [c1, c2, c3].forEach((c) => (this.chats[c.id] = c));

    this.messages["c1"] = [
      {
        id: "m1",
        chatId: "c1",
        senderId: "u2",
        text: "¡Hola! ¿Cómo va el proyecto?",
        timestamp: Date.now() - 1000 * 60 * 3,
      },
      { id: "m2", chatId: "c1", senderId: "u1", text: "Bien 🙌", timestamp: Date.now() - 1000 * 60 * 2 },
    ];
    this.messages["c2"] = [
      {
        id: "m3",
        chatId: "c2",
        senderId: "u3",
        text: "Te pasé el diagrama del NRF24",
        timestamp: Date.now() - 1000 * 60 * 60,
      },
    ];
    this.messages["c3"] = [
      { id: "m4", chatId: "c3", senderId: "u4", text: "UART listo", timestamp: Date.now() - 1000 * 60 * 180 },
    ];
  }

  async listChats(): Promise<ChatSummary[]> {
    const list = Object.values(this.chats).sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
    return new Promise((res) => setTimeout(() => res(list), 200));
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const msgs = this.messages[chatId] ?? [];
    return new Promise((res) => setTimeout(() => res([...msgs]), 150));
  }

  subscribe(chatId: string, cb: (messages: Message[]) => void): Unsubscribe {
    if (!this.listeners[chatId]) this.listeners[chatId] = new Set();
    this.listeners[chatId].add(cb);
    setTimeout(() => cb([...(this.messages[chatId] ?? [])]), 0);
    return () => {
      this.listeners[chatId].delete(cb);
    };
  }

  async sendMessage(chatId: string, senderId: string, text: string): Promise<void> {
    const msg: Message = {
      id: "m" + Math.random().toString(36).slice(2),
      chatId,
      senderId,
      text,
      timestamp: Date.now(),
      status: "sent",
    };
    const arr = (this.messages[chatId] = this.messages[chatId] ?? []);
    arr.push(msg);

    const chat = this.chats[chatId];
    if (chat) {
      chat.lastMessageText = text;
      chat.lastMessageAt = msg.timestamp;
    }

    this.listeners[chatId]?.forEach((cb) => cb([...arr]));
  }

  getCurrentUser(): User {
    return this.users["u1"];
  }

  getParticipant(userId: string): User | undefined {
    return this.users[userId];
  }
}

export const ChatService = new InMemoryChatService();