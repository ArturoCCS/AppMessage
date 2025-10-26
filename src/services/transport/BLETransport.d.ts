import type { Transport } from "./Transport";
export const UART_SERVICE_UUID: string;
export const bleTransport: Transport;
export declare class BLETransport implements Transport {
  scanForDevices(onDevice: (d: { id: string; name?: string }) => void, options?: { timeoutMs?: number }): Promise<void>;
  stopScan(): void;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  notifications(): import("rxjs").Observable<Uint8Array>;
  write(data: Uint8Array): Promise<void>;
}