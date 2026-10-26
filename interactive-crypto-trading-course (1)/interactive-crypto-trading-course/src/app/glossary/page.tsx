import { Illustration } from "@/components/Illustration";
import { GlossaryList } from "@/components/GlossaryList";
import { glossary } from "@/lib/course";

export const metadata = { title: "Глоссарий трейдера — Signal Arena" };

export default function GlossaryPage() {
  return (
    <div className="space-y-8">
      <header className="neo p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_minmax(0,380px)]">
          <div>
            <div className="kicker">Служба переводов с трейдерского на человеческий</div>
            <h1 className="headline mt-2 text-4xl md:text-6xl">Глоссарий. <span className="marker">Без лишнего жаргона</span></h1>
            <p className="mt-4 text-base font-semibold">Термин объясняется простыми словами, затем — рабочим значением. Ликвидность — это когда деньги исчезают достаточно быстро, чтобы никто не успел задать вопросы. Ниже — версия для тех, кто всё же хочет.</p>
          </div>
          <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 36 }}>
            <Illustration seed="glossary" type="Таблица" prompt="plain language cryptocurrency trading glossary" code="ГЛОССАРИЙ" accent="#5b7cfa" />
          </div>
        </div>
      </header>
      <GlossaryList items={glossary} />
    </div>
  );
}
