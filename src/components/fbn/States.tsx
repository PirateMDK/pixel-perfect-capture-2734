import { Skeleton } from "@/components/ui/skeleton";

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass rounded-2xl p-5">
          <Skeleton className="h-4 w-24 bg-surface-strong" />
          <Skeleton className="mt-3 h-6 w-40 bg-surface-strong" />
          <Skeleton className="mt-3 h-4 w-full bg-surface-strong" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  titre = "Aucun résultat",
  message = "Modifiez vos filtres ou votre recherche pour voir davantage de résultats.",
}: {
  titre?: string;
  message?: string;
}) {
  return (
    <div className="glass rounded-2xl px-6 py-14 text-center">
      <p className="font-display text-xl uppercase">{titre}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function ErrorState({ message = "Les données n'ont pas pu être chargées." }) {
  return (
    <div
      role="alert"
      className="rounded-2xl border border-destructive/40 bg-destructive/10 px-6 py-10 text-center"
    >
      <p className="font-display text-lg uppercase">Erreur de chargement</p>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
