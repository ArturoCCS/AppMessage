import { Observable, Subject } from "rxjs";
import type { ScanResult, Transport } from "./Transport";

export const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

class ExpoGoBLETransport implements Transport {
  private notify$ = new Subject<Uint8Array>();
  async scanForDevices(_onDevice: (d: ScanResult) => void, _o?: { timeoutMs?: number }) { return; }
  stopScan() {}
  async connect(_id: string) { throw new Error("BLE no está disponible en Expo Go. Usa un Development Build."); }
  async disconnect() {}
  async isConnected(): Promise<boolean> { return false; }
  notifications(): Observable<Uint8Array> { return this.notify$.asObservable(); }
  async write(_data: Uint8Array) { throw new Error("BLE no está disponible en Expo Go. Usa un Development Build."); }
}
export const bleTransport: Transport = new ExpoGoBLETransport();
export class BLETransport extends ExpoGoBLETransport {}