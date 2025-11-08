import { useUser } from "@/src/state/UserContext";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const { requestOtp } = useUser();
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend() {
    const e = email.trim().toLowerCase();
    if (!e.includes("@")) return Alert.alert("Email inválido");
    try {
      setSending(true);
      await requestOtp(e);
      Alert.alert("Código enviado", "Revisa tu correo.");
      router.push({ pathname: "/auth/verify", params: { email: e } });
    } catch (err: any) {
      Alert.alert("Error", err.message || String(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Iniciar sesión</Text>
      <TextInput style={styles.input} autoCapitalize="none" keyboardType="email-address"
                 placeholder="tu@email.com" value={email} onChangeText={setEmail} />
      <Button title={sending ? "Enviando..." : "Enviar código"} onPress={handleSend} disabled={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, paddingTop: 80 },
  h1: { fontSize: 24, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12 },
});