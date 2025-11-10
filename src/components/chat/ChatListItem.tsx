import { Avatar } from "@/src/components/ui/Avatar";
import { Badge } from "@/src/components/ui/Badge";
import { colors } from "@/src/theme/colors";
import React from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";

export function ChatListItem({
  title,
  subtitle,
  time,
  unread = 0,
  onPress,
  avatarUri,
  isOnline,
}: {
  title: string;
  subtitle?: string;
  time?: string;
  unread?: number;
  onPress?: () => void;
  avatarUri?: string;
  isOnline?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.6}
    >
      <View style={styles.content}>
        <Avatar name={title} uri={avatarUri} size={60} showOnline={isOnline} />
        
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.title,
                { fontWeight: unread > 0 ? "800" : "600" }
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {!!time && (
              <Text
                style={[
                  styles.time,
                  { 
                    color: unread > 0 ? colors.primary : colors.textMuted,
                    fontWeight: unread > 0 ? "700" : "500"
                  }
                ]}
              >
                {time}
              </Text>
            )}
          </View>
          
          <View style={styles.subtitleRow}>
            <Text
              numberOfLines={1}
              style={[
                styles.subtitle,
                { 
                  color: unread > 0 ? colors.text : colors.textMuted,
                  fontWeight: unread > 0 ? "600" : "400"
                }
              ]}
            >
              {subtitle ?? "Nuevo chat"}
            </Text>
            <Badge value={unread} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 17,
    flex: 1,
    color: colors.text,
    letterSpacing: 0.2,
  },
  time: {
    fontSize: 13,
    marginLeft: 8,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subtitle: {
    flex: 1,
    fontSize: 15,
  },
});