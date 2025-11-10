import AsyncStorage from "@react-native-async-storage/async-storage";
import bs58 from "bs58";
import * as SecureStore from "expo-secure-store";
import nacl from "tweetnacl";

const PK_SEED_KEY = "identity.seed";
const META_KEY = "identity.meta";

const SafeStore = {
  async getItem(key: string): Promise<string | null> {
    try {
      const v = await SecureStore.getItemAsync(key);
      if (v != null) return v;
    } catch {}
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    let ok = false;
    try {
      await SecureStore.setItemAsync(key, value, { keychainService: key });
      ok = true;
    } catch {}
    if (!ok) {
      try {
        await AsyncStorage.setItem(key, value);
        ok = true;
      } catch {}
    }
    if (!ok) throw new Error("No se pudo persistir valor");
  },
};

export type Identity = {
  id: string;
  publicKey: string;
};

function toBase58(bytes: Uint8Array) {
  return bs58.encode(bytes);
}
function fromBase58(s: string) {
  return bs58.decode(s);
}

async function loadSeed(): Promise<Uint8Array | null> {
  try {
    const s = await SafeStore.getItem(PK_SEED_KEY);
    if (!s) return null;
    return fromBase58(s);
  } catch {
    return null;
  }
}

async function saveSeed(seed: Uint8Array): Promise<void> {
  await SafeStore.setItem(PK_SEED_KEY, toBase58(seed));
}

function genSeed(): Uint8Array {
  return nacl.randomBytes(32);
}

function deriveFromSeed(seed: Uint8Array): { publicKey: Uint8Array } {
  const kp = nacl.sign.keyPair.fromSeed(seed);
  return { publicKey: kp.publicKey };
}

function deriveId(pubKey: Uint8Array): string {
  return toBase58(pubKey);
}

export const IdentityService = {
  async hasIdentity(): Promise<boolean> {
    const seed = await loadSeed();
    return !!seed;
  },

  async getOrCreate(): Promise<Identity> {
    let seed = await loadSeed();
    if (!seed) {
      seed = genSeed();
      await saveSeed(seed);
      try {
        await SafeStore.setItem(META_KEY, JSON.stringify({ v: 1, createdAt: Date.now() }));
      } catch {}
    }
    const { publicKey } = deriveFromSeed(seed);
    return { id: deriveId(publicKey), publicKey: toBase58(publicKey) };
  },

  async exportSecret(): Promise<string> {
    let seed = await loadSeed();
    if (!seed) {
      seed = genSeed();
      await saveSeed(seed);
      try {
        await SafeStore.setItem(META_KEY, JSON.stringify({ v: 1, createdAt: Date.now() }));
      } catch {}
    }
    return toBase58(seed);
  },

  async importSecret(input: string): Promise<Identity> {
    let s = input.trim();
    try {
      const j = JSON.parse(s);
      if (j && j.t === "identity" && typeof j.sk === "string") s = j.sk;
    } catch {}
    const seed = fromBase58(s);
    if (!seed?.length || seed.length !== 32) {
      throw new Error("Secreto inválido: se espera seed base58 de 32 bytes");
    }
    await saveSeed(seed);
    const { publicKey } = deriveFromSeed(seed);
    return { id: deriveId(publicKey), publicKey: toBase58(publicKey) };
  },
};