import { colors } from "@/src/theme/colors";
import React from "react";
import { TextInput, TouchableOpacity, View, Platform } from "react-native";
import Svg, { Path } from "react-native-svg";

export function ComposerBar({
  value,
  onChange,
  onSend,
  style,
}: {
  value: string;
  onChange: (t: string) => void;
  onSend: () => void;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          padding: 12,
          paddingBottom: Platform.OS === "ios" ? 24 : 12,
          backgroundColor: colors.bg,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          gap: 10,
          alignItems: "center",
        },
        style,
      ]}
    >
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

      {/* Send Button - Solo flecha */}
      <TouchableOpacity
        onPress={onSend}
        disabled={!value.trim()}
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
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
        <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 12L22 2L12 22L10 14L2 12Z"
            fill={value.trim() ? "#ffffff" : colors.textMuted}
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
}