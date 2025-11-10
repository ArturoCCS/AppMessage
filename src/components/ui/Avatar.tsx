import { colors } from "@/src/theme/colors";
import React from "react";
import { Image, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

function initials(name?: string) {
  if (!name) return "U";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "U") + (p[1]?.[0] || "")).toUpperCase();
}

function getGradientForName(name?: string): string[] {
  if (!name) return colors.avatarGradients[0];
  const charCode = name.charCodeAt(0);
  const index = charCode % colors.avatarGradients.length;
  return colors.avatarGradients[index];
}

export function Avatar({ uri, name, size = 48, showOnline }: { uri?: string; name?: string; size?: number; showOnline?: boolean }) {
  const fontSize = Math.round(size / 2.5);
  const gradient = getGradientForName(name);

  if (uri) {
    return (
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: colors.bg,
          }}
        />
        {showOnline && (
          <View
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: size * 0.3,
              height: size * 0.3,
              borderRadius: (size * 0.3) / 2,
              backgroundColor: colors.online,
              borderWidth: 2,
              borderColor: colors.bg,
            }}
          />
        )}
      </View>
    );
  }

  return (
    <View style={{ position: "relative" }}>
      <LinearGradient
        colors={gradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
          elevation: 3,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700", fontSize }}>{initials(name)}</Text>
      </LinearGradient>
      {showOnline && (
        <View
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: size * 0.3,
            height: size * 0.3,
            borderRadius: (size * 0.3) / 2,
            backgroundColor: colors.online,
            borderWidth: 2,
            borderColor: colors.bg,
          }}
        />
      )}
    </View>
  );
}