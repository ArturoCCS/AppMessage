import { useUser } from "@/src/state/UserContext";
import { api } from "@/src/utils/api";
import { isUUIDv4 } from "@/src/utils/validate";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

type TabKey = "mine" | "add";

export default function ContactIDScreen() {
  const { me, token, shareId } = useUser() as any;
  const [tab, setTab] = useState<TabKey>("mine");

  const [idInput, setIdInput] = useState("");
  const [name, setName] = useState("");

  const title = useMemo(() => (tab === "mine" ? "Mi ID" : "Agregar por ID"), [tab]);

  const copyID = async () => {
    try {
      await Clipboard.setStringAsync(shareId);
      Alert.alert("Copiado", "Tu ID se copió al portapapeles.");
    } catch {
      Alert.alert("No se pudo copiar", "Intenta de nuevo.");
    }
  };

  const addById = async () => {
    const raw = idInput.trim();
    if (!raw) {
      Alert.alert("Falta ID", "Ingresa el ID del contacto.");
      return;
    }
    if (!isUUIDv4(raw)) {
      Alert.alert("ID inválido", "El ID debe ser un UUID v4 válido.");
      return;
    }
    if (me && raw === me.id) {
      Alert.alert("ID inválido", "No puedes agregarte a ti mismo.");
      return;
    }
    if (!token) {
      Alert.alert("Sesión", "No hay sesión activa.");
      return;
    }
    const current = await api.listContacts(token);
    if (current.some(c => c.id === raw)) {
      Alert.alert("Duplicado", "Ese contacto ya existe en tu lista.");
      return;
    }
    await api.addContactByUserId(token, raw);
    Alert.alert("Contacto agregado", `Se agregó "${name.trim() || "Contacto"}".`, [
      { text: "OK", onPress: () => router.replace("/contacts") },
    ]);
    setIdInput("");
    setName("");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>
      
      <View style={{ paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, backgroundColor: "#111", borderBottomWidth: 1, borderBottomColor: "#222", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Text style={{ color: "#9ad", fontWeight: "700" }}>Volver</Text>
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>{title}</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ backgroundColor: "#111" }}>
        <View style={{ flexDirection: "row" }}>
          <TabItem title="Mi ID" active={tab === "mine"} onPress={() => setTab("mine")} />
          <TabItem title="Agregar por ID" active={tab === "add"} onPress={() => setTab("add")} />
        </View>
        <View style={{ height: 2, backgroundColor: "#1f1f1f" }}>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: tab === "mine" ? 0 : "50%",
              width: "50%",
              height: 2,
              backgroundColor: "#18c964",
            }}
          />
        </View>
      </View>

      {tab === "mine" ? (
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ color: "#9aa" }}>Tu ID</Text>
          <Text selectable style={{ color: "white", fontWeight: "800", marginTop: 8, fontSize: 16 }}>
            {shareId}
          </Text>
          <TouchableOpacity
            onPress={copyID}
            style={{ backgroundColor: "#18c964", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, alignSelf: "flex-start", marginTop: 16 }}
          >
            <Text style={{ color: "#051b10", fontWeight: "800" }}>Copiar ID</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1, padding: 24 }}>
          <Text style={{ color: "#9aa" }}>ID del contacto</Text>
          <TextInput
            placeholder="xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
            placeholderTextColor="#777"
            value={idInput}
            onChangeText={setIdInput}
            autoCapitalize="none"
            autoCorrect={false}
            style={{ borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 12, color: "white", marginTop: 8 }}
          />
          <Text style={{ color: "#9aa", marginTop: 14 }}>Nombre (opcional)</Text>
          <TextInput
            placeholder="Cómo quieres ver este contacto"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
            style={{ borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 12, color: "white", marginTop: 8 }}
          />

          <TouchableOpacity
            onPress={addById}
            style={{ backgroundColor: "#0a7", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, alignSelf: "flex-start", marginTop: 18 }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Agregar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function TabItem({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, paddingVertical: 12, alignItems: "center" }}>
      <Text style={{ color: active ? "white" : "#888", fontWeight: active ? "800" : "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}