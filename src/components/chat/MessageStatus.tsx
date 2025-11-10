import { colors } from "@/src/theme/colors";
import React from "react";
import { View } from "react-native";
import Svg, { Path } from "react-native-svg";

type MessageStatusType = "sending" | "sent" | "delivered" | "read";

export function MessageStatus({ status, isMe }: { status?: MessageStatusType; isMe: boolean }) {
  if (!isMe || !status) return null;

  const getColor = () => {
    if (status === "read") return colors.read; // Azul claro visible
    return colors.sent; // Gris
  };

  const showDouble = status === "delivered" || status === "read";

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 2 }}>
      {status === "sending" && (
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            borderWidth: 2,
            borderColor: colors.sent,
            opacity: 0.5,
          }}
        />
      )}
      {(status === "sent" || showDouble) && (
        <Svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <Path
            d="M5 6L7 8L11 4"
            stroke={getColor()}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showDouble && (
            <Path
              d="M9 6L11 8L15 4"
              stroke={getColor()}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      )}
    </View>
  );
}