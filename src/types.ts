export type UserId = string;
export type ConversationId = string;
export type MessageId = string;

export type MessageType = "text" | "image";
export type MessageStatus = "pending" | "sent" | "delivered" | "failed";

export interface Message {
  id: MessageId;
  conversationId: ConversationId;
  senderId: UserId;
  receiverId: UserId;
  type: MessageType;
  body: string;
  timestamp: number;
  status: MessageStatus;
  direction: "in" | "out";
}

export interface Conversation {
  id: ConversationId;
  participants: [UserId, UserId];
  lastMessageAt?: number;
  unreadCount?: number;
}