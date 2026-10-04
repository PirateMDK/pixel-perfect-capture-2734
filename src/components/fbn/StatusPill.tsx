import { cn } from "@/lib/utils";
import type { StatutDef, Tonalite } from "@/config/referentiels";

const tons: Record<Tonalite, string> = {
  succes: "bg-success/15 text-success border-success/40",
  attente: "bg-warning/15 text-warning border-warning/40",
  danger: "bg-destructive/15 text-destructive border-destructive/40",
  info: "bg-primary/10 text-primary border-primary/30",
  neutre: "bg-muted text-muted-foreground border-border",
};

/** Badge de statut générique, piloté par les référentiels centralisés. */
export function StatusPill({ statut, defs, className }: { statut: string; defs: StatutDef; className?: string }) {
  const d = defs[statut] ?? { label: statut, ton: "neutre" as Tonalite };
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap", tons[d.ton], className)}>
      {d.label}
    </span>
  );
}
