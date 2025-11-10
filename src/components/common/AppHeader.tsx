import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import React from "react";
import { Text, View, Platform, StatusBar, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function AppHeader({ 
  title, 
  onMenuPress 
}: { 
  title: string; 
  onMenuPress?: () => void;
}) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        {onMenuPress && (
          <TouchableOpacity 
            onPress={onMenuPress} 
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <View style={styles.hamburger}>
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
              <View style={styles.hamburgerLine} />
            </View>
          </TouchableOpacity>
        )}
        
        <Text style={styles.title}>{title}</Text>
        
        <View style={styles.rightSpace} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  hamburger: {
    width: 24,
    gap: 5,
  },
  hamburgerLine: {
    height: 3,
    backgroundColor: '#ffffff',
    borderRadius: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  rightSpace: {
    width: 44,
  },
});