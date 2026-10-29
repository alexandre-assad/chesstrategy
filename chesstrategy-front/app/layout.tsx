import "./globals.css";
import Header from "@/app/layout/Header"; // Ajuste le chemin selon ton choix d'arborescence

export const metadata = {
  title: "chesscoach",
  description: "L'IA qui t'explique la stratégie, pas seulement les coups.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-slate-900 text-slate-200 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}