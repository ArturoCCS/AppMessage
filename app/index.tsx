import { useUser } from "@/src/state/UserContext";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  const { loading, me } = useUser();

  useEffect(() => {
    if (!loading) {
      if (!me) {
        // Si no está autenticado, redirige al login
        router.replace("/auth/login");
      } else {
        // Si está autenticado, redirige directo a chats
        router.replace("/chats");
      }
    }
  }, [loading, me]);

  // Pantalla de carga mientras verifica autenticación
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#25D366" />
      <Text style={styles.loadingText}>Cargando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
    fontWeight: '600',
  },
});