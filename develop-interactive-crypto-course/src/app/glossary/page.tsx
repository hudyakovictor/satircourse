import { glossary } from "@/lib/course";
import { GlossaryTable } from "@/components/GlossaryTable";

export const metadata = { title: "Глоссарий трейдера — SIGNAL ARENA" };

export default function GlossaryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="stamp text-cyanx">Приложение · служба терминов</div>
      <h1 className="mt-3 font-display text-5xl uppercase text-paper md:text-6xl">Глоссарий без лишнего жаргона</h1>
      <p className="mt-3 max-w-3xl text-lg text-zinc-300">
        Термин сначала объясняется простыми словами, затем — в рабочем значении. Ликвидность — это когда деньги исчезают достаточно быстро, чтобы никто не успел задать вопросы. Остальное — ниже.
      </p>
      <GlossaryTable items={glossary} />
    </div>
  );
}
