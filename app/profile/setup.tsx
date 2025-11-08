import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

import { Avatar } from "@/src/components/ui/Avatar";
import { useUser } from "@/src/state/UserContext";

export default function ProfileSetupScreen() {
  const router = useRouter();
  const { me, updateProfile, uploadAvatar } = useUser();

  const [name, setName] = useState(me?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function pickAvatar() {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      const canceled = (res as any).canceled ?? (res as any).cancelled;
      if (canceled) return;

      const asset = (res as any).assets?.[0];
      const uri = asset?.uri || (res as any).uri;
      if (!uri) {
        Alert.alert("Sin imagen", "No se pudo obtener la imagen seleccionada.");
        return;
      }

      setUploading(true);
      await uploadAvatar(uri);
      Alert.alert("Listo", "Tu foto de perfil fue actualizada.");
    } catch (e: any) {
      Alert.alert("Error subiendo avatar", e?.message || String(e));
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    const trimmed = (name || "").trim();
    if (!trimmed) {
      router.replace("/");
      return;
    }
    try {
      setSaving(true);
      await updateProfile({ name: trimmed });
      router.replace("/");
    } catch (e: any) {
      Alert.alert("Error guardando", e?.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  function skip() {
    router.replace("/");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Completa tu perfil</Text>
      <Text style={styles.subtitle}>Puedes omitir esta configuración por ahora.</Text>

      <View style={{ alignItems: "center", marginTop: 16, gap: 10 }}>
        <Avatar uri={me?.avatarUrl || undefined} name={me?.name || me?.email} size={96} />
        <TouchableOpacity
          onPress={pickAvatar}
          disabled={uploading}
          style={[styles.btn, { backgroundColor: "#2d7cf0", opacity: uploading ? 0.6 : 1 }]}
        >
          {uploading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Elegir foto</Text>}
        </TouchableOpacity>
        <Text style={{ color: "#777", fontSize: 12 }}>La foto es opcional</Text>
      </View>

      <View style={{ width: "100%", marginTop: 18 }}>
        <Text style={styles.label}>Nombre (opcional)</Text>
        <TextInput
          placeholder="Tu nombre"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          style={styles.input}
          autoCapitalize="words"
        />
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
        <TouchableOpacity
          onPress={save}
          disabled={saving}
          style={[styles.btn, { backgroundColor: "#18c964", opacity: saving ? 0.7 : 1 }]}
        >
          <Text style={[styles.btnText, { color: "#051b10" }]}>{saving ? "Guardando..." : "Guardar y continuar"}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={skip}
          style={[styles.btn, { backgroundColor: "#666" }]}
        >
          <Text style={styles.btnText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 48, backgroundColor: "#111" },
  title: { color: "white", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#9aa", marginTop: 6 },
  label: { color: "#9aa", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    padding: 12,
    color: "white",
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  btnText: { color: "white", fontWeight: "800" },
});