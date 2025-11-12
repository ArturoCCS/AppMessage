type AnyObj = Record<string, any>;

const originalFetch = global.fetch;

const nowIso = () => new Date().toISOString();
const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 10)}`;

function toResponseJSON(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: new Headers({ "Content-Type": "application/json" }),
  });
}
function notFound(): Response {
  return toResponseJSON({ error: "not_found" }, 404);
}
function unauthorized(): Response {
  return toResponseJSON({ error: "unauthorized" }, 401);
}
function badRequest(msg = "bad_request"): Response {
  return toResponseJSON({ error: msg }, 400);
}

function parseUrl(input: any): URL {
  try {
    return new URL(String(input));
  } catch {
    return new URL(String(input), "http://mock.local");
  }
}

function headersToObject(h: HeadersInit | undefined): AnyObj {
  if (!h) return {};
  if (h instanceof Headers) {
    const obj: AnyObj = {};
    h.forEach((v, k) => (obj[k.toLowerCase()] = v));
    return obj;
  }
  if (Array.isArray(h)) {
    const obj: AnyObj = {};
    for (const [k, v] of h) obj[String(k).toLowerCase()] = String(v);
    return obj;
  }
  const obj: AnyObj = {};
  for (const k of Object.keys(h as AnyObj)) obj[k.toLowerCase()] = (h as AnyObj)[k];
  return obj;
}

async function readBody(init?: RequestInit): Promise<any | undefined> {
  if (!init?.body) return undefined;
  if (typeof init.body === "string") {
    try {
      return JSON.parse(init.body);
    } catch {
      return undefined;
    }
  }
  const anyBody: any = init.body as any;
  if (anyBody && Array.isArray(anyBody._parts)) {
    const parts: AnyObj = {};
    anyBody._parts.forEach((p: any[]) => (parts[p[0]] = p[1]));
    return parts;
  }
  return undefined;
}

function hasAuthToken(init?: RequestInit, token?: string): boolean {
  if (!token) return false;
  const h = headersToObject(init?.headers);
  const auth = (h["authorization"] || "") as string;
  return typeof auth === "string" && auth.endsWith(token);
}

const DB = {
  token: "mock-token",
  me: {
    id: "u_me",
    email: "mock@demo.dev",
    name: "Diseño Demo",
    avatarUrl: "https://i.pravatar.cc/150?u=u_me",
  },
  contacts: [
    { id: "u_alice", email: "alice@demo.dev", name: "Alice", avatarUrl: "https://i.pravatar.cc/150?u=alice" },
    { id: "u_bob", email: "bob@demo.dev", name: "Bob", avatarUrl: "https://i.pravatar.cc/150?u=bob" },
  ],
  conversations: [
    { id: "c_alice", type: "direct", createdAt: nowIso() },
    { id: "c_bob", type: "direct", createdAt: nowIso() },
  ],
  messages: [
    { id: uid("m"), conversationId: "c_alice", senderId: "u_alice", content: "¡Hola! Esto es un mock 🙂", createdAt: nowIso(), readAt: null },
    { id: uid("m"), conversationId: "c_alice", senderId: "u_me", content: "¡Perfecto! Estamos en modo diseño.", createdAt: nowIso(), readAt: nowIso() },    
    { id: uid("m"), conversationId: "c_bob", senderId: "u_bob", content: "Mensaje con Bob (mock).", createdAt: nowIso(), readAt: null },
  ] as Array<{ id: string; conversationId: string; senderId: string; content: string; createdAt: string; readAt: string | null }>,
  // Mapeo de usuarios a conversaciones
  userToConv: new Map<string, string>([
    ["u_alice", "c_alice"],
    ["u_bob", "c_bob"],
  ]),
};

async function handleMock(input: any, init?: RequestInit): Promise<Response> {
  const url = parseUrl(input);
  const path = url.pathname;
  const method = (init?.method || "GET").toUpperCase();
  const body = await readBody(init);

  const isKnown =
    path === "/auth/request-otp" ||
    path === "/auth/verify-otp" ||
    path === "/me" ||
    path === "/me/name" ||
    path === "/me/avatar" ||
    path === "/contacts" ||
    path.startsWith("/contacts/") ||
    path === "/conversations" ||
    path === "/messages" ||
    path === "/messages/ack-read" ||
    path.startsWith("/sync");

  if (!isKnown) {
    return originalFetch(input as any, init as any);
  }

  if (path === "/auth/request-otp" && method === "POST") {
    return toResponseJSON({ ok: true });
  }
  if (path === "/auth/verify-otp" && method === "POST") {
    return toResponseJSON({ token: DB.token, user: { ...DB.me } });
  }

  if (path === "/me" && method === "GET") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    return toResponseJSON({ ...DB.me });
  }
  if (path === "/me" && method === "PATCH") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const updates: AnyObj = {};
    if (Object.prototype.hasOwnProperty.call(body || {}, "name")) {
      const n = body?.name;
      updates.name = n == null ? null : String(n).trim() || null;
    }
    if (Object.prototype.hasOwnProperty.call(body || {}, "avatarUrl")) {
      const a = body?.avatarUrl;
      updates.avatarUrl = !a ? null : String(a);
    }
    Object.assign(DB.me, updates);
    return toResponseJSON({ ok: true, user: { ...DB.me } });
  }
  if (path === "/me/name" && method === "POST") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const h = headersToObject(init?.headers);
    const qName = url.searchParams.get("name");
    const hName = (h["x-name"] as string) || (h["X-Name"] as string);
    const bName = body?.name;
    const raw = bName ?? qName ?? hName ?? null;
    DB.me.name = raw == null ? null : String(raw).trim() || null;
    return toResponseJSON({ ok: true, user: { ...DB.me } });
  }
  if (path === "/me/avatar" && method === "POST") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    DB.me.avatarUrl = `https://i.pravatar.cc/300?u=${DB.me.id}`;
    return toResponseJSON({ ok: true, avatarUrl: DB.me.avatarUrl, user: { ...DB.me } });
  }
  if (path === "/me/avatar" && method === "DELETE") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    DB.me.avatarUrl = null as any;
    return toResponseJSON({ ok: true, user: { ...DB.me } });
  }

  if (path === "/contacts" && method === "GET") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    return toResponseJSON(DB.contacts.map(c => ({ id: c.id, email: c.email, name: c.name ?? null, avatarUrl: c.avatarUrl ?? null })));      
  }
  if (path === "/contacts" && method === "POST") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const { email, userId } = body || {};
    let id = userId || uid("u");
    let name = email ? String(email).split("@")[0] : "Nuevo";
    if (userId) {
      const found = DB.contacts.find(c => c.id === userId);
      if (found) return toResponseJSON({ ok: true });
    }
    DB.contacts.push({
      id,
      email: email || `${name}@demo.dev`,
      name,
      avatarUrl: `https://i.pravatar.cc/150?u=${id}`,
    });
    const convId = `c_${id}`;
    if (!DB.conversations.find(c => c.id === convId)) {
      DB.conversations.push({ id: convId, type: "direct", createdAt: nowIso() });
      DB.userToConv.set(id, convId);
    }
    return toResponseJSON({ ok: true });
  }
  if (path.startsWith("/contacts/") && method === "DELETE") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const id = path.split("/").pop()!;
    DB.contacts = DB.contacts.filter(c => c.id !== id);
    return toResponseJSON({ ok: true });
  }

  if (path === "/conversations" && method === "GET") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    return toResponseJSON(DB.conversations);
  }

  if (path === "/messages" && method === "GET") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const convId = url.searchParams.get("conversationId");
    if (!convId) return badRequest("missing_conversationId");
    const since = url.searchParams.get("since");
    const list = DB.messages
      .filter(m => m.conversationId === convId)
      .filter(m => (since ? Date.parse(m.createdAt) > Date.parse(since) : true));
    return toResponseJSON(list);
  }
  
  if (path === "/messages" && method === "POST") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const { toUserId, content } = body || {};
    if (!content) return badRequest("missing_content");
    
    let conversationId: string;
    
    // Si toUserId es un ID de conversación existente (c_xxx), úsalo
    if (toUserId.startsWith('c_')) {
      conversationId = toUserId;
    } else {
      // Es un ID de usuario, busca conversación existente
      const existingConv = DB.userToConv.get(toUserId);
      
      if (existingConv) {
        // Ya existe conversación con este usuario
        conversationId = existingConv;
      } else {
        // Nueva conversación con este usuario
        conversationId = `c_${toUserId}`;
        
        // Solo crea nueva conversación si no existe
        if (!DB.conversations.find(c => c.id === conversationId)) {
          DB.conversations.push({ id: conversationId, type: "direct", createdAt: nowIso() });
        }
        
        DB.userToConv.set(toUserId, conversationId);
      }
    }
    
    const msg = {
      id: uid("m"),
      conversationId,
      senderId: DB.me.id,
      content: String(content),
      createdAt: nowIso(),
      readAt: null,
    };
    
    DB.messages.push(msg);
    return toResponseJSON({ conversationId, message: msg });
  }
  
  if (path === "/messages/ack-read" && method === "POST") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    const { conversationId } = body || {};
    
    if (conversationId) {
      // Marca todos los mensajes de esta conversación como leídos
      DB.messages.forEach(msg => {
        if (msg.conversationId === conversationId && msg.senderId !== DB.me.id && !msg.readAt) {
          msg.readAt = nowIso();
        }
      });
    }
    
    return toResponseJSON({ ok: true });
  }

  if (path.startsWith("/sync") && method === "GET") {
    if (!hasAuthToken(init, DB.token)) return unauthorized();
    return toResponseJSON({ messages: DB.messages });
  }

  if (path.startsWith("/uploads/")) {
    return notFound();
  }

  return notFound();
}

global.fetch = (async (input: any, init?: RequestInit) => {
  try {
    return await handleMock(input, init);
  } catch (e: any) {
    return toResponseJSON({ error: e?.message || "mock_error" }, 500);
  }
}) as typeof fetch;

class DummyWebSocket {
  url: string;
  readyState: number = 1;
  onopen?: () => void;
  onmessage?: (ev: { data: any }) => void;
  onclose?: () => void;
  onerror?: (e: any) => void;
  constructor(url: string) {
    this.url = url;
    setTimeout(() => this.onopen && this.onopen(), 10);
  }
  send(_data: any) {}
  close() {
    this.readyState = 3;
    this.onclose && this.onclose();
  }
  addEventListener(type: string, cb: any) {
    if (type === "open") this.onopen = cb;
    if (type === "message") this.onmessage = cb;
    if (type === "close") this.onclose = cb;
    if (type === "error") this.onerror = cb;
  }
  removeEventListener() {}
}
(global as any).WebSocket = DummyWebSocket;

console.log("[mock-api] Mock API enabled with in-memory data");