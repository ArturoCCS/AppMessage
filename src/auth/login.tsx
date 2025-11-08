import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "../../src/auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const { requestOtp } = useAuth();
  const router = useRouter();

  async function handleSend() {
    if (!email.includes("@")) return Alert.alert("Email inválido");
    try {
      setSending(true);
      await requestOtp(email.trim().toLowerCase());
      Alert.alert("Código enviado", "Revisa tu correo.");
      router.push({ pathname: "/auth/verify", params: { email } });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Iniciar sesión</Text>
      <TextInput
        placeholder="tu@email.com"
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <Button title={sending ? "Enviando..." : "Enviar código"} onPress={handleSend} disabled={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, paddingTop: 80 },
  h1: { fontSize: 24, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
});