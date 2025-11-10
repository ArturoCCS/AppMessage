import { Avatar } from "@/src/components/ui/Avatar";
import { AppHeader } from "@/src/components/common/AppHeader";
import { DrawerMenu } from "@/src/components/drawer/DrawerMenu";
import { useUser } from "@/src/state/UserContext";
import { api } from "@/src/utils/api";
import { setNameForce } from "@/src/utils/profile";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";

export default function ProfileScreen() {
  const { me, token, updateAvatar, forceRefresh } = useUser();
  const [name, setName] = useState(me?.name ?? "");
  const [saving, setSaving] = useState(false);
  const [updatingAvatar, setUpdatingAvatar] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setName(me?.name ?? "");
  }, [me?.name]);

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
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setUpdatingAvatar(true);
        await updateAvatar(res.assets[0].uri);
        await forceRefresh();
        Alert.alert("¡Listo!", "Avatar actualizado correctamente");
      }
    } catch (e: any) {
      Alert.alert("Error subiendo avatar", e.message || String(e));
    } finally {
      setUpdatingAvatar(false);
    }
  }

  async function removeImage() {
    Alert.alert(
      "Quitar avatar",
      "¿Estás seguro de eliminar tu foto de perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setUpdatingAvatar(true);
            try {
              await updateAvatar(undefined);
              await forceRefresh();
              Alert.alert("¡Listo!", "Avatar eliminado");
            } catch (e: any) {
              Alert.alert("Error quitando avatar", e.message || String(e));
            } finally {
              setUpdatingAvatar(false);
            }
          },
        },
      ]
    );
  }

  async function save() {
    if (!token) {
      Alert.alert("Sesión", "No hay token.");
      return;
    }
    const trimmed = (name || "").trim();
    const toSend = trimmed === "" ? null : trimmed;

    setSaving(true);
    try {
      await setNameForce(token, toSend);
      const u = await api.me(token);
      if (u.name !== toSend) {
        Alert.alert("Aviso", "El servidor aún no refleja el nombre. Reintenta.");
        return;
      }
      await forceRefresh();
      Alert.alert("¡Listo!", "Nombre guardado correctamente.");
    } catch (e: any) {
      Alert.alert("Error guardando", e.message || String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <AppHeader title="Perfil" onMenuPress={() => setDrawerOpen(true)} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarWrapper}>
              <Avatar 
                uri={me?.avatarUrl || me?.avatar || undefined} 
                name={me?.name || me?.email} 
                size={120} 
              />
              {updatingAvatar && (
                <View style={styles.avatarOverlay}>
                  <Text style={styles.avatarOverlayText}>⏳</Text>
                </View>
              )}
            </View>
            
            <Text style={styles.profileName}>
              {me?.name || "Sin nombre"}
            </Text>
            <Text style={styles.profileEmail}>{me?.email}</Text>
          </View>

          <View style={styles.avatarActions}>
            <TouchableOpacity
              disabled={updatingAvatar}
              onPress={pickImage}
              style={[styles.avatarButton, { backgroundColor: '#0a7ea4' }]}
            >
              <Text style={styles.avatarButtonIcon}>📷</Text>
              <Text style={styles.avatarButtonText}>
                {updatingAvatar ? "Procesando..." : "Cambiar foto"}
              </Text>
            </TouchableOpacity>

            {(me?.avatarUrl || me?.avatar) && (
              <TouchableOpacity
                disabled={updatingAvatar}
                onPress={removeImage}
                style={[styles.avatarButton, { backgroundColor: '#ef4444' }]}
              >
                <Text style={styles.avatarButtonIcon}>🗑️</Text>
                <Text style={styles.avatarButtonText}>Quitar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput
              placeholder="Tu nombre"
              placeholderTextColor="#94a3b8"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputDisabled}>
              <Text style={styles.inputDisabledText}>{me?.email}</Text>
            </View>
            <Text style={styles.hint}>El email no se puede cambiar</Text>
          </View>

          <TouchableOpacity
            onPress={save}
            disabled={saving}
            style={[styles.saveButton, { opacity: saving ? 0.7 : 1 }]}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "⏳ Guardando..." : "💾 Guardar cambios"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Consejo</Text>
          <Text style={styles.infoText}>
            Mantén tu perfil actualizado para que tus contactos te reconozcan fácilmente
          </Text>
        </View>
      </ScrollView>

      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={me}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOverlayText: {
    fontSize: 32,
  },
  profileName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  avatarActions: {
    flexDirection: 'row',
    gap: 12,
  },
  avatarButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 8,
  },
  avatarButtonIcon: {
    fontSize: 18,
  },
  avatarButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
    fontWeight: '500',
  },
  inputDisabled: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#f1f5f9',
  },
  inputDisabledText: {
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  hint: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1e40af',
    lineHeight: 20,
  },
});