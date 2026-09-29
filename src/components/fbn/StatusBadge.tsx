import { cn } from "@/lib/utils";
import type { StatutMatch, StatutTournoi } from "@/types";

const tournoiLabels: Record<StatutTournoi, string> = {
  inscriptions: "Inscriptions ouvertes",
  bientot: "Bientôt",
  en_cours: "En cours",
  termine: "Terminé",
};

const tournoiStyles: Record<StatutTournoi, string> = {
  inscriptions: "bg-success/15 text-success border-success/40",
  bientot: "bg-warning/15 text-warning border-warning/40",
  en_cours: "bg-success/15 text-success border-success/40",
  termine: "bg-destructive/15 text-destructive border-destructive/40",
};

const matchLabels: Record<StatutMatch, string> = {
  a_venir: "À venir",
  en_cours: "En cours",
  termine: "Terminé",
};

const matchStyles: Record<StatutMatch, string> = {
  a_venir: "bg-warning/15 text-warning border-warning/40",
  en_cours: "bg-success/15 text-success border-success/40",
  termine: "bg-muted text-muted-foreground border-border",
};

const base =
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap";

export function TournamentStatusBadge({
  statut,
  className,
}: {
  statut: StatutTournoi;
  className?: string;
}) {
  return <span className={cn(base, tournoiStyles[statut], className)}>{tournoiLabels[statut]}</span>;
}

export function MatchStatusBadge({
  statut,
  className,
}: {
  statut: StatutMatch;
  className?: string;
}) {
  return <span className={cn(base, matchStyles[statut], className)}>{matchLabels[statut]}</span>;
}

export function Chip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(base, "bg-surface text-muted-foreground border-border", className)}>
      {children}
    </span>
  );
}
