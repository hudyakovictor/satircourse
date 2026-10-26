import { GlitchGrid } from "@/components/GlitchGrid";
import { Illustration } from "@/components/Illustration";
import { modules } from "@/lib/course";

export const metadata = { title: "Secret-glitch награды — Signal Arena" };

export default function GlitchesPage() {
  const glitches = modules[9].glitches;
  return (
    <div className="space-y-8">
      <header className="neo p-6 md:p-10">
        <div className="kicker">Необязательный отдел. Не даёт сигналов, баллов риска и права увеличить размер</div>
        <h1 className="headline mt-2 text-4xl md:text-6xl">Secret-glitch: <span className="marker">Скрепка снова в системе</span></h1>
        <p className="mt-4 max-w-2xl text-base font-semibold">Шесть юмористических карточек за недельные streak. Каждая — одна ошибка из курса, в которую Скрепка уже попала за тебя. Бесплатно. Как паника.</p>
      </header>
      <GlitchGrid
        items={glitches.map((g) => ({
          ...g,
          art: <Illustration seed={`glitch-${g.n}`} variant="glitch" glitch={g.n} accent="#8b6cf6" prompt={g.title} />,
        }))}
      />
    </div>
  );
}
