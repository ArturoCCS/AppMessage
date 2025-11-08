import { ContactsService } from "@/src/services/contacts/ContactsService";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function AddContactScreen() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");

  const onAdd = async () => {
    const cId = id.trim();
    if (!cId) {
      Alert.alert("Falta ID", "Ingresa el ID del contacto (el código que te comparte).");
      return;
    }
    const contact = await ContactsService.addOutgoing(cId, name.trim() || "Contacto");
    Alert.alert("Contacto agregado", `Se agregó como "${contact.name}" en estado ${contact.status}.`, [
      { text: "OK" },
    ]);
    setId("");
    setName("");
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: "800" }}>Agregar contacto</Text>
      <Text style={{ color: "#555" }}>
        Pídele a la otra persona su ID (lo ve en su pantalla de Contactos) y pégalo aquí.
      </Text>

      <Text style={{ fontWeight: "700" }}>ID del contacto</Text>
      <TextInput
        placeholder="xxxx-xxxx-xxxx-xxxx"
        value={id}
        onChangeText={setId}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 }}
      />

      <Text style={{ fontWeight: "700" }}>Nombre (opcional)</Text>
      <TextInput
        placeholder="Cómo quieres ver este contacto"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10 }}
      />

      <TouchableOpacity onPress={onAdd} style={{ backgroundColor: "#0a7", padding: 12, borderRadius: 8, alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: "white", fontWeight: "700" }}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}