import type { Metadata } from "next";
import { GlossaryTable } from "@/components/GlossaryTable";
import { glossary } from "@/content/glossary";

export const metadata: Metadata = {
  title: "Словарь Департамента — термины рынка и их настоящий смысл",
  description:
    "Псевдоофициальный словарь крипторынка: ликвидность, волатильность, стоп-лосс, плечо, FOMO, нарратив — официальные определения и то, что они значат на самом деле.",
};

export default function GlossaryPage() {
  return (
    <div className="wrap py-[56px]">
      <div className="section-head">
        <div>
          <div className="kicker">ОТДЕЛ ТЕРМИНОЛОГИИ · РЕДАКЦИЯ {new Date().getFullYear()}</div>
          <h1 className="mt-4" style={{ fontSize: "clamp(36px, 6.4vw, 86px)" }}>
            СЛОВАРЬ <span style={{ color: "var(--magenta)" }}>ХАОСА</span>
          </h1>
        </div>
        <div className="kicker max-w-[30ch] text-right">
          {glossary.length} ТЕРМИНОВ. ЛЕВАЯ КОЛОНКА — ДЛЯ РЕЗЮМЕ. ПРАВАЯ — ДЛЯ РАБОТЫ.
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="panel">
          <div className="kicker">КАК ЧИТАТЬ</div>
          <p className="mt-3">
            Каждый термин рынка имеет два значения: официальное и рабочее. Официальное
            произносят на конференциях. Рабочее слышно в ночь перед ликвидацией.
          </p>
        </div>
        <div className="panel">
          <div className="kicker">ШКАЛА ОПАСНОСТИ</div>
          <ul className="mt-3 space-y-2">
            <li className="mono" style={{ fontSize: 11, color: "var(--lime)" }}>
              ● НИЗКИЙ — БОЛЬНО, НО ЖИВО
            </li>
            <li className="mono" style={{ fontSize: 11, color: "var(--cyan)" }}>
              ● СРЕДНИЙ — ЛЕЧИТСЯ ЖУРНАЛОМ
            </li>
            <li className="mono" style={{ fontSize: 11, color: "var(--magenta)" }}>
              ● ВЫСОКИЙ — ЛЕЧИТСЯ ТОЛЬКО ВРЕМЕНЕМ
            </li>
            <li className="mono" style={{ fontSize: 11, color: "var(--alarm)" }}>
              ● ЛЕТАЛЬНЫЙ — ЛЕЧЕНИЯ НЕ ПРЕДУСМОТРЕНО
            </li>
          </ul>
        </div>
        <div className="panel panel--paper">
          <h4 style={{ fontSize: 20 }}>ПРЕДУПРЕЖДЕНИЕ</h4>
          <p className="mt-3" style={{ fontSize: 15 }}>
            Словарь не является финансовой рекомендацией. Словарь является описанием местности,
            в которой ты уже находишься.
          </p>
          <div className="stamp">ОЗНАКОМЛЕН</div>
        </div>
      </div>

      <div className="mt-12">
        <GlossaryTable />
      </div>
    </div>
  );
}
