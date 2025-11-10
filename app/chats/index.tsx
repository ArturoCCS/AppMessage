import { ChatListItem } from "@/src/components/chat/ChatListItem";
import { DrawerMenu } from "@/src/components/drawer/DrawerMenu";
import { useChat } from "@/src/state/ChatContext";
import { useUser } from "@/src/state/UserContext";
import { colors } from "@/src/theme/colors";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, View, TouchableOpacity, Text, Platform, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";

export default function ChatsScreen() {
  const { chats, loadingChats, refreshChats } = useChat();
  const { me } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <View style={{ flex: 1 }}>
      {/* Header mejorado con gradiente y menú hamburguesa */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          paddingTop: Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 10,
          paddingBottom: 16,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        {/* Botón de menú hamburguesa */}
        <TouchableOpacity
          onPress={() => setDrawerOpen(true)}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 16,
          }}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M3 12h18M3 6h18M3 18h18"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>

        {/* Título */}
        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
            color: "#ffffff",
            flex: 1,
            letterSpacing: 0.3,
          }}
        >
          Chats
        </Text>

        {/* Botón de nuevo chat (opcional) */}
        <TouchableOpacity
          onPress={() => router.push("/contacts")}
          style={{
            width: 40,
            height: 40,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <Path
              d="M12 5v14M5 12h14"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
      </LinearGradient>

      {/* Lista de chats */}
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        refreshing={loadingChats}
        onRefresh={refreshChats}
        renderItem={({ item }) => (
          <ChatListItem
            title={item.title}
            subtitle={item.lastMessageText}
            time={item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) : undefined}
            unread={item.unreadCount ?? 0}
            onPress={() => router.push(`/chats/${item.id}`)}
          />
        )}
        contentContainerStyle={{ paddingBottom: 32 }}
        style={{ backgroundColor: colors.bg }}
      />

      {/* Drawer Menu */}
      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={me}
      />
    </View>
  );
}