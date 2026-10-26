import Link from "next/link";
import { notFound } from "next/navigation";
import { Illustration } from "@/components/Illustration";
import { ContinueCta, ModuleProgress, StatusDot } from "@/components/ProgressBits";
import { Rich } from "@/components/Rich";
import { isExam, moduleById, modules, satireOf, moduleSatire } from "@/lib/course";
import { MODULE_COLORS } from "@/lib/art/primitives";

export function generateStaticParams() {
  return modules.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = moduleById(id);
  return { title: m ? `Модуль ${m.id} · ${m.title} — Signal Arena` : "Модуль не найден" };
}

export default async function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = moduleById(id);
  if (!m) notFound();
  const color = MODULE_COLORS[m.id];
  const sat = moduleSatire(m.id);
  const prev = modules[m.index - 1];
  const next = modules[m.index + 1];
  const ids = m.lessons.map((l) => l.id);
  return (
    <div className="space-y-8">
      <nav className="text-xs font-bold text-[var(--mute)]">
        <Link href="/course">Курс</Link> / <span className="text-[var(--ink)]">Модуль {m.id}</span>
      </nav>

      <header className="neo overflow-hidden p-5 md:p-8">
        <div className="grid items-center gap-8 md:grid-cols-[minmax(0,420px)_1fr]">
          <div className="neo-s overflow-hidden p-2" style={{ borderRadius: 40 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/covers/${m.id}.jpg`} alt={`Обложка модуля ${m.id}: ${m.title}`} width={500} height={500} className="aspect-square w-full rounded-[32px] object-cover" />
          </div>
          <div>
            <div className="kicker" style={{ color }}>{sat.kicker} · уровни {m.from}–{m.to}</div>
            <h1 className="headline mt-2 text-3xl md:text-5xl">
              <span style={{ color }}>{m.id} ·</span> {m.title}
            </h1>
            <h2 className="headline mt-4 text-lg md:text-xl"><span className="marker">{sat.headline}</span></h2>
            <p className="mt-2 text-base font-semibold">{sat.deck}</p>
            <div className="neo-in mt-5 p-4">
              <div className="kicker mb-1">Цель главы</div>
              <Rich text={m.goal} className="text-sm leading-relaxed" />
              {m.anchor && (
                <>
                  <div className="kicker mb-1 mt-3">Опора для практики</div>
                  <Rich text={m.anchor} className="text-sm leading-relaxed" />
                </>
              )}
            </div>
            <div className="mt-5 max-w-sm"><ModuleProgress ids={ids} color={color} /></div>
            <div className="mt-5"><ContinueCta ids={ids} /></div>
          </div>
        </div>
      </header>

      <section>
        <h2 className="headline mb-4 text-2xl">Десять уровней. Каждый — пять карточек</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {m.lessons.map((l) => {
            const [h] = satireOf(l.id);
            return (
              <Link key={l.id} href={`/lesson/${l.id}`} className="neo group block overflow-hidden p-3 transition hover:-translate-y-1" style={{ borderRadius: 36 }}>
                <div className="overflow-hidden" style={{ borderRadius: 28 }}>
                  <Illustration seed={`cover-${l.id}`} variant="cover" title={l.title} code={l.id} accent={color} />
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="kicker" style={{ color }}>{l.id}</span>
                    {isExam(l) && <span className="rounded-full bg-[var(--down)] px-2 text-[9px] font-black uppercase text-white">экзамен</span>}
                    <span className="ml-auto"><StatusDot id={l.id} /></span>
                  </div>
                  <h3 className="mt-1 text-lg font-black leading-tight">{l.title}</h3>
                  <p className="headline mt-2 text-[13px] text-[var(--mute)]">{h}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {m.glitches.length > 0 && (
        <section className="neo p-6">
          <h2 className="headline text-2xl">Приложение · Повторение и secret-glitch награды</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {(m.recall ?? []).map((r, i) => (
              <div key={i} className="neo-in p-4 text-sm"><Rich text={r.replace(/^- /, "")} /></div>
            ))}
          </div>
          <Link href="/glitches" className="neo-btn btn-primary mt-5 inline-block px-6 py-3 text-sm">Открыть 6 glitch-карточек →</Link>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {prev ? (
          <Link href={`/module/${prev.id}`} className="neo-s p-4"><div className="kicker">← Предыдущий модуль</div><div className="mt-1 font-black">{prev.id} · {prev.title}</div></Link>
        ) : <span />}
        {next && (
          <Link href={`/module/${next.id}`} className="neo-s p-4 text-right"><div className="kicker">Следующий модуль →</div><div className="mt-1 font-black">{next.id} · {next.title}</div></Link>
        )}
      </div>
    </div>
  );
}
