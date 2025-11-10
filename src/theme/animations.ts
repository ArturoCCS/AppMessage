import { Animated, Easing } from "react-native";

export const animations = {
  // Durations
  fast: 150,
  normal: 250,
  slow: 350,
  
  // Easings
  easeOut: Easing.out(Easing.cubic),
  easeIn: Easing.in(Easing.cubic),
  spring: Easing.elastic(1.2),
  
  // Fade in animation
  fadeIn: (animatedValue: Animated.Value, duration = 250) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  },
  
  // Scale animation
  scale: (animatedValue: Animated.Value, toValue = 1, duration = 250) => {
    return Animated.spring(animatedValue, {
      toValue,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    });
  },
  
  // Slide in from bottom
  slideInUp: (animatedValue: Animated.Value, duration = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
  },
  
  // Pulse animation for badges
  pulse: (animatedValue: Animated.Value) => {
    return Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
  },
};