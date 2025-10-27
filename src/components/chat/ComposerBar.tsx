import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

export function ComposerBar({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        gap: 8,
        alignItems: "center",
      }}
    >
      <TextInput
        placeholder="Escribe un mensaje"
        value={value}
        onChangeText={onChange}
        style={{
          flex: 1,
          backgroundColor: "#f5f5f5",
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 10,
        }}
      />
      <TouchableOpacity
        onPress={onSend}
        style={{ backgroundColor: "#0a7", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}