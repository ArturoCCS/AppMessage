import { Platform } from "react-native";
import { PERMISSIONS, RESULTS, checkMultiple, requestMultiple } from "react-native-permissions";

export async function ensureBluetoothPermissions(): Promise<boolean> {
  if (Platform.OS === "android") {
    const perms = [
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    ];
    const statuses = await checkMultiple(perms);
    const need = perms.filter((p) => statuses[p] !== RESULTS.GRANTED);
    if (need.length) {
      const req = await requestMultiple(need);
      return need.every((p) => req[p] === RESULTS.GRANTED);
    }
    return true;
  } else {
    const perms = [PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL];
    const statuses = await checkMultiple(perms);
    const need = perms.filter((p) => statuses[p] !== RESULTS.GRANTED);
    if (need.length) {
      const req = await requestMultiple(need);
      return need.every((p) => req[p] === RESULTS.GRANTED);
    }
    return true;
  }
}