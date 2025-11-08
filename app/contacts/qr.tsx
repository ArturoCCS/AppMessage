import { Avatar } from "@/src/components/ui/Avatar";
import { ContactsService } from "@/src/services/contacts/ContactsService";
import { useUser } from "@/src/state/UserContext";
import { parseContactPayload } from "@/src/utils/validate";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Dimensions, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

type CameraExports = {
  Camera: { requestCameraPermissionsAsync: () => Promise<{ status: "granted" | "denied" }> };
  CameraView: React.ComponentType<{
    style?: any;
    onBarcodeScanned?: (event: { data: string; type: string }) => void;
    barcodeScannerSettings?: { barcodeTypes?: string[] };
  }>;
};

type TabKey = "my" | "scan";

export default function ContactQRScreen() {
  const { me, shareId } = useUser();

  const [tab, setTab] = useState<TabKey>("my");
  const [CameraViewComp, setCameraViewComp] = useState<CameraExports["CameraView"] | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const qrRef = useRef<any>(null);

  const payload = useMemo(
    () =>
      JSON.stringify({
        t: "contact",
        v: 1,
        uid: shareId,
        name: me?.name ?? "Usuario",
      }),
    [shareId, me?.name]
  );

  const startCamera = useCallback(async () => {
    setLoadingCamera(true);
    try {
      const { Camera, CameraView } = (await import("expo-camera")) as CameraExports;
      if (!Camera || !CameraView) throw new Error("expo-camera no disponible.");
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
      setCameraViewComp(() => CameraView);
      setCameraReady(true);
      if (status !== "granted") {
        Alert.alert("Permiso requerido", "Habilita la cámara para escanear el código.");
      }
    } catch {
      setHasPermission(false);
      setCameraReady(false);
      setCameraViewComp(null);
      Alert.alert("Cámara no disponible", "No se pudo cargar la cámara en este entorno.");
    } finally {
      setLoadingCamera(false);
    }
  }, []);

  const handleScannedValue = useCallback(
    async (raw: string) => {
      const parsed = parseContactPayload(raw);
      if (!parsed) {
        Alert.alert("Código inválido", "No es un ID o JSON de contacto válido.");
        return;
      }
      if (me && parsed.uid === me.id) {
        Alert.alert("ID inválido", "No puedes agregarte a ti mismo.");
        return;
      }
      if (await ContactsService.exists(parsed.uid)) {
        Alert.alert("Duplicado", "Ese contacto ya existe en tu lista.");
        return;
      }
      const c = await ContactsService.addOutgoing(parsed.uid, parsed.name ?? "Contacto");
      Alert.alert("Contacto agregado", `"${c.name}" (${c.id}) en estado ${c.status}.`, [
        { text: "OK", onPress: () => router.replace("/contacts") },
      ]);
    },
    [me]
  );

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);
      handleScannedValue(data).finally(() => setTimeout(() => setScanned(false), 1200));
    },
    [handleScannedValue, scanned]
  );

  const exportQrPng = useCallback(async (): Promise<string> => {
    if (!qrRef.current) throw new Error("QR no listo");
    const base64: string = await new Promise((resolve) => {
      qrRef.current.toDataURL((b64: string) => resolve(b64));
    });

    const {
      cacheDirectory,
      writeAsStringAsync,
      EncodingType,
    } = (await import("expo-file-system")) as typeof import("expo-file-system");

    const filename = `my_contact_qr_${Date.now()}.png`;
    const uri = `${cacheDirectory}${filename}`;
    await writeAsStringAsync(uri, base64, { encoding: EncodingType.Base64 });
    return uri;
  }, []);

  const shareQrImage = useCallback(async () => {
    try {
      const uri = await exportQrPng();

      try {
        const Sharing = (await import("expo-sharing")) as typeof import("expo-sharing");
        if (Sharing.isAvailableAsync && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(uri);
          return;
        }
      } catch {
      }
      try {
        const MediaLibrary =
          (await import("expo-media-library")) as typeof import("expo-media-library");
        const perm = await MediaLibrary.requestPermissionsAsync();
        if (perm.status !== "granted") {
          Alert.alert("Permiso requerido", "Habilita acceso a fotos para guardar el QR.");
          return;
        }
        await MediaLibrary.saveToLibraryAsync(uri);
        Alert.alert("Guardado", "El QR se guardó en tu galería.");
      } catch {
        Alert.alert("No se pudo compartir", "Intenta de nuevo o realiza una captura de pantalla.");
      }
    } catch {
      Alert.alert("No se pudo compartir", "Intenta de nuevo.");
    }
  }, [exportQrPng]);

  const cameraUnavailable = !cameraReady || CameraViewComp == null || hasPermission === false;
  const screenW = Dimensions.get("window").width;
  const squareSize = Math.min(screenW * 0.75, 280);

  return (
    <View style={{ flex: 1, backgroundColor: "#111" }}>

      <View style={{ paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12, backgroundColor: "#111", borderBottomWidth: 1, borderBottomColor: "#222", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <Text style={{ color: "#9ad", fontWeight: "700" }}>Volver</Text>
        </TouchableOpacity>
        <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>Código QR</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={{ backgroundColor: "#111" }}>
        <View style={{ flexDirection: "row" }}>
          <TabItem title="Mi código" active={tab === "my"} onPress={() => setTab("my")} />
          <TabItem
            title="Escanear código"
            active={tab === "scan"}
            onPress={() => {
              setTab("scan");
              if (!cameraReady) startCamera();
            }}
          />
        </View>
        <View style={{ height: 2, backgroundColor: "#1f1f1f" }}>
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: tab === "my" ? 0 : "50%",
              width: "50%",
              height: 2,
              backgroundColor: "#18c964",
            }}
          />
        </View>
      </View>

      {tab === "my" ? (
        <View style={{ flex: 1, alignItems: "center", padding: 20, backgroundColor: "#111" }}>
          <View style={{ marginTop: 16, alignItems: "center", gap: 12 }}>
            <Avatar uri={me?.avatar} name={me?.name} size={64} />
            <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>{me?.name ?? "Tú"}</Text>
            <Text style={{ color: "#9aa" }}>Contacto Message</Text>
          </View>

          <View style={{ marginTop: 18, padding: 16, backgroundColor: "#1b1b1b", borderRadius: 16 }}>
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}>
              <QRCode
                value={payload}
                size={squareSize * 0.8}
                getRef={(r) => (qrRef.current = r)}
                logo={me?.avatar ? { uri: me.avatar } : undefined}
                logoSize={squareSize * 0.18}
                logoBackgroundColor="white"
              />
            </View>
          </View>

        </View>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#000" }}>
          {!cameraUnavailable && CameraViewComp ? (
            <View style={{ flex: 1 }}>
              <CameraViewComp
                style={{ flex: 1 }}
                onBarcodeScanned={onBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
              />
              <ScannerOverlay squareSize={squareSize} />
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}>
              <Text style={{ color: "white", textAlign: "center", marginBottom: 16 }}>
                {hasPermission === false ? "Permiso de cámara denegado." : "Cámara no disponible en este entorno."}
              </Text>
              <TouchableOpacity
                onPress={() => startCamera()}
                disabled={loadingCamera}
                style={{
                  backgroundColor: "#2d7cf0",
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 10,
                  opacity: loadingCamera ? 0.7 : 1,
                }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>
                  {loadingCamera ? "Cargando cámara…" : "Intentar de nuevo"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function TabItem({ title, active, onPress }: { title: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, paddingVertical: 12, alignItems: "center" }}>
      <Text style={{ color: active ? "white" : "#888", fontWeight: active ? "800" : "600" }}>{title}</Text>
    </TouchableOpacity>
  );
}

function ScannerOverlay({ squareSize }: { squareSize: number }) {
  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
      <View style={{ height: squareSize, flexDirection: "row" }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
        <View
          style={{
            width: squareSize,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: "#18c964",
            backgroundColor: "transparent",
          }}
        />
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
      </View>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
    </View>
  );
}