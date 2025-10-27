import React from "react";
import { Text, View } from "react-native";

export function Badge({ value }: { value: number }) {
  if (!value) return null;
  return (
    <View
      style={{
        minWidth: 20,
        height: 20,
        paddingHorizontal: 6,
        backgroundColor: "#e33",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>{value}</Text>
    </View>
  );
}