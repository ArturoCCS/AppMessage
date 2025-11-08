import "@/src/setup/polyfills";
import { ChatProvider } from "@/src/state/ChatContext";
import { UserProvider } from "@/src/state/UserContext";
import { isPreview } from "@/src/utils/env";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <UserProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }} />
        {isPreview ? (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              paddingTop: 8,
              paddingBottom: 6,
              backgroundColor: "rgba(255, 193, 7, 0.9)",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: "700" }}>
              Preview UI (Expo Go) — sin BLE
            </Text>
          </View>
        ) : null}
      </ChatProvider>
    </UserProvider>
  );
}