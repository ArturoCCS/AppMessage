import { Platform } from "react-native";
import { isExpoGo } from "../../utils/env";

type Impl = typeof import("./BluetoothPermissions.native");
let impl: Impl;

if (Platform.OS === "web") {
  impl = require("./BluetoothPermissions.web");
} else if (isExpoGo) {
  impl = require("./BluetoothPermissions.expo");
} else {
  impl = require("./BluetoothPermissions.native");
}

export const ensureBluetoothPermissions = impl.ensureBluetoothPermissions;