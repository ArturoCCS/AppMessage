import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Message } from "../types";

export const MessageBubble: React.FC<{ msg: Message }> = ({ msg }) => {
  const mine = msg.direction === "out";
  return (
    <View style={[styles.container, mine ? styles.right : styles.left]}>
      <View style={[styles.bubble, mine ? styles.bubbleRight : styles.bubbleLeft]}>
        <Text style={[styles.text, mine ? styles.textRight : styles.textLeft]}>{msg.body}</Text>
        <Text style={styles.meta}>
          {new Date(msg.timestamp).toLocaleTimeString()} · {msg.status}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 12, marginVertical: 4, flexDirection: "row" },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },
  bubble: { maxWidth: "80%", padding: 10, borderRadius: 12 },
  bubbleLeft: { backgroundColor: "#eee", borderTopLeftRadius: 0 },
  bubbleRight: { backgroundColor: "#007bff", borderTopRightRadius: 0 },
  text: { fontSize: 16 },
  textLeft: { color: "#000" },
  textRight: { color: "#fff" },
  meta: { fontSize: 10, opacity: 0.7, marginTop: 4, color: "#fff" },
});