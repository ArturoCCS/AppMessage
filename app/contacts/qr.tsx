import { Avatar } from "@/src/components/ui/Avatar";
import { useUser } from "@/src/state/UserContext";
import { api } from "@/src/utils/api";
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
  const { me, token } = useUser();
  const shareId = me?.id ?? "";
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
    } catch (e: any) {
      console.warn("[QR] Cámara error:", e.message);
      setHasPermission(false);
      setCameraReady(false);
      setCameraViewComp(null);
      Alert.alert("Cámara no disponible", "No se pudo cargar la cámara.");
    } finally {
      setLoadingCamera(false);
    }
  }, []);

  const handleScannedValue = useCallback(
    async (raw: string) => {
      if (!token) {
        Alert.alert("Sesión", "No hay sesión activa.");
        return;
      }
      try {
        const parsed = JSON.parse(raw || "{}");
        if (parsed?.t !== "contact" || !parsed?.uid) throw new Error("invalid");
        const theirId: string = String(parsed.uid);
        if (me && theirId === me.id) {
          Alert.alert("ID inválido", "No puedes agregarte a ti mismo.");
          return;
        }
        const current = await api.listContacts(token);
        if (current.some(c => c.id === theirId)) {
          Alert.alert("Duplicado", "Ese contacto ya existe.");
          return;
        }
        await api.addContactByUserId(token, theirId);
        Alert.alert("Contacto agregado", "Se agregó correctamente.", [
          { text: "OK", onPress: () => router.replace("/contacts") },
        ]);
      } catch {
        Alert.alert("Código inválido", "QR de contacto no válido.");
      }
    },
    [me, token]
  );

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scanned) return;
      setScanned(true);
      handleScannedValue(data).finally(() => setTimeout(() => setScanned(false), 1200));
    },
    [handleScannedValue, scanned]
  );

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
        <View style={{ flex: 1, alignItems: "center", padding: 20 }}>
          <View style={{ marginTop: 16, alignItems: "center", gap: 12 }}>
            <Avatar uri={me?.avatarUrl || me?.avatar || undefined} name={me?.name || me?.email} size={64} />
            <Text style={{ color: "white", fontSize: 20, fontWeight: "800" }}>{me?.name ?? "Tú"}</Text>
            <Text style={{ color: "#9aa" }}>Contacto Message</Text>
          </View>
          <View style={{ marginTop: 18, padding: 16, backgroundColor: "#1b1b1b", borderRadius: 16 }}>
            <View style={{ backgroundColor: "white", borderRadius: 16, padding: 16 }}>
              <QRCode
                value={payload}
                size={squareSize * 0.8}
                getRef={(r) => (qrRef.current = r)}
                logo={me?.avatarUrl ? { uri: me.avatarUrl } : undefined}
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
                {hasPermission === false ? "Permiso de cámara denegado." : "Cámara no disponible."}
              </Text>
              <TouchableOpacity
                onPress={() => startCamera()}
                disabled={loadingCamera}
                style={{ backgroundColor: "#2d7cf0", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, opacity: loadingCamera ? 0.7 : 1 }}
              >
                <Text style={{ color: "white", fontWeight: "800" }}>
                  {loadingCamera ? "Cargando…" : "Intentar de nuevo"}
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
        <View style={{ width: squareSize, borderRadius: 20, borderWidth: 2, borderColor: "#18c964", backgroundColor: "transparent" }} />
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
      </View>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} />
    </View>
  );
}