import { Illustration } from "@/components/Illustration";
import { Tools } from "@/components/Tools";

export const metadata = { title: "Инструменты трейдера — Signal Arena" };

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <header className="neo p-6 md:p-10">
        <div className="grid items-center gap-8 md:grid-cols-[1fr_minmax(0,360px)]">
          <div>
            <div className="kicker">Мастерская Департамента</div>
            <h1 className="headline mt-2 text-4xl md:text-6xl">Калькуляторы, которые <span className="marker">не льстят</span></h1>
            <p className="mt-4 text-base font-semibold">Размер позиции, матожидание, funding, симулятор разорения и журнал в R. Числа считаются честно. Вывод делаешь ты — и, как правило, неверный.</p>
          </div>
          <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 36 }}>
            <Illustration seed="tools" type="Инфографика" prompt="position size calculations with trading costs formula" code="TOOLS" accent="#ef6f55" />
          </div>
        </div>
      </header>
      <Tools />
    </div>
  );
}
