import { workbookMd } from "@/lib/course";
import { Md } from "@/components/Md";
import { Calculators } from "@/components/Calculators";

export const metadata = { title: "Калькуляторы и рабочая тетрадь — SIGNAL ARENA" };

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="stamp text-amber-300">Канцелярия расчётов</div>
      <h1 className="mt-3 font-display text-5xl uppercase text-paper md:text-6xl">Калькуляторы</h1>
      <p className="mt-3 max-w-3xl text-lg text-zinc-300">Считать нужно до входа, а не когда красная свеча уже в кармане. Размер позиции, R, безубыточный win rate, expectancy и цена funding — без эмоций.</p>
      <Calculators />
      <section className="mt-16">
        <h2 className="font-display text-3xl uppercase text-paper">Рабочая тетрадь по расчётам</h2>
        <div className="ink-panel mt-4 p-5">
          <Md>{workbookMd.replace(/\]\(\.\.\/appendices\/glossary\.md\)/g, "](/glossary)")}</Md>
        </div>
      </section>
    </div>
  );
}
