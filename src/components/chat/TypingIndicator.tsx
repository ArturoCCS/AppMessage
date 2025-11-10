import { colors } from "@/src/theme/colors";
import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

export function TypingIndicator() {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: -8,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = Animated.parallel([
      animate(dot1, 0),
      animate(dot2, 150),
      animate(dot3, 300),
    ]);

    animations.start();

    return () => animations.stop();
  }, []);

  const Dot = ({ animatedValue }: { animatedValue: Animated.Value }) => (
    <Animated.View
      style={{
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.textMuted,
        marginHorizontal: 2,
        transform: [{ translateY: animatedValue }],
      }}
    />
  );

  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: colors.bubbleOther,
        padding: 12,
        marginVertical: 6,
        marginHorizontal: 10,
        borderRadius: 18,
        flexDirection: "row",
        alignItems: "center",
        minWidth: 60,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      }}
    >
      <Dot animatedValue={dot1} />
      <Dot animatedValue={dot2} />
      <Dot animatedValue={dot3} />
    </View>
  );
}