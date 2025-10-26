import { Buffer } from "buffer";
import { BleManager, Subscription as BleSub, Device } from "react-native-ble-plx";
import { Observable, Subject } from "rxjs";
import type { ScanResult, Transport } from "./Transport";

export const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_CHAR_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_CHAR_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

export class BLETransport implements Transport {
  private manager = new BleManager();
  private device: Device | null = null;
  private notifySub: BleSub | null = null;
  private notify$ = new Subject<Uint8Array>();

  async scanForDevices(onDevice: (d: ScanResult) => void, options?: { timeoutMs?: number }) {
    const timeout = options?.timeoutMs ?? 10000;
    this.manager.startDeviceScan([UART_SERVICE_UUID], null, (error, device) => {
      if (error) { console.warn("BLE scan error:", error); return; }
      if (device) onDevice({ id: device.id, name: device.name ?? device.localName ?? "ESP32" });
    });
    setTimeout(() => this.stopScan(), timeout);
  }

  stopScan() { try { this.manager.stopDeviceScan(); } catch {} }

  async connect(deviceId: string) {
    const d = await this.manager.connectToDevice(deviceId, { timeout: 15000 });
    this.device = await d.discoverAllServicesAndCharacteristics();
    try { await this.device.requestMTU?.(185); } catch {}
    this.notifySub = this.device.monitorCharacteristicForService(
      UART_SERVICE_UUID,
      UART_TX_CHAR_UUID,
      (error, ch) => {
        if (error) { console.warn("notify error", error); return; }
        if (ch?.value) this.notify$.next(new Uint8Array(Buffer.from(ch.value, "base64")));
      }
    );
  }

  async disconnect() {
    try { this.notifySub?.remove(); } catch {}
    this.notifySub = null;
    if (this.device) { try { await this.manager.cancelDeviceConnection(this.device.id); } catch {} }
    this.device = null;
  }

  async isConnected(): Promise<boolean> {
    if (!this.device) return false;
    return this.manager.isDeviceConnected(this.device.id);
  }

  notifications(): Observable<Uint8Array> { return this.notify$.asObservable(); }

  async write(data: Uint8Array) {
    if (!this.device) throw new Error("Not connected");
    const base64 = Buffer.from(data).toString("base64");
    await this.device.writeCharacteristicWithoutResponseForService(
      UART_SERVICE_UUID, UART_RX_CHAR_UUID, base64
    );
  }
}

export const bleTransport: Transport = new BLETransport();