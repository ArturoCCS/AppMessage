import { ChatListItem } from "@/src/components/chat/ChatListItem";
import { AppHeader } from "@/src/components/common/AppHeader";
import { useChat } from "@/src/state/ChatContext";
import { router } from "expo-router";
import React from "react";
import { FlatList, View } from "react-native";

export default function ChatsScreen() {
  const { chats, loadingChats, refreshChats } = useChat();

  return (
    <View style={{ flex: 1 }}>
      <AppHeader title="Chats" />
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        refreshing={loadingChats}
        onRefresh={refreshChats}
        renderItem={({ item }) => (
          <ChatListItem
            title={item.title}
            subtitle={item.lastMessageText}
            time={item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString() : undefined}
            unread={item.unreadCount ?? 0}
            onPress={() => router.push(`/chats/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}