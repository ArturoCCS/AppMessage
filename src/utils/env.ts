import Constants from "expo-constants";
export const isExpoGo = Constants.appOwnership === "expo";
export const isPreview = isExpoGo;

const readEnv = (k: string) => (typeof process !== "undefined" ? (process.env as any)?.[k] : undefined);
export const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : readEnv("NODE_ENV") !== "production";
const mockEnv = readEnv("EXPO_PUBLIC_MOCK");
export const isMock = mockEnv === "1" || (mockEnv == null && isExpoGo);