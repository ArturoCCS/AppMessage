import { colors } from "@/src/theme/colors";
import { spacing } from "@/src/theme/spacing";
import React from "react";
import { Text, TouchableOpacity, ViewStyle } from "react-native";

export function Button({
  title,
  onPress,
  style,
}: {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          backgroundColor: colors.primary,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderRadius: 10,
          alignItems: "center",
        },
        style,
      ]}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>{title}</Text>
    </TouchableOpacity>
  );
}