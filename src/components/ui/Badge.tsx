import { animations } from "@/src/theme/animations";
import { colors } from "@/src/theme/colors";
import React, { useEffect, useRef } from "react";
import { Animated, Text } from "react-native";

export function Badge({ value }: { value: number }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (value > 0) {
      // Pulse animation
      const pulse = animations.pulse(scaleAnim);
      pulse.start();
      return () => pulse.stop();
    }
  }, [value]);

  if (!value) return null;

  return (
    <Animated.View
      style={{
        minWidth: 22,
        height: 22,
        paddingHorizontal: 6,
        backgroundColor: colors.unreadBadge,
        borderRadius: 11,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: colors.unreadBadge,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 3,
        elevation: 3,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>
        {value > 99 ? "99+" : value}
      </Text>
    </Animated.View>
  );
}