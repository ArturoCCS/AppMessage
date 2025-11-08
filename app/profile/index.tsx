import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { useUser } from "@/src/state/UserContext";

export default function ProfileScreen() {
  const { me, updateName, updateAvatar } = useUser();
  const [name, setName] = useState(me?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);

  async function pickImage() {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permiso requerido", "Habilita acceso a fotos para elegir tu imagen.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setUpdatingAvatar(true);
        await updateAvatar(res.assets[0].uri);
        setUpdatingAvatar(false);
      }
    } catch (e: any) {
      setUpdatingAvatar(false);
      Alert.alert("Error", e.message || "No se pudo abrir la galería.");
    }
  }

  async function removeImage() {
    try {
      setUpdatingAvatar(true);
      await updateAvatar(undefined);
      setUpdatingAvatar(false);
    } catch (e: any) {
      setUpdatingAvatar(false);
      Alert.alert("Error", e.message || String(e));
    }
  }

  async function save() {
    setSaving(true);
    try {
      await updateName(name);
      Alert.alert("Listo", "Perfil actualizado.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>

      <View
        style={{
          paddingTop: 10,
          paddingBottom: 12,
          paddingHorizontal: 12,
          backgroundColor: "#111",
          borderBottomWidth: 1,
          borderBottomColor: "#222",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Text style={{ color: "#9ad", fontWeight: "700" }}>Volver</Text>
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>Perfil</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ padding: 20, gap: 16 }}>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Avatar uri={me?.avatarUrl} name={me?.name || me?.email} size={88} />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              disabled={updatingAvatar}
              onPress={pickImage}
              style={{
                backgroundColor: "#2d7cf0",
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 10,
                opacity: updatingAvatar ? 0.6 : 1,
              }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>
                {updatingAvatar ? "Procesando..." : "Cambiar foto"}
              </Text>
            </TouchableOpacity>
            {me?.avatarUrl ? (
              <TouchableOpacity
                disabled={updatingAvatar}
                onPress={removeImage}
                style={{
                  backgroundColor: "#e33",
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  opacity: updatingAvatar ? 0.6 : 1,
                }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>Quitar</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={{ color: "#9aa", marginBottom: 8 }}>Nombre</Text>
          <TextInput
            placeholder="Tu nombre"
            placeholderTextColor="#777"
            value={name}
            onChangeText={setName}
            style={{ borderWidth: 1, borderColor: "#333", borderRadius: 10, padding: 12, color: "white" }}
          />
        </View>

        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={{
            backgroundColor: "#18c964",
            paddingHorizontal: 14,
            paddingVertical: 12,
            borderRadius: 10,
            alignSelf: "flex-start",
            opacity: saving ? 0.7 : 1,
          }}
        >
          <Text style={{ color: "#051b10", fontWeight: "800" }}>
            {saving ? "Guardando..." : "Guardar"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}