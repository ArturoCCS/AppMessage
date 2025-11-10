import { animations } from "@/src/theme/animations";
import { colors } from "@/src/theme/colors";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import { MessageStatus } from "./MessageStatus";

type MessageStatusType = "sending" | "sent" | "delivered" | "read";

export function MessageBubble({
  text,
  timestamp,
  isMe,
  status = "sent",
}: {
  text: string;
  timestamp: number;
  isMe: boolean;
  status?: MessageStatusType;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      animations.fadeIn(fadeAnim, 300),
      animations.slideInUp(slideAnim, 300),
    ]).start();
  }, []);

  const timeString = new Date(timestamp).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        alignSelf: isMe ? "flex-end" : "flex-start",
        marginVertical: 2,
        marginHorizontal: 8,
        maxWidth: "80%",
      }}
    >
      {isMe ? (
        <View
          style={{
            backgroundColor: colors.bubbleMe,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            borderTopRightRadius: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text style={{ color: "#111", fontSize: 15, lineHeight: 20 }}>{text}</Text>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", marginTop: 2, gap: 3 }}>
            <Text style={{ fontSize: 11, color: colors.textMuted }}>{timeString}</Text>
            <MessageStatus status={status} isMe={isMe} />
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.bubbleOther,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            borderTopLeftRadius: 0,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 2,
            elevation: 1,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 15, lineHeight: 20 }}>{text}</Text>
          <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2, textAlign: "right" }}>
            {timeString}
          </Text>
        </View>
      )}
    </Animated.View>
  );
}