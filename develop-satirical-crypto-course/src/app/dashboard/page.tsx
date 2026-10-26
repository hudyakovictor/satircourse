import type { Metadata } from "next";
import { Dashboard } from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Личное дело участника — Департамент управляемой паники",
  description:
    "Прогресс по курсу, результаты допросов, журнал жертвоприношений и протокол тренажёра паники.",
};

export default function DashboardPage() {
  return (
    <div className="wrap py-[56px]">
      <div className="section-head">
        <div>
          <div className="kicker">АРХИВ · ДЕЛО №{String(new Date().getFullYear())}/01</div>
          <h1 className="mt-4" style={{ fontSize: "clamp(36px, 6.4vw, 84px)" }}>
            ЛИЧНОЕ <span style={{ color: "var(--magenta)" }}>ДЕЛО</span>
          </h1>
        </div>
        <div className="kicker max-w-[32ch] text-right">
          ВСЁ, ЧТО ТЫ СДЕЛАЛ В ЭТОМ КУРСЕ, ХРАНИТСЯ ЗДЕСЬ. РЫНОК ТОЖЕ ЧТО-ТО ЗАПИСАЛ. ЕГО
          ВЕРСИЯ ПОКА ЛУЧШЕ.
        </div>
      </div>

      <Dashboard />

      <div className="truth mt-12">
        МЫ ЦЕНИМ ТВОЙ ВКЛАД В ЭКОСИСТЕМУ. ОСОБЕННО ТЕ 84%, КОТОРЫЕ БОЛЬШЕ НЕ ПРИНАДЛЕЖАТ ТЕБЕ.
      </div>
    </div>
  );
}
