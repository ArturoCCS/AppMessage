import { Button } from "@/src/components/ui/Button";
import { router } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "800" }}>Message</Text>
      <Text style={{ textAlign: "center", color: "#555" }}>
        Modo Preview para diseño de interfaces.
      </Text>
      <Button title="Ver chats" onPress={() => router.push("/chats")} />
    </View>
  );
}