import "@/src/setup/polyfills";
import { ChatProvider } from "@/src/state/ChatContext";
import { UserProvider } from "@/src/state/UserContext";
import { ThemeProvider } from "@/src/state/ThemeContext";
import { isMock, isPreview } from "@/src/utils/env";
import { Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

if (isMock) {
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
                zIndex: 9999,
              }}
            >
              <LinearGradient
                colors={
                  isMock
                    ? ["#0088cc", "#0066aa"]
                    : ["#f59e0b", "#ea580c"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  paddingTop: 8,
                  paddingBottom: 6,
                  paddingHorizontal: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                {/* Icono */}
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    backgroundColor: "rgba(255,255,255,0.3)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 8,
                  }}
                >
                  <Text style={{ fontSize: 10, color: "#fff" }}>
                    {isMock ? "💾" : "👁"}
                  </Text>
                </View>

                {/* Texto */}
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    color: "#ffffff",
                    letterSpacing: 0.3,
                  }}
                >
                  {isMock
                    ? "Modo Demo · Datos en memoria"
                    : "Vista previa · Expo Go"}
                </Text>

                {/* Badge */}
                <View
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 8,
                    backgroundColor: "rgba(255,255,255,0.25)",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      fontWeight: "700",
                      color: "#ffffff",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {isMock ? "MOCK" : "PREVIEW"}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}
        </ThemeProvider>
      </ChatProvider>
    </UserProvider>
  );
}