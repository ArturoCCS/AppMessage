import { useUser } from "@/src/state/UserContext";
import { DrawerMenu } from "@/src/components/drawer/DrawerMenu";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const router = useRouter();
  const { loading, me } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (!loading && !me) {
      router.replace("/auth/login");
    }
  }, [loading, me]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (!me) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Redirigiendo a iniciar sesión...</Text>
      </View>
    );
  }

  const menuItems = [
    { icon: '💬', label: 'Ver Chats', route: '/chats', color: '#0a7ea4' },
    { icon: '👥', label: 'Contactos', route: '/contacts', color: '#10b981' },
    { icon: '👤', label: 'Perfil', route: '/profile', color: '#8b5cf6' },
  ];

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={['#0a7ea4', '#0c4a6e']}
        style={styles.container}
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.logoContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>💬</Text>
            </View>
            <Text style={styles.appName}>Message</Text>
            <Text style={styles.appSubtitle}>Tu app de mensajería moderna</Text>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as any)}
                style={[styles.menuCard, { backgroundColor: item.color }]}
                activeOpacity={0.8}
              >
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => setDrawerOpen(true)}
            style={styles.drawerButton}
          >
            <Text style={styles.drawerButtonText}>☰ Abrir Menú</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        currentUser={me}
      />
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
  container: { 
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  logoText: {
    fontSize: 56,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '600',
  },
  menuGrid: {
    gap: 16,
    marginBottom: 32,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  menuIcon: {
    fontSize: 40,
    marginRight: 20,
  },
  menuLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    flex: 1,
    letterSpacing: 0.5,
  },
  drawerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  drawerButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 16,
  },
});