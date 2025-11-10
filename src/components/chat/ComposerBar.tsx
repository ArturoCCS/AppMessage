import React from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet, ViewStyle } from "react-native";

interface ComposerBarProps {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  style?: ViewStyle; // 👈 permite recibir estilos externos
}

export function ComposerBar({ value, onChange, onSend, style }: ComposerBarProps) {
  return (
    <View style={[styles.container, style]}>
      <TextInput
        placeholder="Escribe un mensaje"
        value={value}
        onChangeText={onChange}
        style={styles.input}
      />
      <TouchableOpacity onPress={onSend} style={styles.button}>
        <Text style={styles.buttonText}>Enviar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    backgroundColor: "#0a7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
  },
});