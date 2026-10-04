import { useMemo, useState, type ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/fbn/Filters";
import { EmptyState } from "@/components/fbn/States";

export interface Colonne<T> { label: string; rendu: (r: T) => ReactNode }
export interface ActionLigne<T> { label: string; onSelect: (r: T) => void; danger?: boolean; visible?: (r: T) => boolean }

/** Pagination côté client, même contrat que la future API (?page=&limit=). */
export function usePagination<T>(items: T[], parPage = 8) {
  const [page, setPage] = useState(1);
  const total = Math.max(1, Math.ceil(items.length / parPage));
  const courante = Math.min(page, total);
  const visibles = useMemo(() => items.slice((courante - 1) * parPage, courante * parPage), [items, courante, parPage]);
  return { page: courante, total, setPage, visibles };
}

/**
 * Tableau CRUD : lignes en tableau sur desktop, en cartes sur mobile,
 * menu d'actions (dans un portail : jamais coupé), pagination, état vide.
 */
export function CrudTable<T extends { id: string }>({
  lignes, colonnes, actions = [], vide = "Aucun élément", parPage = 8, entete,
}: {
  lignes: T[]; colonnes: Colonne<T>[]; actions?: ActionLigne<T>[]; vide?: string; parPage?: number; entete?: ReactNode;
}) {
  const { page, total, setPage, visibles } = usePagination(lignes, parPage);
  const menu = (r: T) => {
    const dispo = actions.filter((a) => !a.visible || a.visible(r));
    if (!dispo.length) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Actions" className="focus-ring grid size-9 place-items-center rounded-full hover:bg-surface-strong">
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {dispo.map((a) => (
            <DropdownMenuItem key={a.label} onSelect={() => a.onSelect(r)} className={a.danger ? "text-destructive focus:text-destructive" : ""}>{a.label}</DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  return (
    <section className="glass rounded-2xl p-4 sm:p-5">
      {entete && <div className="mb-4 flex flex-wrap items-center justify-between gap-3">{entete}</div>}
      {lignes.length === 0 ? <EmptyState titre={vide} message="Les éléments apparaîtront ici." /> : (
        <>
          <table className="hidden w-full text-sm md:table">
            <thead><tr className="border-b border-border text-left text-xs tracking-wider text-muted-foreground uppercase">
              {colonnes.map((c) => <th key={c.label} scope="col" className="px-3 py-2 font-semibold">{c.label}</th>)}
              {actions.length > 0 && <th className="w-12"><span className="sr-only">Actions</span></th>}
            </tr></thead>
            <tbody>
              {visibles.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0">
                  {colonnes.map((c) => <td key={c.label} className="px-3 py-2.5">{c.rendu(r)}</td>)}
                  {actions.length > 0 && <td className="px-1 text-right">{menu(r)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
          <ul className="space-y-3 md:hidden">
            {visibles.map((r) => (
              <li key={r.id} className="rounded-xl bg-surface p-4">
                <div className="flex items-start justify-between gap-2">
                  <dl className="grid flex-1 gap-1.5 text-sm">
                    {colonnes.map((c, i) => (
                      <div key={c.label} className={i === 0 ? "font-semibold" : "flex justify-between gap-3"}>
                        {i > 0 && <dt className="text-xs text-muted-foreground">{c.label}</dt>}<dd>{c.rendu(r)}</dd>
                      </div>
                    ))}
                  </dl>
                  {menu(r)}
                </div>
              </li>
            ))}
          </ul>
          <Pagination page={page} total={total} onChange={setPage} />
        </>
      )}
    </section>
  );
}
