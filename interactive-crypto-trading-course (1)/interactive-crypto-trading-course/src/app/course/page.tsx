import Link from "next/link";
import { ContinueCta, LessonTile, ModuleProgress } from "@/components/ProgressBits";
import { IconSvg, MODULE_COLORS, iconForTitle } from "@/lib/art/primitives";
import { allLessons, isExam, modules, moduleSatire } from "@/lib/course";

export const metadata = { title: "Маршрут курса — Signal Arena" };

export default function CoursePage() {
  const ids = allLessons.map((l) => l.id);
  return (
    <div className="space-y-10">
      <header className="neo p-6 md:p-10">
        <div className="kicker">Карта местности</div>
        <h1 className="headline mt-2 text-4xl md:text-6xl">Маршрут: <span className="marker">100 уровней</span> без гарантий</h1>
        <p className="mt-4 max-w-2xl text-base font-semibold">Десять модулей от чтения цены до защиты выпускного проекта. Уровень закрывается не случайной прибылью, а корректным решением, стопом и записью в журнал.</p>
        <div className="mt-6"><ContinueCta ids={ids} /></div>
      </header>

      {modules.map((m) => {
        const color = MODULE_COLORS[m.id];
        const sat = moduleSatire(m.id);
        return (
          <section key={m.id} className="neo p-5 md:p-7" id={`m-${m.id}`}>
            <div className="grid gap-6 md:grid-cols-[200px_1fr] md:items-center">
              <Link href={`/module/${m.id}`} className="neo-s block overflow-hidden p-2" style={{ borderRadius: 32 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/covers/${m.id}.jpg`} alt={`Обложка модуля ${m.id}`} width={500} height={500} loading="lazy" className="aspect-square w-full rounded-3xl object-cover" />
              </Link>
              <div>
                <div className="kicker" style={{ color }}>Модуль {m.id} · уровни {m.from}–{m.to}</div>
                <Link href={`/module/${m.id}`}><h2 className="headline mt-1 text-2xl md:text-3xl">{m.title}</h2></Link>
                <p className="mt-2 text-sm font-bold text-[var(--mute)]">{sat.headline}</p>
                <div className="mt-3 max-w-sm"><ModuleProgress ids={m.lessons.map((l) => l.id)} color={color} /></div>
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {m.lessons.map((l) => (
                <LessonTile key={l.id} id={l.id} title={l.title} exam={isExam(l)} color={color} icon={<IconSvg name={iconForTitle(l.title)} color={color} size={30} />} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
