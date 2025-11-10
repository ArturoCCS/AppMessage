import type { Observable } from "rxjs";
import { Subject } from "rxjs";

export const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

class ExpoGoBLETransport {
  private notify$ = new Subject<Uint8Array>();
  async scanForDevices() {}
  stopScan() {}
  async connect() {
    throw new Error("BLE no está disponible en Expo Go (solo Preview UI).");
  }
  async disconnect() {}
  async isConnected(): Promise<boolean> {
    return false;
  }
  notifications(): Observable<Uint8Array> {
    return this.notify$.asObservable();
  }
  async write() {
    throw new Error("BLE no está disponible en Expo Go (solo Preview UI).");
  }
}

export const bleTransport = new ExpoGoBLETransport();
export class BLETransport extends ExpoGoBLETransport {}