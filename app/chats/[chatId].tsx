import { ComposerBar } from "@/src/components/chat/ComposerBar";
import { MessageBubble } from "@/src/components/chat/MessageBubble";
import { TypingIndicator } from "@/src/components/chat/TypingIndicator";
import { AppHeader } from "@/src/components/common/AppHeader";
import { useChat } from "@/src/state/ChatContext";
import type { Message as UiMessage } from "@/src/types/chat";
import type { Message as ApiMessage } from "@/src/utils/api";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, View, ImageBackground } from "react-native";
import { colors } from "@/src/theme/colors";

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
  const [isTyping, setIsTyping] = useState(false);
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
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const onSend = async () => {
    if (!text.trim() || !chatId) return;
    await sendMessage(chatId, text.trim());
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // Simulación de "escribiendo..."
  useEffect(() => {
    if (text.length > 0) {
      setIsTyping(true);
      const timer = setTimeout(() => setIsTyping(false), 2000);
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [text]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.select({ ios: "padding", android: undefined })} 
      style={{ flex: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <AppHeader title="Chat" />
      
      <View style={{ flex: 1, backgroundColor: colors.bgChat }}>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageBubble 
              text={item.text} 
              timestamp={item.timestamp} 
              isMe={me ? item.senderId === me.id : false}
              status={me && item.senderId === me.id ? "read" : undefined}
            />
          )}
          contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 4 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />
      </View>
      
      <ComposerBar value={text} onChange={setText} onSend={onSend} />
    </KeyboardAvoidingView>
  );
}