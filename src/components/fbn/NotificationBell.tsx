import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { actions, useMockStore } from "@/lib/mock-store";
import type { EspaceId } from "@/types";
import { cn } from "@/lib/utils";

export function NotificationBell({ espace }: { espace: EspaceId }) {
  const toutes = useMockStore((s) => s.notifications);
  const liste = toutes.filter((n) => n.espace === espace);
  const nonLues = liste.filter((n) => !n.lue).length;
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Notifications${nonLues ? ` (${nonLues} non lues)` : ""}`}
        className="focus-ring relative grid size-10 place-items-center rounded-full bg-surface hover:bg-surface-strong"
      >
        <Bell className="size-4" aria-hidden />
        {nonLues > 0 && (
          <span className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
            {nonLues}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,calc(100vw-2rem))] p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="font-semibold">Notifications</p>
          {nonLues > 0 && (
            <button type="button" onClick={() => actions.toutMarquerLu(espace)} className="focus-ring rounded text-xs text-primary">
              Tout marquer comme lu
            </button>
          )}
        </div>
        <NotificationList espace={espace} compact />
      </PopoverContent>
    </Popover>
  );
}

export function NotificationList({ espace, compact }: { espace: EspaceId; compact?: boolean }) {
  const liste = useMockStore((s) => s.notifications).filter((n) => n.espace === espace);
  if (!liste.length)
    return <p className="px-4 py-10 text-center text-sm text-muted-foreground">Aucune notification.</p>;
  return (
    <ul className={cn("divide-y divide-border", compact && "max-h-[60vh] overflow-y-auto")}>
      {liste.map((n) => (
        <li key={n.id} className={cn("flex gap-3 px-4 py-3", !n.lue && "bg-primary/5")}>
          <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.lue ? "bg-transparent" : "bg-accent")} />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-semibold">{n.titre}{!n.lue && <span className="sr-only"> (non lue)</span>}</p>
            <p className="text-muted-foreground">{n.description}</p>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>{n.date}</span>
              {n.lien && <a href={n.lien} onClick={() => actions.marquerLue(n.id)} className="focus-ring rounded text-primary">Voir</a>}
              <button type="button" onClick={() => actions.marquerLue(n.id, !n.lue)} className="focus-ring rounded hover:text-foreground">
                {n.lue ? "Marquer non lue" : "Marquer lue"}
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
