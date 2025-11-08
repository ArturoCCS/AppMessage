import { io, Socket } from "socket.io-client";
import type { Message } from "../utils/api";
import { API_URL } from "../utils/config";

let socket: Socket | null = null;
let onMessageCb: ((m: Message) => void) | null = null;
let onPendingCb: ((msgs: Message[]) => void) | null = null;

export function connectSocket(token: string) {
  if (socket) return;
  socket = io(API_URL, {
    transports: ["websocket"],
    auth: { token },
  });
  socket.on("connect", () => console.log("[socket] connected", socket?.id));
  socket.on("disconnect", () => console.log("[socket] disconnected"));
  socket.on("message:new", (m: Message) => onMessageCb?.(m));
  socket.on("messages:pending", (msgs: Message[]) => onPendingCb?.(msgs));
}

export function onMessage(cb: (m: Message) => void) { onMessageCb = cb; }
export function onPending(cb: (msgs: Message[]) => void) { onPendingCb = cb; }

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}