"use client";
// Synthesized UI/SFX layer (game-audio skill: synthesis for UI, priority: player feedback > music).
let ctx: AudioContext | null = null;
let muted = false;
export const setMuted = (m: boolean) => { muted = m; };
export const isMuted = () => muted;

function ac() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const C = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.12, slideTo?: number, delay = 0) {
  if (muted) return;
  const c = ac(); if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
}

export const sfx = {
  tap: () => tone(660, 0.05, "triangle", 0.06),
  select: () => tone(880, 0.04, "sine", 0.05),
  good: () => { tone(660, 0.08, "triangle", 0.1); tone(990, 0.12, "triangle", 0.1, undefined, 0.07); },
  bad: () => tone(220, 0.22, "sawtooth", 0.07, 110),
  tick: () => tone(1200, 0.03, "square", 0.03),
  whoosh: () => tone(300, 0.25, "sine", 0.06, 1200),
  coin: () => { tone(1320, 0.06, "square", 0.05); tone(1760, 0.1, "square", 0.05, undefined, 0.05); },
  hit: () => { tone(120, 0.18, "square", 0.1, 50); },
  count: () => tone(520, 0.1, "triangle", 0.08),
  go: () => tone(880, 0.25, "triangle", 0.1, 1320),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.09, undefined, i * 0.09)),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.22, "sine", 0.08, undefined, i * 0.12)),
  star: (i: number) => tone(880 + i * 220, 0.15, "triangle", 0.09),
};
