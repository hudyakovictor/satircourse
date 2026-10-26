import { JournalClient } from "@/components/JournalClient";

export const metadata = { title: "Торговый журнал — SIGNAL ARENA" };

export default function JournalPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="stamp text-blood">Единственный честный свидетель</div>
      <h1 className="mt-3 font-display text-5xl uppercase text-paper md:text-6xl">Торговый журнал</h1>
      <p className="mt-3 max-w-3xl text-lg text-zinc-300">
        Capstone — 100 документированных сделок paper trading, максимум три в день. Записывай в R. Что не записано — того не было. Что записано — к сожалению, было.
      </p>
      <JournalClient />
    </div>
  );
}
