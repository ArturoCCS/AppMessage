import { Platform } from "react-native";
import { isExpoGo } from "../../utils/env";

type Impl = typeof import("./BLETransport.native");
let impl: Impl;

if (Platform.OS === "web") {
  impl = require("./BLETransport.web");
} else if (isExpoGo) {
  impl = require("./BLETransport.expo");
} else {
  impl = require("./BLETransport.native");
}

export const UART_SERVICE_UUID = impl.UART_SERVICE_UUID;
export const bleTransport = impl.bleTransport;
export const BLETransport = impl.BLETransport;