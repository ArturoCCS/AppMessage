import { useUser } from "@/src/state/UserContext";
import { AppHeader } from "@/src/components/common/AppHeader";
import { DrawerMenu } from "@/src/components/drawer/DrawerMenu";
import { api } from "@/src/utils/api";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View, StyleSheet } from "react-native";

type ContactRow = { id: string; email?: string; name?: string | null; status?: "accepted" | "incoming" | "outgoing" | string };

export default function ContactsScreen() {
  const { token, me } = useUser();
  const [list, setList] = useState<ContactRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    router.push(`/chats/${c.id}` as any);
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
    Alert.alert(
      "Eliminar contacto",
      "¿Estás seguro de eliminar este contacto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await api.removeContact(token, c.id);
              await load();
            } catch (e: any) {
              Alert.alert("Error eliminando contacto", e?.message || String(e));
            }
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <AppHeader title="Contactos" onMenuPress={() => setDrawerOpen(true)} />

      <View style={styles.actionBar}>
        <TouchableOpacity 
          onPress={() => router.push("/contacts/qr")} 
          style={[styles.actionButton, { backgroundColor: '#0a7ea4' }]}
        >
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionText}>Código QR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => router.push("/contacts/id")} 
          style={[styles.actionButton, { backgroundColor: '#10b981' }]}
        >
          <Text style={styles.actionIcon}>🔑</Text>
          <Text style={styles.actionText}>Por ID</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={load} 
          style={[styles.actionButton, { backgroundColor: '#8b5cf6' }]}
        >
          <Text style={styles.actionIcon}>🔄</Text>
          <Text style={styles.actionText}>Refrescar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={list}
        keyExtractor={(c) => c.id}
        refreshing={refreshing}
        onRefresh={load}
        renderItem={({ item }) => (
          <View style={styles.contactCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>
                {item.name?.[0]?.toUpperCase() || item.email?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>

            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{item.name || item.email || item.id}</Text>
              <Text style={styles.contactId} numberOfLines={1}>{item.id}</Text>
              {item.status && (
                <View style={styles.statusBadge}>
                  <View style={[styles.statusDot, { 
                    backgroundColor: item.status === 'accepted' ? '#10b981' : '#f59e0b' 
                  }]} />
                  <Text style={styles.statusText}>
                    {item.status === 'accepted' ? 'Aceptado' : 
                     item.status === 'incoming' ? 'Pendiente' : 
                     item.status === 'outgoing' ? 'Enviado' : item.status}
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.contactActions}>
              {item.status === "accepted" && (
                <TouchableOpacity 
                  onPress={() => onOpenChat(item)} 
                  style={[styles.actionBtn, { backgroundColor: '#0a7ea4' }]}
                >
                  <Text style={styles.actionBtnText}>💬</Text>
                </TouchableOpacity>
              )}

              {(item.status === "incoming" || item.status === "outgoing") && (
                <TouchableOpacity 
                  onPress={() => accept(item)} 
                  style={[styles.actionBtn, { backgroundColor: '#10b981' }]}
                >
                  <Text style={styles.actionBtnText}>✓</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity 
                onPress={() => remove(item)} 
                style={[styles.actionBtn, { backgroundColor: '#ef4444' }]}
              >
                <Text style={styles.actionBtnText}>×</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyText}>No hay contactos</Text>
            <Text style={styles.emptySubtext}>Agrega contactos para comenzar a chatear</Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={me}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  contactAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactAvatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
  },
  contactInfo: {
    flex: 1,
    gap: 4,
  },
  contactName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  contactId: {
    fontSize: 13,
    color: '#64748b',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 20,
    color: '#ffffff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
  },
});