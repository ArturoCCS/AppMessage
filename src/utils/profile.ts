import { API_URL } from "./config";

export async function setNameForce(token: string, rawName: string | null) {
  const safe = rawName ?? "";
  const qs = `?name=${encodeURIComponent(safe)}`;
  const body = JSON.stringify({ name: rawName });

  const res = await fetch(`${API_URL}/me/name${qs}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-name": safe,
    } as any,
    body,
  });

  const text = await res.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as { ok?: true; user?: { id: string; email: string; name?: string | null; avatarUrl?: string | null } };
}