import React from "react";
import { Image, Text, View } from "react-native";

function initials(name?: string) {
  if (!name) return "U";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "U") + (p[1]?.[0] || "")).toUpperCase();
}

export function Avatar({ uri, name, size = 48 }: { uri?: string; name?: string; size?: number }) {
  const fontSize = Math.round(size / 2.8);
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: 2,
          borderColor: "#222",
          backgroundColor: "#333",
        }}
      />
    );
  }
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#2d7cf0",
      }}
    >
      <Text style={{ color: "white", fontWeight: "800", fontSize }}>{initials(name)}</Text>
    </View>
  );
}