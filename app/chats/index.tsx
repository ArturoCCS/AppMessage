import { ChatListItem } from "@/src/components/chat/ChatListItem";
import { AppHeader } from "@/src/components/common/AppHeader";
import { DrawerMenu } from "@/src/components/drawer/DrawerMenu";
import { FadeInView } from "@/src/components/animations/FadeInView";
import { ToastNotification } from "@/src/components/notifications/ToastNotification";
import { useToast } from "@/src/hooks/useToast";
import { useChat } from "@/src/state/ChatContext";
import { useUser } from "@/src/state/UserContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function ChatsScreen() {
  const { chats, loadingChats, refreshChats } = useChat();
  const { me } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  const handleRefresh = async () => {
    try {
      await refreshChats();
      showToast('Chats actualizados', 'success');
    } catch (error) {
      showToast('Error al actualizar chats', 'error');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <AppHeader title="Chats" onMenuPress={() => setDrawerOpen(true)} />
      
      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        refreshing={loadingChats}
        onRefresh={handleRefresh}
        renderItem={({ item, index }) => (
          <FadeInView delay={index * 50} style={{ marginBottom: 4 }}>
            <ChatListItem
              title={item.title}
              subtitle={item.lastMessageText}
              time={item.lastMessageAt ? new Date(item.lastMessageAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : undefined}
              unread={item.unreadCount ?? 0}
              onPress={() => {
                showToast('Abriendo chat...', 'info');
                router.push(`/chats/${item.id}` as any);
              }}
            />
          </FadeInView>
        )}
        ListEmptyComponent={
          <FadeInView style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No hay chats aún</Text>
            <Text style={styles.emptySubtext}>Inicia una conversación desde Contactos</Text>
            <TouchableOpacity
              onPress={() => router.push('/contacts')}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>👥 Ver Contactos</Text>
            </TouchableOpacity>
          </FadeInView>
        }
        contentContainerStyle={{ paddingBottom: 32, paddingTop: 8 }}
      />

      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={me}
      />

      <ToastNotification
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});