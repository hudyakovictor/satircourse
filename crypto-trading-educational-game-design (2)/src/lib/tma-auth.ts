import { createHmac, timingSafeEqual } from "crypto";

export interface TgUser { id: number; first_name?: string; username?: string }

// Validates Telegram Mini App initData (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app)
export function validateInitData(raw: string, botToken: string, maxAgeSec = 86400): TgUser | null {
  try {
    const params = new URLSearchParams(raw);
    const hash = params.get("hash");
    if (!hash) return null;
    params.delete("hash");
    const dataCheck = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("\n");
    const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
    const calc = createHmac("sha256", secret).update(dataCheck).digest("hex");
    if (calc.length !== hash.length || !timingSafeEqual(Buffer.from(calc), Buffer.from(hash))) return null;
    const authDate = Number(params.get("auth_date") || 0);
    if (!authDate || Date.now() / 1000 - authDate > maxAgeSec) return null;
    const user = params.get("user");
    return user ? (JSON.parse(user) as TgUser) : null;
  } catch {
    return null;
  }
}

export function identify(req: Request): { key: string; verified: boolean; user?: TgUser } | null {
  const h = req.headers.get("authorization") || "";
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (h.startsWith("tma ") && token) {
    const u = validateInitData(h.slice(4), token);
    if (u) return { key: `tg:${u.id}`, verified: true, user: u };
    return null; // tampered initData is rejected
  }
  return { key: "", verified: false };
}
