import { Platform } from "react-native";
import {
  PERMISSIONS,
  RESULTS,
  checkMultiple,
  openSettings,
  requestMultiple,
} from "react-native-permissions";

export async function ensureBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  const perms =
    Platform.Version >= 31
      ? [PERMISSIONS.ANDROID.BLUETOOTH_SCAN, PERMISSIONS.ANDROID.BLUETOOTH_CONNECT]
      : [PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION];

  const statuses = await checkMultiple(perms);
  const need = perms.filter((p) => statuses[p] !== RESULTS.GRANTED);

  if (need.length === 0) return true;

  const req = await requestMultiple(need);
  const allGranted = need.every((p) => req[p] === RESULTS.GRANTED);
  if (allGranted) return true;
  await openSettings();
  return false;
}