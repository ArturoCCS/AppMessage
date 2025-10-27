export type User = {
  id: string;
  name: string;
  avatar?: string;
};

export type Message = {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  timestamp: number;
  status?: "sent" | "delivered" | "read";
};

export type ChatSummary = {
  id: string;
  title: string;
  lastMessageText?: string;
  lastMessageAt?: number;
  unreadCount?: number;
  participants: User[];
};