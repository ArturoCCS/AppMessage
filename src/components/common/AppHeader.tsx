import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import { type } from "@/src/theme/typography";
import React from "react";
import { Text, View } from "react-native";

export function AppHeader({ title }: { title: string }) {
  return (
    <View style={{ padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <Text style={type.title}>{title}</Text>
    </View>
  );
}