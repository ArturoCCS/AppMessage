import { colors } from "@/src/theme/colors";
import React from "react";
import { View } from "react-native";

export function Screen({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, backgroundColor: colors.bg }}>{children}</View>;
}