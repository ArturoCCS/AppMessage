import { colors } from "@/src/theme/colors";
import React from "react";
import { Text, TextInput, TouchableOpacity, View, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";

export function ComposerBar({
  value,
  onChange,
  onSend,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        padding: 12,
        paddingBottom: Platform.OS === "ios" ? 24 : 12,
        backgroundColor: colors.bg,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      {/* Icon Button - Attach (Optional) */}
      <TouchableOpacity
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: colors.bgSecondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 5v14M5 12h14"
            stroke={colors.primary}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </TouchableOpacity>

      {/* Text Input */}
      <View
        style={{
          flex: 1,
          backgroundColor: colors.bgSecondary,
          borderRadius: 20,
          paddingHorizontal: 16,
          paddingVertical: 10,
          minHeight: 40,
          maxHeight: 100,
        }}
      >
        <TextInput
          placeholder="Mensaje"
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={onChange}
          multiline
          style={{
            fontSize: 16,
            color: colors.text,
            lineHeight: 20,
          }}
        />
      </View>

      {/* Send Button */}
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim()}
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: value.trim() ? colors.primary : colors.bgSecondary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: value.trim() ? 0.3 : 0,
          shadowRadius: 4,
          elevation: value.trim() ? 3 : 0,
        }}
      >
        <Svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <Path
            d="M2 10l16-8-8 16-2-8-6-0z"
            fill={value.trim() ? "#ffffff" : colors.textMuted}
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}