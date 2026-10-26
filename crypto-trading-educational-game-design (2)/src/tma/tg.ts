"use client";
// Telegram Mini Apps bridge (window.Telegram.WebApp) with graceful browser fallback.

type Haptic = {
  impactOccurred: (s: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
  notificationOccurred: (t: "error" | "success" | "warning") => void;
  selectionChanged: () => void;
};
type Btn = { show: () => void; hide: () => void; onClick: (cb: () => void) => void; offClick: (cb: () => void) => void };
type Cloud = {
  setItem: (k: string, v: string, cb?: (e: unknown, ok?: boolean) => void) => void;
  getItem: (k: string, cb: (e: unknown, v?: string) => void) => void;
};
export interface WebApp {
  initData: string;
  initDataUnsafe: { user?: { id: number; first_name?: string; username?: string; photo_url?: string } };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  ready: () => void;
  expand: () => void;
  close: () => void;
  isVersionAtLeast: (v: string) => boolean;
  requestFullscreen?: () => void;
  disableVerticalSwipes?: () => void;
  enableClosingConfirmation?: () => void;
  disableClosingConfirmation?: () => void;
  setHeaderColor?: (c: string) => void;
  setBackgroundColor?: (c: string) => void;
  setBottomBarColor?: (c: string) => void;
  lockOrientation?: () => void;
  HapticFeedback?: Haptic;
  BackButton?: Btn;
  CloudStorage?: Cloud;
  onEvent: (e: string, cb: () => void) => void;
  offEvent: (e: string, cb: () => void) => void;
}

declare global {
  interface Window { Telegram?: { WebApp?: WebApp } }
}

export const tg = (): WebApp | undefined => (typeof window !== "undefined" ? window.Telegram?.WebApp : undefined);
export const inTelegram = () => !!tg()?.initData;
const at = (v: string) => { try { return !!tg()?.isVersionAtLeast(v); } catch { return false; } };

export function initTelegram() {
  const w = tg();
  if (!w) return;
  try {
    w.ready();
    w.expand();
    if (at("7.7")) w.disableVerticalSwipes?.();
    if (at("6.1")) { w.setHeaderColor?.("#05080f"); w.setBackgroundColor?.("#05080f"); }
    if (at("7.10")) w.setBottomBarColor?.("#05080f");
    // Fullscreen only on mobile clients (desktop fullscreen is disruptive)
    if (at("8.0") && ["android", "ios"].includes(w.platform)) w.requestFullscreen?.();
    if (at("8.0") && ["android", "ios"].includes(w.platform)) w.lockOrientation?.();
  } catch { /* noop */ }
}

let hapticsOn = true;
export const setHaptics = (v: boolean) => { hapticsOn = v; };
export const haptic = {
  tap: () => { if (hapticsOn && at("6.1")) tg()?.HapticFeedback?.impactOccurred("light"); else vib(8); },
  hit: () => { if (hapticsOn && at("6.1")) tg()?.HapticFeedback?.impactOccurred("heavy"); else vib(25); },
  select: () => { if (hapticsOn && at("6.1")) tg()?.HapticFeedback?.selectionChanged(); },
  ok: () => { if (hapticsOn && at("6.1")) tg()?.HapticFeedback?.notificationOccurred("success"); else vib(15); },
  bad: () => { if (hapticsOn && at("6.1")) tg()?.HapticFeedback?.notificationOccurred("error"); else vib([30, 40, 30]); },
  warn: () => { if (hapticsOn && at("6.1")) tg()?.HapticFeedback?.notificationOccurred("warning"); },
};
function vib(p: number | number[]) { if (hapticsOn && typeof navigator !== "undefined" && "vibrate" in navigator && !tg()) try { navigator.vibrate(p); } catch { /* */ } }

let backCb: (() => void) | null = null;
export function setBack(cb: (() => void) | null) {
  const b = tg()?.BackButton;
  if (!b || !at("6.1")) return;
  if (backCb) b.offClick(backCb);
  backCb = cb;
  if (cb) { b.onClick(cb); b.show(); } else b.hide();
}

export function closingConfirm(on: boolean) {
  if (!at("6.2")) return;
  if (on) tg()?.enableClosingConfirmation?.(); else tg()?.disableClosingConfirmation?.();
}

// CloudStorage (synced across devices) with localStorage fallback
export function cloudGet(key: string): Promise<string | null> {
  return new Promise((res) => {
    const c = tg()?.CloudStorage;
    if (c && at("6.9") && inTelegram()) c.getItem(key, (e, v) => res(e ? localStorage.getItem(key) : v || localStorage.getItem(key)));
    else res(typeof localStorage !== "undefined" ? localStorage.getItem(key) : null);
  });
}
export function cloudSet(key: string, v: string) {
  try { localStorage.setItem(key, v); } catch { /* */ }
  const c = tg()?.CloudStorage;
  if (c && at("6.9") && inTelegram()) c.setItem(key, v);
}

export const authHeader = (): Record<string, string> => (inTelegram() ? { Authorization: `tma ${tg()!.initData}` } : {});
export const tgUser = () => tg()?.initDataUnsafe?.user;
