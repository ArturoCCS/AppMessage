import AsyncStorage from "@react-native-async-storage/async-storage";
import { Conversation, ConversationId, Message, MessageId, UserId } from "../types";

const KEY_PREFIX = "@chatapp";

function key(path: string) { return `${KEY_PREFIX}:${path}`; }

export const LocalDB = {
  async getConversations(): Promise<Conversation[]> {
    const raw = await AsyncStorage.getItem(key("conversations"));
    return raw ? JSON.parse(raw) : [];
  },

  async upsertConversation(conv: Conversation): Promise<void> {
    const all = await LocalDB.getConversations();
    const idx = all.findIndex((c) => c.id === conv.id);
    if (idx >= 0) all[idx] = { ...all[idx], ...conv };
    else all.push(conv);
    await AsyncStorage.setItem(key("conversations"), JSON.stringify(all));
  },

  async getMessages(conversationId: ConversationId): Promise<Message[]> {
    const raw = await AsyncStorage.getItem(key(`messages:${conversationId}`));
    return raw ? JSON.parse(raw) : [];
  },

  async appendMessage(msg: Message): Promise<void> {
    const list = await LocalDB.getMessages(msg.conversationId);
    list.push(msg);
    await AsyncStorage.setItem(key(`messages:${msg.conversationId}`), JSON.stringify(list));
    await LocalDB.upsertConversation({
      id: msg.conversationId,
      participants: [msg.senderId, msg.receiverId],
      lastMessageAt: msg.timestamp,
    });
  },

  async updateMessageStatus(conversationId: ConversationId, messageId: MessageId, status: Message["status"]) {
    const list = await LocalDB.getMessages(conversationId);
    const idx = list.findIndex((m) => m.id === messageId);
    if (idx >= 0) {
      list[idx].status = status;
      await AsyncStorage.setItem(key(`messages:${conversationId}`), JSON.stringify(list));
    }
  },

  async getMyUser(): Promise<{ id: UserId; displayName: string } | null> {
    const raw = await AsyncStorage.getItem(key("me"));
    return raw ? JSON.parse(raw) : null;
  },

  async setMyUser(user: { id: UserId; displayName: string }) {
    await AsyncStorage.setItem(key("me"), JSON.stringify(user));
  },
};