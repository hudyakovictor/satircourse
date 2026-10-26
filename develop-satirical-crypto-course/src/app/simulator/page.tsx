import type { Metadata } from "next";
import { Simulator } from "@/components/Simulator";

export const metadata: Metadata = {
  title: "Тренажёр паники — Департамент управляемой паники",
  description:
    "Интерактивный тренажёр: десять раундов, живой график, три кнопки — ЛОНГ, ШОРТ, ЖДАТЬ. Рынок принимает твои решения и оформляет последствия.",
};

export default function SimulatorPage() {
  return (
    <div className="wrap py-[56px]">
      <div className="section-head">
        <div>
          <div className="kicker">ПРАКТИЧЕСКИЙ БЛОК · ОТДЕЛ ПРИНУДИТЕЛЬНОГО ОПЫТА</div>
          <h1 className="mt-4" style={{ fontSize: "clamp(36px, 6.4vw, 82px)" }}>
            ТРЕНАЖЁР <span style={{ color: "var(--magenta)" }}>ПАНИКИ</span>
          </h1>
        </div>
        <div className="kicker max-w-[32ch] text-right">
          ДЕСЯТЬ РАУНДОВ. ГРАФИК НЕ ЗНАЕТ ТВОИХ ПЛАНОВ. ТЫ НЕ ЗНАЕШЬ ЕГО. ЭТО НАЗЫВАЕТСЯ
          «РЫНОК».
        </div>
      </div>

      <div className="memo">
        <h4>ИНСТРУКЦИЯ ПО ЭКСПЛУАТАЦИИ</h4>
        <p>
          Выберите действие: ЛОНГ — если веришь в рост, ШОРТ — если в падение, ЖДАТЬ — если
          наконец прочитал главу про риск. Правильное решение не всегда прибыльное. Прибыльное
          не всегда правильное. Департамент разъяснений не даёт.
        </p>
        <div className="stamp">К ПРИМЕНЕНИЮ ОБЯЗАТЕЛЬНО</div>
      </div>

      <div className="mt-10">
        <Simulator />
      </div>

      <div className="truth mt-12">
        ТЫ НАЗЫВАЕШЬ ЭТО ТРЕНИРОВКОЙ. ГРАФИК НАЗЫВАЕТ ЭТО РЕПЕТИЦИЕЙ ТВОИХ БУДУЩИХ РЕШЕНИЙ.
      </div>
    </div>
  );
}
