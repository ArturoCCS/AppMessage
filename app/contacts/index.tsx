import { useUser } from "@/src/state/UserContext";
import { api } from "@/src/utils/api";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";

type ContactRow = { id: string; email?: string; name?: string | null; status?: "accepted" | "incoming" | "outgoing" | string };

export default function ContactsScreen() {
  const { token } = useUser();
  const [list, setList] = useState<ContactRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const c = await api.listContacts(token);
      setList(c.map((x: any) => ({ id: x.id, email: x.email, name: x.name, status: x.status })));
    } catch (e: any) {
      Alert.alert("Error cargando contactos", e?.message || String(e));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const onOpenChat = (c: ContactRow) => {
    if (!c?.id) return;
    router.push(`/chats/${c.id}`);
  };

  const accept = async (c: ContactRow) => {
    if (!token) return;
    try {
      await api.addContactByUserId(token, c.id);
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "No se pudo aceptar el contacto");
    }
  };

  const remove = async (c: ContactRow) => {
    if (!token) return;
    try {
      await api.removeContact(token, c.id);
      await load();
    } catch (e: any) {
      Alert.alert("Error eliminando contacto", e?.message || String(e));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
        <Text style={{ fontSize: 20, fontWeight: "800" }}>Contactos</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 }}>
          <TouchableOpacity onPress={() => router.push("/contacts/qr")} style={{ backgroundColor: "#06c", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Código QR</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/contacts/id")} style={{ backgroundColor: "#0a7", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Por ID</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={load} style={{ backgroundColor: "#888", padding: 10, borderRadius: 8 }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Refrescar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        refreshing={refreshing}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.name || item.email || item.id}</Text>
                <Text style={{ color: "#666" }} numberOfLines={1}>{item.id}</Text>
                {item.status ? <Text style={{ marginTop: 4, fontSize: 12, color: "#888" }}>Estado: {item.status}</Text> : null}
              </View>

              <View style={{ flexDirection: "row", gap: 8 }}>
                {item.status === "accepted" ? (
                  <TouchableOpacity onPress={() => onOpenChat(item)} style={{ backgroundColor: "#06c", padding: 8, borderRadius: 6 }}>
                    <Text style={{ color: "white" }}>Abrir chat</Text>
                  </TouchableOpacity>
                ) : null}

                {item.status === "incoming" || item.status === "outgoing" ? (
                  <TouchableOpacity onPress={() => accept(item)} style={{ backgroundColor: "#0a7", padding: 8, borderRadius: 6 }}>
                    <Text style={{ color: "white" }}>Aceptar</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity onPress={() => remove(item)} style={{ backgroundColor: "#e33", padding: 8, borderRadius: 6 }}>
                  <Text style={{ color: "white" }}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 48 }}>
            <Text>No hay contactos</Text>
          </View>
        }
      />
    </View>
  );
}