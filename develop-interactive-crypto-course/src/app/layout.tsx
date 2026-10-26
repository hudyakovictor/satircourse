import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ProgressProvider } from "@/components/ProgressProvider";
import { Header, Footer } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "SIGNAL ARENA — курс по анализу и торговле криптоактивами",
  description:
    "100 уровней, 500 карточек, 777 факторов и ни одной гарантии. Панк-таблоидный интерактивный курс по трейдингу: от чтения цены до 100 сделок paper trading.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body className="antialiased">
        <ProgressProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </ProgressProvider>
      </body>
    </html>
  );
}
