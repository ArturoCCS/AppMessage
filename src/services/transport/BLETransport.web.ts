import { Observable, Subject } from "rxjs";
import type { ScanResult, Transport } from "./Transport";

export const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

class WebBLETransport implements Transport {
  private notify$ = new Subject<Uint8Array>();
  async scanForDevices(_onDevice: (d: ScanResult) => void, _opts?: { timeoutMs?: number }) { return; }
  stopScan() {}
  async connect(_id: string) { throw new Error("BLE no soportado en Web."); }
  async disconnect() {}
  async isConnected(): Promise<boolean> { return false; }
  notifications(): Observable<Uint8Array> { return this.notify$.asObservable(); }
  async write(_data: Uint8Array) { throw new Error("BLE no soportado en Web."); }
}

export const bleTransport: Transport = new WebBLETransport();
export class BLETransport extends WebBLETransport {}