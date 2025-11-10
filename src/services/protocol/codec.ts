import { Buffer } from "buffer";
export enum FrameType { Text = 0x01, Ack = 0x10, PullPending = 0x11 }

export interface EncodedFrame { bytes: Uint8Array; msgId: number; }

function strToFixedBytes(str: string, len: number): Uint8Array {
  const src = Buffer.from(str, "utf8");
  const out = new Uint8Array(len);
  out.fill(0);
  out.set(src.subarray(0, len));
  return out;
}

function crc8(data: Uint8Array): number {
  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

let msgCounter = Math.floor(Math.random() * 65535);

export function encodeTextFrame(senderId: string, receiverId: string, text: string): EncodedFrame {
  const payload = Buffer.from(text, "utf8");
  const SYNC = 0xaa, VER = 0x01, TYPE = FrameType.Text, FLAGS = 0x00;
  const MSG_ID = (msgCounter = (msgCounter + 1) & 0xffff);
  const SENDER = strToFixedBytes(senderId, 6);
  const RECEIVER = strToFixedBytes(receiverId, 6);

  const headerLen = 20;
  const buf = new Uint8Array(headerLen + payload.length + 1);
  let o = 0;
  buf[o++] = SYNC; buf[o++] = VER; buf[o++] = TYPE; buf[o++] = FLAGS;
  buf[o++] = (MSG_ID >> 8) & 0xff; buf[o++] = MSG_ID & 0xff;
  buf.set(SENDER, o); o += 6; buf.set(RECEIVER, o); o += 6;
  buf[o++] = (payload.length >> 8) & 0xff; buf[o++] = payload.length & 0xff;
  buf.set(payload, o); o += payload.length;
  buf[o] = crc8(buf.slice(0, o));
  return { bytes: buf, msgId: MSG_ID };
}

export interface DecodedFrame {
  type: FrameType; msgId: number; senderId: string; receiverId: string; payload: Uint8Array;
}

export function tryDecodeFrame(frame: Uint8Array): DecodedFrame | null {
  if (frame.length < 21 || frame[0] !== 0xaa || frame[1] !== 0x01) return null;
  const type = frame[2] as FrameType;
  const msgId = (frame[4] << 8) | frame[5];
  const senderBytes = frame.slice(6, 12);
  const receiverBytes = frame.slice(12, 18);
  const len = (frame[18] << 8) | frame[19];
  const end = 20 + len;
  if (frame.length < end + 1) return null;
  const crc = frame[end];
  const calc = (function(data: Uint8Array){ let c=0; for(let i=0;i<data.length;i++){ c^=data[i]; for(let j=0;j<8;j++){ c=(c&0x80)?((c<<1)^0x07)&0xff:(c<<1)&0xff; } } return c; })(frame.slice(0, end));
  if (crc !== calc) return null;

  const senderId = Buffer.from(senderBytes).toString("utf8").replace(/\x00+$/g, "");
  const receiverId = Buffer.from(receiverBytes).toString("utf8").replace(/\x00+$/g, "");
  const payload = frame.slice(20, end);
  return { type, msgId, senderId, receiverId, payload };
}