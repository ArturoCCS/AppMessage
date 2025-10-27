import { ComposerBar } from "@/src/components/chat/ComposerBar";
import { MessageBubble } from "@/src/components/chat/MessageBubble";
import { AppHeader } from "@/src/components/common/AppHeader";
import { useChat } from "@/src/state/ChatContext";
import type { Message } from "@/src/types/chat";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";

export default function ChatDetail() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { me, getMessages, subscribe, sendMessage } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!chatId) return;
    let unsub = () => {};
    (async () => {
      const initial = await getMessages(chatId);
      setMessages(initial);
      unsub = subscribe(chatId, (msgs) => setMessages(msgs));
    })();
    return () => unsub();
  }, [chatId]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const onSend = async () => {
    if (!text.trim() || !chatId) return;
    await sendMessage(chatId, text.trim());
    setText("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.select({ ios: "padding", android: undefined })} style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader title="Chat" />
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => (
          <MessageBubble text={item.text} timestamp={item.timestamp} isMe={item.senderId === me.id} />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <ComposerBar value={text} onChange={setText} onSend={onSend} />
    </KeyboardAvoidingView>
  );
}