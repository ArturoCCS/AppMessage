import { Buffer } from "buffer";
import { BleManager, Characteristic, Device } from "react-native-ble-plx";
import type { Observable } from "rxjs";
import { Subject } from "rxjs";

export const UART_SERVICE_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";
const UART_RX_UUID = "6e400003-b5a3-f393-e0a9-e50e24dcca9e";
const UART_TX_UUID = "6e400002-b5a3-f393-e0a9-e50e24dcca9e";

const manager = new BleManager();

type ScanResult = { id: string; name?: string | null };

class NativeBLETransport {
  private device: Device | null = null;
  private rxChar: Characteristic | null = null;
  private notify$ = new Subject<Uint8Array>();

  async scanForDevices(onDevice: (d: ScanResult) => void, options?: { timeoutMs?: number }) {
    manager.startDeviceScan([UART_SERVICE_UUID], null, (error, device) => {
      if (error) return;
      if (device) onDevice({ id: device.id, name: device.name });
    });
    if (options?.timeoutMs) setTimeout(() => this.stopScan(), options.timeoutMs);
  }

  stopScan() {
    manager.stopDeviceScan();
  }

  async connect(deviceId: string) {
    this.device = await manager.connectToDevice(deviceId, { timeout: 12000 });
    this.device = await this.device.discoverAllServicesAndCharacteristics();
    const chars = await this.device.characteristicsForService(UART_SERVICE_UUID);
    const rx = chars.find((c) => c.uuid.toLowerCase() === UART_RX_UUID);
    const tx = chars.find((c) => c.uuid.toLowerCase() === UART_TX_UUID);
    if (!rx || !tx) throw new Error("UART characteristics not found");

    this.rxChar = rx;

    await this.device.monitorCharacteristicForService(
      UART_SERVICE_UUID,
      UART_RX_UUID,
      (error, characteristic) => {
        if (error || !characteristic?.value) return;
        const bytes = Buffer.from(characteristic.value, "base64");
        this.notify$.next(Uint8Array.from(bytes));
      }
    );
  }

  async disconnect() {
    if (this.device) {
      try {
        await manager.cancelDeviceConnection(this.device.id);
      } finally {
        this.device = null;
        this.rxChar = null;
      }
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.device) return false;
    return manager.isDeviceConnected(this.device.id);
  }

  notifications(): Observable<Uint8Array> {
    return this.notify$.asObservable();
  }

  async write(data: Uint8Array) {
    if (!this.device) throw new Error("No conectado");
    const base64Data = Buffer.from(data).toString("base64");
    await this.device!.writeCharacteristicWithoutResponseForService(
      UART_SERVICE_UUID,
      UART_TX_UUID,
      base64Data
    );
  }
}

export const bleTransport = new NativeBLETransport();
export class BLETransport extends NativeBLETransport {}