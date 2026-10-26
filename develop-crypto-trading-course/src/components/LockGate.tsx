"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useProgress } from "./ProgressProvider";

export function LockGate({ prevExamCode, prevModule, children }: { prevExamCode?: string; prevModule?: string; children: ReactNode }) {
  const { get, unlockAll, ready, setUnlockAll } = useProgress();
  if (!prevExamCode) return <>{children}</>;
  if (!ready) return <div className="opacity-0">{children}</div>;
  if (unlockAll || get(prevExamCode).completed) return <>{children}</>;
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="card3d p-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/mascot-warning.png" alt="" className="mascot-blend mx-auto h-56 object-contain" />
        <h2 className="mt-2 text-2xl font-black">Глава закрыта 🔒</h2>
        <p className="mt-2 font-semibold opacity-75">Сначала пройдите экзамен модуля {prevModule} ({prevExamCode}) минимум на 80%. Скрепка не пускает тех, кто пропустил стоп.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={`/lesson/${prevExamCode}`} className="btn3d">К экзамену {prevExamCode}</Link>
          <button className="btn3d btn3d-ghost" onClick={() => setUnlockAll(true)}>Открыть все главы</button>
        </div>
      </div>
    </div>
  );
}
