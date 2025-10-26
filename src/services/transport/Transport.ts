import { Observable } from "rxjs";
export interface ScanResult { id: string; name?: string; }
export interface Transport {
  scanForDevices(onDevice: (d: ScanResult) => void, options?: { timeoutMs?: number }): Promise<void>;
  stopScan(): void;
  connect(deviceId: string): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): Promise<boolean>;
  notifications(): Observable<Uint8Array>;
  write(data: Uint8Array): Promise<void>;
}