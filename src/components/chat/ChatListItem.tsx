import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { colors } from "@/src/theme/colors";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function ChatListItem({
  title,
  subtitle,
  time,
  unread = 0,
  onPress,
}: {
  title: string;
  subtitle?: string;
  time?: string;
  unread?: number;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={{ paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
        <Avatar name={title} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", flex: 1 }}>{title}</Text>
            {!!time && <Text style={{ fontSize: 12, color: "#666" }}>{time}</Text>}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text numberOfLines={1} style={{ color: "#555", flex: 1 }}>
              {subtitle ?? "Nuevo chat"}
            </Text>
            <Badge value={unread} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}