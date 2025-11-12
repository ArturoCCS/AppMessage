import React, { useState } from "react";
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 👈 importamos el ícono

export const MessageInput: React.FC<{ onSend: (text: string) => void; disabled?: boolean; }> = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (text.trim().length) {
      onSend(text.trim());
      setText("");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje"
        value={text}
        onChangeText={setText}
        editable={!disabled}
        placeholderTextColor="#999"
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={disabled || !text.trim().length}
        style={[
          styles.sendButton,
          { backgroundColor: disabled || !text.trim().length ? "#ccc" : "#007bff" },
        ]}
      >
        <Ionicons name="send" size={22} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#ccc",
    alignItems: "center",
  },
  input: {
    flex: 1,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    fontSize: 16,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
});