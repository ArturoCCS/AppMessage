import { MessageBubble } from "@/src/components/MessageBubble";
import { MessageInput } from "@/src/components/MessageInput";
import { MessagingService } from "@/src/services/messaging/MessagingService";
import { bleTransport } from "@/src/services/transport/BLETransport";
import { LocalDB } from "@/src/storage/LocalDB";
import { Message, UserId } from "@/src/types";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";

export default function ChatScreen() {
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [meId, setMeId] = useState<UserId | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await bleTransport.isConnected();
      setConnected(ok);
    })();
  }, []);

  const messaging = useMemo(() => {
    if (!meId) return null;
    return new MessagingService(bleTransport, meId);
  }, [meId]);

  useEffect(() => {
    (async () => {
      const me = await LocalDB.getMyUser();
      if (!me) {
        Alert.alert("Usuario", "No hay usuario local");
        return;
      }
      setMeId(me.id);
      if (!contactId) return;
      const convId = [me.id, contactId].sort().join("|");
      const msgs = await LocalDB.getMessages(convId);
      setMessages(msgs);
    })();
  }, [contactId]);

  useEffect(() => {
    if (!messaging) return;
    const sub = messaging.startReceiving(async (msg) => {
      if (
        (msg.senderId === contactId && msg.receiverId === meId) ||
        (msg.senderId === meId && msg.receiverId === contactId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });
    return () => sub?.unsubscribe?.();
  }, [messaging, contactId, meId]);

  const onSend = async (text: string) => {
    if (!messaging || !meId || !contactId) return;
    try {
      const msg = await messaging.sendText(contactId, text);
      setMessages((prev) => [...prev, msg]);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo enviar");
    }
  };

  return (
    <View style={styles.container}>
      {!connected && <Text style={{ padding: 8, color: "#a00" }}>No conectado a ESP32</Text>}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MessageBubble msg={item} />}
        contentContainerStyle={{ paddingVertical: 12 }}
      />
      <MessageInput onSend={onSend} disabled={!connected} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});