import { ChatSummary, Message, User } from "@/src/types/chat";

type Unsubscribe = () => void;

function directChatId(a: string, b: string) {
  const [x, y] = [a, b].sort();
  return `dm-${x}-${y}`;
}

class InMemoryChatService {
  private users: Record<string, User> = {};
  private chats: Record<string, ChatSummary> = {};
  private messages: Record<string, Message[]> = {};
  private listeners: Record<string, Set<(msgs: Message[]) => void>> = {};

  constructor() {
  }

  ensureUser(u: User) {
    this.users[u.id] = { id: u.id, name: u.name, avatar: u.avatar };
  }

  createOrGetDirectChat(me: User, other: User): ChatSummary {
    this.ensureUser(me);
    this.ensureUser(other);
    const id = directChatId(me.id, other.id);
    if (!this.chats[id]) {
      this.chats[id] = {
        id,
        title: other.name,
        participants: [me, other],
        lastMessageText: undefined,
        lastMessageAt: undefined,
        unreadCount: 0,
      };
      this.messages[id] = [];
    }
    return this.chats[id];
  }

  async listChats(): Promise<ChatSummary[]> {
    const list = Object.values(this.chats).sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
    return new Promise((res) => setTimeout(() => res(list), 100));
  }

  async getMessages(chatId: string): Promise<Message[]> {
    const msgs = this.messages[chatId] ?? [];
    return new Promise((res) => setTimeout(() => res([...msgs]), 60));
  }

  subscribe(chatId: string, cb: (messages: Message[]) => void): Unsubscribe {
    if (!this.listeners[chatId]) this.listeners[chatId] = new Set();
    this.listeners[chatId].add(cb);
    setTimeout(() => cb([...(this.messages[chatId] ?? [])]), 0);
    return () => this.listeners[chatId].delete(cb);
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
    return this.users["u1"] ?? { id: "u1", name: "Tú" };
  }

  getParticipant(userId: string): User | undefined {
    return this.users[userId];
  }
}

export const ChatService = new InMemoryChatService();