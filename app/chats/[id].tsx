import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  Animated,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useChat } from "@/src/state/ChatContext";
import { LinearGradient } from "expo-linear-gradient";
import type { Message } from "@/src/utils/api";
import { FadeInView } from "@/src/components/animations/FadeInView";
import { ScaleInView } from "@/src/components/animations/ScaleInView";

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { subscribe, sendMessage, me } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputHeight = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (!id || typeof id !== "string") return;
    const unsub = subscribe(id, setMessages);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !id || typeof id !== "string" || sending) return;
    
    const text = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await sendMessage(id, text);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMe = item.senderId === me?.id;
    const showAvatar = index === 0 || messages[index - 1]?.senderId !== item.senderId;

    return (
      <FadeInView delay={index * 30} style={{ marginBottom: 12 }}>
        <View style={[styles.messageRow, isMe && styles.messageRowRight]}>
          {!isMe && showAvatar && (
            <View style={styles.avatarSmall}>
              <Text style={styles.avatarSmallText}>
                {item.senderId?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
          {!isMe && !showAvatar && <View style={{ width: 32 }} />}

          <ScaleInView style={{ flex: 1 }}>
            <View style={[
              styles.messageBubble,
              isMe ? styles.messageBubbleMe : styles.messageBubbleThem
            ]}>
              <Text style={[
                styles.messageText,
                isMe && styles.messageTextMe
              ]}>
                {item.content}
              </Text>
              <Text style={[
                styles.messageTime,
                isMe && styles.messageTimeMe
              ]}>
                {formatTime(item.createdAt)}
              </Text>
            </View>
          </ScaleInView>

          {isMe && <View style={{ width: 8 }} />}
        </View>
      </FadeInView>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#0a7ea4', '#0c4a6e']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>
              {id?.toString()[0]?.toUpperCase() || 'D'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Direct</Text>
            <Text style={styles.headerSubtitle}>En línea</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.headerAction}>
          <Text style={styles.headerActionText}>⋮</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        ListEmptyComponent={
          <FadeInView style={styles.emptyMessages}>
            <Text style={styles.emptyIcon}>💬</Text>
            <Text style={styles.emptyText}>No hay mensajes aún</Text>
            <Text style={styles.emptySubtext}>Inicia la conversación</Text>
          </FadeInView>
        }
      />

      {/* Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Escribe un mensaje..."
              placeholderTextColor="#94a3b8"
              style={styles.input}
              multiline
              maxLength={1000}
              onFocus={() => {
                Animated.timing(inputHeight, {
                  toValue: 70,
                  duration: 200,
                  useNativeDriver: false,
                }).start();
              }}
              onBlur={() => {
                if (!inputText) {
                  Animated.timing(inputHeight, {
                    toValue: 50,
                    duration: 200,
                    useNativeDriver: false,
                  }).start();
                }
              }}
            />
            
            <TouchableOpacity
              onPress={handleSend}
              disabled={!inputText.trim() || sending}
              style={[
                styles.sendButton,
                (!inputText.trim() || sending) && styles.sendButtonDisabled
              ]}
            >
              <Text style={styles.sendButtonText}>
                {sending ? '⏳' : '📤'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 6,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: '400',
    marginTop: -4,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0a7ea4',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  headerAction: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionText: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '700',
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowRight: {
    justifyContent: 'flex-end',
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  avatarSmallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  messageBubbleThem: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  messageBubbleMe: {
    backgroundColor: '#0a7ea4',
    borderBottomRightRadius: 4,
    alignSelf: 'flex-end',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  messageText: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTextMe: {
    color: '#ffffff',
  },
  messageTime: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
  },
  messageTimeMe: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  emptyMessages: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: '#94a3b8',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
    maxHeight: 100,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0a7ea4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a7ea4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0,
  },
  sendButtonText: {
    fontSize: 22,
  },
});