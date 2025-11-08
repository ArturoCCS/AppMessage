import { ComposerBar } from "@/src/components/chat/ComposerBar";
import { MessageBubble } from "@/src/components/chat/MessageBubble";
import { AppHeader } from "@/src/components/common/AppHeader";
import { useChat } from "@/src/state/ChatContext";
import type { Message as UiMessage } from "@/src/types/chat";
import type { Message as ApiMessage } from "@/src/utils/api";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform } from "react-native";

function mapApiToUi(m: ApiMessage): UiMessage {
  return {
    id: m.id,
    chatId: m.conversationId,
    senderId: m.senderId,
    text: m.content,
    timestamp: Date.parse(m.createdAt),
  };
}

export default function ChatDetail() {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const { me, getMessages, subscribe, sendMessage } = useChat();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList<UiMessage>>(null);

  useEffect(() => {
    if (!chatId) return;
    let unsub = () => {};
    (async () => {
      const initialApi = (await getMessages(chatId)) as unknown as ApiMessage[];
      const initialUi = initialApi.map(mapApiToUi);
      setMessages(initialUi);

      unsub = subscribe(chatId, (msgs: any[]) => {
        const ui = (msgs as ApiMessage[]).map(mapApiToUi);
        setMessages(ui);
      });
    })();
    return () => unsub();
  }, [chatId, getMessages, subscribe]);

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
          <MessageBubble text={item.text} timestamp={item.timestamp} isMe={me ? item.senderId === me.id : false} />
        )}
        contentContainerStyle={{ paddingVertical: 8 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />
      <ComposerBar value={text} onChange={setText} onSend={onSend} />
    </KeyboardAvoidingView>
  );
}