import { Subscription } from "rxjs";
import { LocalDB } from "../../storage/LocalDB";
import { Message, UserId } from "../../types";
import { encodeTextFrame, FrameType, tryDecodeFrame } from "../protocol/codec";
import { Transport } from "../transport/Transport";

function newId(): string {
  const g: any = global;
  if (g?.crypto?.randomUUID) return g.crypto.randomUUID();
  try {
    const { v4 } = require("uuid");
    return v4();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

export class MessagingService {
  constructor(private transport: Transport, private myUserId: UserId) {}

  startReceiving(onIncoming: (msg: Message) => void): Subscription {
    return this.transport.notifications().subscribe(async (buf) => {
      const frame = tryDecodeFrame(buf);
      if (!frame) return;

      if (frame.type === FrameType.Text) {
        const text = Buffer.from(frame.payload).toString("utf8");
        const conversationId = this.conversationIdFor(frame.senderId, frame.receiverId);
        const message: Message = {
          id: newId(),
          conversationId,
          senderId: frame.senderId,
          receiverId: frame.receiverId,
          type: "text",
          body: text,
          timestamp: Date.now(),
          status: "delivered",
          direction: frame.receiverId === this.myUserId ? "in" : "out",
        };
        await LocalDB.appendMessage(message);
        onIncoming(message);
      }
    });
  }

  async sendText(toUserId: UserId, text: string): Promise<Message> {
    const { bytes } = encodeTextFrame(this.myUserId, toUserId, text);
    await this.transport.write(bytes);

    const conversationId = this.conversationIdFor(this.myUserId, toUserId);
    const message: Message = {
      id: newId(),
      conversationId,
      senderId: this.myUserId,
      receiverId: toUserId,
      type: "text",
      body: text,
      timestamp: Date.now(),
      status: "sent",
      direction: "out",
    };
    await LocalDB.appendMessage(message);
    return message;
  }

  conversationIdFor(a: UserId, b: UserId): string {
    return [a, b].sort().join("|");
  }
}