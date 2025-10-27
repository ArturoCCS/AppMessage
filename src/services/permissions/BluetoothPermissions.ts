import { isExpoGo } from "@/src/utils/env";
import { Platform } from "react-native";

let impl: typeof import("./BluetoothPermissions.expo");
if (Platform.OS === "web" || isExpoGo) {
  impl = require("./BluetoothPermissions.expo");
} else {
  impl = require("./BluetoothPermissions.native");
}
export const ensureBluetoothPermissions = impl.ensureBluetoothPermissions;