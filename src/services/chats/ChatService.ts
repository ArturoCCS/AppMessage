import { isExpoGo } from "@/src/utils/env";
import { Platform } from "react-native";

type Impl = typeof import("./ChatService.expo");

let impl: Impl;
if (Platform.OS === "web" || isExpoGo) {
  impl = require("./ChatService.expo");
} else {
  impl = require("./ChatService.expo");
}

export const ChatService = impl.ChatService;
export type ChatServiceType = typeof impl.ChatService;