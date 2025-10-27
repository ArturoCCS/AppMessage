import { isExpoGo } from "@/src/utils/env";
import { Platform } from "react-native";

let impl: typeof import("./BLETransport.expo");
if (Platform.OS === "web" || isExpoGo) {
  impl = require("./BLETransport.expo");
} else {
  impl = require("./BLETransport.native");
}

export const UART_SERVICE_UUID = impl.UART_SERVICE_UUID;
export const bleTransport = impl.bleTransport;
export const BLETransport = impl.BLETransport;