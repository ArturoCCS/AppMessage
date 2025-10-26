import React, { useState } from "react";
import { Button, StyleSheet, TextInput, View } from "react-native";

export const MessageInput: React.FC<{ onSend: (text: string) => void; disabled?: boolean; }> = ({ onSend, disabled }) => {
  const [text, setText] = useState("");
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Escribe un mensaje"
        value={text}
        onChangeText={setText}
        editable={!disabled}
      />
      <Button
        title="Enviar"
        onPress={() => {
          if (text.trim().length) {
            onSend(text.trim());
            setText("");
          }
        }}
        disabled={disabled}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: "row", padding: 8, borderTopWidth: StyleSheet.hairlineWidth, borderColor: "#ccc" },
  input: { flex: 1, marginRight: 8, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
});