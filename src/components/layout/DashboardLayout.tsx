import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/fbn/Logo";

export interface DashboardSection {
  id: string;
  label: string;
  contenu: ReactNode;
}

/**
 * Coquille des espaces connectés (équipe, organisateur, recruteur, admin).
 * L'authentification réelle sera branchée plus tard : ici la session est simulée.
 */
export function DashboardLayout({
  espace,
  utilisateur,
  sections,
}: {
  espace: string;
  utilisateur: string;
  sections: DashboardSection[];
}) {
  const [actif, setActif] = useState(sections[0]?.id);
  const courante = sections.find((s) => s.id === actif) ?? sections[0];

  return (
    <div className="relative min-h-screen bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row">
        <aside className="lg:w-64 lg:shrink-0">
          <div className="glass rounded-2xl p-4">
            <Logo compact />
            <p className="mt-4 font-display text-lg uppercase">{espace}</p>
            <p className="text-xs text-muted-foreground">{utilisateur}</p>
            <nav aria-label={`Menu ${espace}`} className="mt-4 flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActif(s.id)}
                  aria-current={s.id === courante?.id}
                  className={cn(
                    "focus-ring shrink-0 rounded-xl px-3 py-2 text-left text-sm transition-colors lg:w-full",
                    s.id === courante?.id
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </nav>
            <Link
              to="/"
              className="focus-ring mt-4 inline-flex w-full justify-center rounded-xl bg-surface px-3 py-2 text-sm hover:bg-surface-strong"
            >
              Retour au site
            </Link>
          </div>
        </aside>
        <main className="min-w-0 flex-1">
          <h1 className="display-title text-2xl sm:text-3xl">{courante?.label}</h1>
          <div className="mt-5 space-y-5">{courante?.contenu}</div>
        </main>
      </div>
    </div>
  );
}

export function Panel({
  titre,
  children,
  className,
}: {
  titre?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("glass rounded-2xl p-5", className)}>
      {titre && (
        <h2 className="mb-4 font-display text-lg tracking-wide uppercase">{titre}</h2>
      )}
      {children}
    </section>
  );
}

export function KpiGrid({ items }: { items: { label: string; valeur: string }[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="glass rounded-2xl p-4">
          <div className="font-display text-2xl text-primary tabular-nums">{i.valeur}</div>
          <div className="mt-1 text-xs text-muted-foreground">{i.label}</div>
        </div>
      ))}
    </div>
  );
}

export function SimpleTable({
  colonnes,
  lignes,
}: {
  colonnes: string[];
  lignes: (string | number)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs tracking-wider text-muted-foreground uppercase">
            {colonnes.map((c) => (
              <th key={c} scope="col" className="px-3 py-2 font-semibold">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {lignes.map((l, i) => (
            <tr key={i} className="border-b border-border/60 last:border-0">
              {l.map((cell, j) => (
                <td key={j} className="px-3 py-2.5">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
