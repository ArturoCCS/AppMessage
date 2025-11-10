import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatBackground = {
  type: 'color' | 'image';
  value: string; // color hex o URI de imagen
};

type ThemeSettings = {
  chatListBackground?: string; // color hex
  chatBackgrounds: { [chatId: string]: ChatBackground };
};

type ThemeContextType = {
  settings: ThemeSettings;
  setChatListBackground: (color: string) => Promise<void>;
  setChatBackground: (chatId: string, background: ChatBackground) => Promise<void>;
  getChatBackground: (chatId: string) => ChatBackground | null;
  resetChatBackground: (chatId: string) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@theme_settings';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<ThemeSettings>({
    chatBackgrounds: {},
  });

  // Cargar settings al inicio
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  };

  const saveSettings = async (newSettings: ThemeSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  };

  const setChatListBackground = async (color: string) => {
    const newSettings = { ...settings, chatListBackground: color };
    await saveSettings(newSettings);
  };

  const setChatBackground = async (chatId: string, background: ChatBackground) => {
    const newSettings = {
      ...settings,
      chatBackgrounds: {
        ...settings.chatBackgrounds,
        [chatId]: background,
      },
    };
    await saveSettings(newSettings);
  };

  const getChatBackground = (chatId: string): ChatBackground | null => {
    return settings.chatBackgrounds[chatId] || null;
  };

  const resetChatBackground = async (chatId: string) => {
    const { [chatId]: removed, ...rest } = settings.chatBackgrounds;
    const newSettings = {
      ...settings,
      chatBackgrounds: rest,
    };
    await saveSettings(newSettings);
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        setChatListBackground,
        setChatBackground,
        getChatBackground,
        resetChatBackground,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}