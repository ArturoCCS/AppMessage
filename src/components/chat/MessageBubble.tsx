import { colors } from "@/src/theme/colors";
import React from "react";
import { Text, View } from "react-native";

export function MessageBubble({
  text,
  timestamp,
  isMe,
}: {
  text: string;
  timestamp: number;
  isMe: boolean;
}) {
  return (
    <View
      style={{
        alignSelf: isMe ? "flex-end" : "flex-start",
        backgroundColor: isMe ? colors.bubbleMe : colors.bubbleOther,
        padding: 10,
        marginVertical: 6,
        marginHorizontal: 10,
        borderRadius: 12,
        maxWidth: "80%",
      }}
    >
      <Text style={{ color: isMe ? "white" : "#111" }}>{text}</Text>
      <Text style={{ fontSize: 10, color: isMe ? "white" : "#666", marginTop: 4 }}>
        {new Date(timestamp).toLocaleTimeString()}
      </Text>
    </View>
  );
}