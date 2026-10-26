import { Md } from "@/components/Md";
import { WORKBOOK } from "@/lib/course";

export const metadata = { title: "Рабочая тетрадь — Signal Arena" };

export default function WorkbookPage() {
  return (
    <div className="max-w-3xl">
      <div className="font-mono text-xs text-lime tracking-widest">ПРИЛОЖЕНИЕ · ТОРГОВАЯ МАТЕМАТИКА</div>
      <div className="card p-6 sm:p-8 mt-3"><Md>{WORKBOOK}</Md></div>
    </div>
  );
}
