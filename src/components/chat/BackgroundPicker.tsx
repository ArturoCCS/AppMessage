import { colors } from "@/src/theme/colors";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PRESET_COLORS = [
  "#ECE5DD", // WhatsApp original
  "#FFFFFF", // Blanco
  "#F0F2F5", // Gris claro
  "#E8F5E9", // Verde claro
  "#E3F2FD", // Azul claro
  "#FFF3E0", // Naranja claro
  "#F3E5F5", // Morado claro
  "#FFEBEE", // Rosa claro
  "#263238", // Oscuro
  "#1A1A1A", // Negro suave
];

export function BackgroundPicker({
  visible,
  onClose,
  chatId,
  onBackgroundChange,
}: {
  visible: boolean;
  onClose: () => void;
  chatId: string;
  onBackgroundChange: (bg: { type: "color" | "image"; value: string }) => void;
}) {
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert("Permiso necesario", "Necesitamos acceso a tu galería para seleccionar una imagen.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.5,
    });

    if (!result.canceled && result.assets[0]) {
      const background = { type: "image" as const, value: result.assets[0].uri };
      await AsyncStorage.setItem(`chat_bg_${chatId}`, JSON.stringify(background));
      onBackgroundChange(background);
      onClose();
    }
  };

  const selectColor = async (color: string) => {
    const background = { type: "color" as const, value: color };
    await AsyncStorage.setItem(`chat_bg_${chatId}`, JSON.stringify(background));
    onBackgroundChange(background);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 20,
            paddingBottom: 40,
            maxHeight: "70%",
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
              Personalizar Fondo
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ fontSize: 18, color: colors.primary, fontWeight: "600" }}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ paddingHorizontal: 20 }}>
            {/* Seleccionar imagen */}
            <TouchableOpacity
              onPress={pickImage}
              style={{
                backgroundColor: colors.primary,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>
                📷 Elegir imagen de galería
              </Text>
            </TouchableOpacity>

            {/* Colores predefinidos */}
            <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12, color: colors.text }}>
              O elige un color:
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  onPress={() => selectColor(color)}
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: color,
                    borderRadius: 30,
                    borderWidth: 2,
                    borderColor: colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                  }}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}