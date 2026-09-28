import type { ReactNode } from "react";
import { AmbientBackground } from "@/components/fbn/AmbientBackground";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <div className="relative z-10">
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}

/** En-tête de page interne (titre + intro), utilisé par toutes les pages listes. */
export function PageHeading({
  surtitre,
  titre,
  intro,
  children,
}: {
  surtitre?: string;
  titre: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6">
      {surtitre && (
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">{surtitre}</p>
      )}
      <h1 className="mt-2 display-title text-3xl sm:text-4xl">{titre}</h1>
      {intro && <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">{intro}</p>}
      {children}
    </div>
  );
}

export function Section({
  titre,
  action,
  children,
}: {
  titre: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <h2 className="display-title text-2xl sm:text-3xl">{titre}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
