import { useUser } from "@/src/state/UserContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { loading, me } = useUser();

  useEffect(() => {
    if (!loading && !me) {
      router.replace("/auth/login");
    }
  }, [loading, me]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator /></View>;
  }

  if (!me) {
    return <View style={styles.center}><Text>Redirigiendo a iniciar sesión…</Text></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Message</Text>
      <View style={{ height: 12 }} />
      <Button title="Ver chats" onPress={() => router.push("/chats")} />
      <View style={{ height: 8 }} />
      <Button title="Contactos" onPress={() => router.push("/contacts")} />
      <View style={{ height: 8 }} />
      <Button title="Perfil" onPress={() => router.push("/profile")} />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 16 },
  h1: { fontSize: 22, fontWeight: "800" },
});