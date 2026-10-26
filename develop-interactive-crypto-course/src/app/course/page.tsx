import { modules, MODSAT, lessonsOf } from "@/lib/course";
import { LessonTile } from "@/components/Tiles";
import { ModuleProgress } from "@/components/Bits";
import Link from "next/link";

export const metadata = { title: "Карта курса — SIGNAL ARENA" };

export default function CoursePage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b-2 border-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/map.jpg" alt="Карта города" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-black/60 to-black/40" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="stamp text-toxic">Карта местности · масштаб 1:1R</div>
          <h1 className="mt-3 font-display text-5xl uppercase text-paper drop-shadow-[3px_3px_0_#000] md:text-7xl">Карта курса</h1>
          <p className="mt-3 max-w-2xl text-lg text-zinc-200">Десять модулей, сто уровней. Каждый район города учит одному, а рынок — остальному. Не заблудись: заблудившихся здесь называют «ликвидность».</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {modules.map((m) => (
              <a key={m.letter} href={`#m-${m.letter}`} className="border-2 border-black px-3 py-1 font-display text-lg uppercase text-black shadow-[3px_3px_0_#000]" style={{ background: MODSAT[m.letter].color }}>
                {m.letter}
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {modules.map((m) => {
          const ms = MODSAT[m.letter];
          const ls = lessonsOf(m.letter);
          return (
            <section key={m.letter} id={`m-${m.letter}`} className="scroll-mt-24 pt-14">
              <div className="grid items-center gap-6 md:grid-cols-[220px_1fr]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/art/module/${m.letter}.svg`} alt={m.title} width={500} height={500} loading="lazy" className="w-full max-w-[220px] border-2 border-black shadow-[6px_6px_0_#000]" />
                <div>
                  <div className="font-mono text-xs uppercase text-zinc-400">
                    Модуль {m.letter} · уровни {m.range} · {ms.dept}
                  </div>
                  <h2 className="font-display text-4xl uppercase text-paper">
                    <Link href={`/module/${m.letter}`} className="hover:text-toxic">
                      {m.title}
                    </Link>
                  </h2>
                  <p className="mt-1 max-w-3xl text-zinc-300">{m.goal}</p>
                  <p className="mt-1 font-mono text-xs text-amber-300">» {ms.tag}</p>
                  <div className="max-w-sm">
                    <ModuleProgress ids={ls.map((l) => l.id)} />
                  </div>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {ls.map((l) => (
                  <LessonTile key={l.id} id={l.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
