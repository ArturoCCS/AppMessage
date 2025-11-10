import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import React from "react";
import { Text, View, Platform, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function AppHeader({ title }: { title: string }) {
  // Calcula el padding top considerando el banner de Mock API
  const paddingTop = Platform.OS === "ios" ? 70 : (StatusBar.currentHeight || 0) + 40;

  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        paddingTop,
        paddingBottom: spacing.lg,
        paddingHorizontal: spacing.lg,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "700",
          color: "#ffffff",
          letterSpacing: 0.3,
        }}
      >
        {title}
      </Text>
    </LinearGradient>
  );
}