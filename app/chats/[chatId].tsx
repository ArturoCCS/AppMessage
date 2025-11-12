import { ComposerBar } from "@/src/components/chat/ComposerBar";
import { MessageBubble } from "@/src/components/chat/MessageBubble";
import { TypingIndicator } from "@/src/components/chat/TypingIndicator";
import { AppHeader } from "@/src/components/common/AppHeader";
import { useChat } from "@/src/state/ChatContext";
import type { Message as UiMessage } from "@/src/types/chat";
import type { Message as ApiMessage } from "@/src/utils/api";
import { Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, View, TouchableOpacity, Text, ScrollView, Modal } from "react-native";
import { colors } from "@/src/theme/colors";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/src/utils/api";
import { useUser } from "@/src/state/UserContext";

// Colores predefinidos
const PRESET_COLORS = [
  { name: "WhatsApp", color: "#ECE5DD" },
  { name: "Blanco", color: "#FFFFFF" },
  { name: "Gris Claro", color: "#F0F2F5" },
  { name: "Verde Claro", color: "#E8F5E9" },
  { name: "Azul Claro", color: "#E3F2FD" },
  { name: "Naranja Claro", color: "#FFF3E0" },
  { name: "Morado Claro", color: "#F3E5F5" },
  { name: "Rosa Claro", color: "#FFEBEE" },
  { name: "Oscuro", color: "#263238" },
  { name: "Negro", color: "#1A1A1A" },
];

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
  const { me, getMessages, subscribe, sendMessage, refreshChats } = useChat();
  const { token } = useUser();
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [text, setText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState(colors.bgChat);
  const listRef = useRef<FlatList<UiMessage>>(null);

  // Cargar color guardado
  useEffect(() => {
    if (!chatId) return;
    (async () => {
      const saved = await AsyncStorage.getItem(`chat_bg_${chatId}`);
      if (saved) {
        setBackgroundColor(saved);
      }
    })();
  }, [chatId]);

  // Marcar mensajes como leídos al abrir el chat
  useEffect(() => {
    if (!chatId || !token) return;
    
    const markAsRead = async () => {
      try {
        await api.ackRead(token, chatId);
        await refreshChats();
      } catch (e) {
        console.warn("Error marking as read:", e);
      }
    };

    // Marca como leído después de 1 segundo de abrir el chat
    const timer = setTimeout(markAsRead, 1000);
    return () => clearTimeout(timer);
  }, [chatId, token]);

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
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const selectColor = async (color: string) => {
    setBackgroundColor(color);
    if (chatId) {
      await AsyncStorage.setItem(`chat_bg_${chatId}`, color);
    }
    setShowBgPicker(false);
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
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 20}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header con botón de personalizar */}
      <View style={{ position: "relative" }}>
        <AppHeader title="Chat" />
        <TouchableOpacity
          onPress={() => setShowBgPicker(true)}
          style={{
            position: "absolute",
            right: 16,
            top: Platform.OS === "ios" ? 50 : 20,
            backgroundColor: "rgba(255,255,255,0.3)",
            padding: 8,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 20 }}>🎨</Text>
        </TouchableOpacity>
      </View>

      {/* Fondo del chat con padding para el banner */}
      <View style={{ flex: 1, backgroundColor, paddingTop: 0 }}>
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
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 70 }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          ListFooterComponent={isTyping ? <TypingIndicator /> : null}
        />
      </View>

      {/* Barra fija abajo */}
      <ComposerBar
        value={text}
        onChange={setText}
        onSend={onSend}
        style={styles.composerBar}
      />

      {/* Modal de selección de colores */}
      <Modal
        visible={showBgPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowBgPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header del modal */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🎨 Color de Fondo</Text>
              <TouchableOpacity onPress={() => setShowBgPicker(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Lista de colores */}
            <ScrollView style={styles.colorList}>
              {PRESET_COLORS.map((item) => (
                <TouchableOpacity
                  key={item.color}
                  onPress={() => selectColor(item.color)}
                  style={styles.colorItem}
                >
                  <View
                    style={[
                      styles.colorCircle,
                      { backgroundColor: item.color },
                      backgroundColor === item.color && styles.colorCircleSelected,
                    ]}
                  />
                  <Text style={styles.colorName}>{item.name}</Text>
                  {backgroundColor === item.color && (
                    <Text style={styles.checkMark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  composerBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderColor: "#ccccccff",
    backgroundColor: "#fff",
    paddingVertical: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },
  closeButton: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: "600",
  },
  colorList: {
    padding: 20,
  },
  colorItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    marginBottom: 12,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  colorCircleSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
  },
  colorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    flex: 1,
  },
  checkMark: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: "700",
  },
});