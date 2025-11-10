import "@/src/setup/polyfills";
import { ChatProvider } from "@/src/state/ChatContext";
import { UserProvider } from "@/src/state/UserContext";
import { ThemeProvider } from "@/src/state/ThemeContext";
import { isMock, isPreview } from "@/src/utils/env";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

if (isMock) {
  // Usa import dinámico en lugar de require
  import("../src/setup/mock-api").catch(() => {
    console.log("Mock API no disponible");
  });
  (global as any).__APP_MODE__ = "mock";
} else {
  (global as any).__APP_MODE__ = "live";
}

export default function RootLayout() {
  return (
    <UserProvider>
      <ChatProvider>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }} />
          {(isPreview || isMock) && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                paddingTop: 8,
                paddingBottom: 6,
                backgroundColor: isMock
                  ? "rgba(52, 152, 219, 0.92)"
                  : "rgba(255,193,7,0.90)",
                alignItems: "center",
                zIndex: 9999,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: isMock ? "#fff" : "#000",
                }}
              >
                {isMock
                  ? "Mock API activo — sin servidor (data en memoria)"
                  : "Preview UI (Expo Go)"}
              </Text>
            </View>
          )}
        </ThemeProvider>
      </ChatProvider>
    </UserProvider>
  );
}