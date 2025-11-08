import { useChat } from "@/src/state/ChatContext";
import type { Message } from "@/src/utils/api";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";

export default function ChatByContact() {
  const { contactId } = useLocalSearchParams<{ contactId: string }>();
  const { me, getMessages, subscribe, sendMessage } = useChat();
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!contactId) return;
    let unsub = () => {};
    (async () => {
      const initial = await getMessages(String(contactId));
      setMsgs(initial);
      unsub = subscribe(String(contactId), (list) => setMsgs(list));
    })();
    return () => unsub();
  }, [contactId]);

  async function onSend() {
    if (!text.trim() || !contactId) return;
    try {
      await sendMessage(String(contactId), text.trim());
      setText("");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  }

  const renderItem = ({ item }: { item: Message }) => {
    const mine = me && item.senderId === me.id;
    return (
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <Text style={{ color: mine ? "white" : "black" }}>{item.content}</Text>
        <Text style={[styles.meta, { color: mine ? "#e0e0e0" : "#666" }]}>
          {new Date(item.createdAt).toLocaleTimeString()} {mine && (item.readAt ? "✓✓" : item.deliveredAt ? "✓" : "")}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList data={msgs} keyExtractor={(m) => m.id} renderItem={renderItem} contentContainerStyle={{ padding: 12, gap: 8 }} />
      <View style={styles.composer}>
        <TextInput style={styles.input} value={text} onChangeText={setText} placeholder="Escribe un mensaje" />
        <Button title="Enviar" onPress={onSend} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  composer: { flexDirection: "row", padding: 8, gap: 8, borderTopWidth: 1, borderTopColor: "#eee" },
  input: { flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, paddingHorizontal: 10, height: 40 },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 12 },
  mine: { alignSelf: "flex-end", backgroundColor: "#0078fe" },
  theirs: { alignSelf: "flex-start", backgroundColor: "#f1f1f1" },
  meta: { fontSize: 10, marginTop: 4 },
});