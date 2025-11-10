export function isUUIDv4(str: string): boolean {
  const re =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return re.test((str ?? "").trim());
}

export function parseContactPayload(
  input: string
): { uid: string; name?: string } | null {
  const s = (input ?? "").trim();
  if (!s) return null;

  try {
    const j = JSON.parse(s);
    if (j && j.t === "contact" && typeof j.uid === "string") {
      const uid = j.uid.trim();
      if (!uid) return null;
      return { uid, name: typeof j.name === "string" ? j.name : undefined };
    }
  } catch {
  }

  if (isUUIDv4(s)) return { uid: s };
  return null;
}