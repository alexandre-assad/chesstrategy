"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  const navLinks = [
    { name: "Accueil", href: "/", active: pathname === "/" },
    { name: "Analyse", href: "/analysis", active: pathname === "/analysis" },
  ];

  const comingSoonLinks = [
    { name: "Ouverture" },
    { name: "Apprendre" },
  ];

  return (
    <header className="w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo & Navigation principale */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-cyan-400 hover:text-cyan-300 transition-colors tracking-tight">
            chesscoach
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`transition-colors ${
                  link.active ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Liens inactifs "À venir" */}
            {comingSoonLinks.map((link) => (
              <div key={link.name} className="flex items-center gap-1.5 cursor-not-allowed group">
                <span className="text-slate-600 group-hover:text-slate-500 transition-colors">
                  {link.name}
                </span>
                <span className="text-[9px] uppercase tracking-wider bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                  À venir
                </span>
              </div>
            ))}
          </nav>
        </div>

        {/* Espace Compte */}
        <div className="flex items-center gap-4">
          <Link
            href="/account"
            className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
              👤
            </div>
            <span className="hidden sm:inline">Mon compte</span>
          </Link>
        </div>

      </div>
    </header>
  );
}