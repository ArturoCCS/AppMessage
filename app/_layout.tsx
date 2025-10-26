import "@/src/setup/polyfills";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: true }}>
        <Stack.Screen name="index" options={{ title: "Conectar ESP32" }} />
        <Stack.Screen name="chats" options={{ title: "Chats" }} />
        <Stack.Screen name="chats/[contactId]" options={{ title: "Chat" }} />
      </Stack>
    </>
  );
}