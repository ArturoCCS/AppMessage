import { ensureBluetoothPermissions } from "@/src/services/permissions/BluetoothPermissions";
import { bleTransport, UART_SERVICE_UUID } from "@/src/services/transport/BLETransport";
import type { ScanResult } from "@/src/services/transport/Transport";
import "@/src/setup/polyfills";
import { LocalDB } from "@/src/storage/LocalDB";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function DeviceSelect() {
  const [devices, setDevices] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await ensureBluetoothPermissions();
      if (!ok) {
        Alert.alert("Permisos", "No se otorgaron permisos de Bluetooth.");
        return;
      }
      setDevices([]);
      setLoading(true);
      bleTransport
        .scanForDevices((d) => {
          setDevices((prev) => (prev.find((p) => p.id === d.id) ? prev : [...prev, d]));
        }, { timeoutMs: 8000 })
        .finally(() => setLoading(false));
    })();
    return () => bleTransport.stopScan();
  }, []);

  const connect = async (d: ScanResult) => {
    setLoading(true);
    try {
      await bleTransport.connect(d.id);
      const me = await LocalDB.getMyUser();
      if (!me) {
        await LocalDB.setMyUser({
          id: `USR${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`,
          displayName: "Yo",
        });
      }
      router.replace("/chats");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "No se pudo conectar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona tu ESP32 (BLE)</Text>
      <Text style={styles.subtitle}>Servicio: {UART_SERVICE_UUID}</Text>
      {loading && <ActivityIndicator style={{ marginTop: 8 }} />}
      <FlatList
        data={devices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.item} onPress={() => connect(item)}>
            <Text style={styles.name}>{item.name || "Sin nombre"}</Text>
            <Text style={styles.id}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? <Text>No se encontraron dispositivos</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, color: "#666", marginBottom: 8 },
  item: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#ddd" },
  name: { fontSize: 16 },
  id: { fontSize: 12, color: "#666" },
});