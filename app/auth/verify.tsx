import { useUser } from "@/src/state/UserContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";

export default function Verify() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const router = useRouter();
  const { verifyOtp } = useUser();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);

  async function handleVerify() {
    if (!/^\d{6}$/.test(code)) return Alert.alert("Código inválido");
    try {
      setVerifying(true);
      await verifyOtp((email || "").toLowerCase(), code);
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Error", e.message || String(e));
    } finally {
      setVerifying(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Verificar código</Text>
      <Text>Enviado a: {email}</Text>
      <TextInput
        style={styles.input}
        placeholder="000000"
        keyboardType="number-pad"
        maxLength={6}
        value={code}
        onChangeText={setCode}
      />
      <Button title={verifying ? "Verificando..." : "Verificar"} onPress={handleVerify} disabled={verifying} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, paddingTop: 80 },
  h1: { fontSize: 24, fontWeight: "700" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, letterSpacing: 4, fontSize: 20 },
});