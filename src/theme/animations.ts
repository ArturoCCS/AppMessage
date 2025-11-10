import { Animated, Easing } from "react-native";

export const animations = {
  // Durations
  fast: 150,
  normal: 250,
  slow: 350,
  
  // Fade in animation
  fadeIn: (animatedValue: Animated.Value, duration = 250) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    });
  },
  
  // Slide in from bottom
  slideInUp: (animatedValue: Animated.Value, duration = 300) => {
    return Animated.timing(animatedValue, {
      toValue: 0,
      duration,
      easing: Easing.out(Easing.ease),
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