import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { LayoutGrid, List } from "lucide-react";
import { PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { TeamCard } from "@/components/fbn/Cards";
import { Chip } from "@/components/fbn/StatusBadge";
import { EmptyState } from "@/components/fbn/States";
import { FilterBar, Pagination, SearchFilter, SelectFilter } from "@/components/fbn/Filters";
import { CATEGORIES, COMMUNES, DEPARTEMENTS } from "@/data/mock";
import { getTeams } from "@/services/api";

type Search = { q?: string | undefined; departement?: string | undefined; commune?: string | undefined; categorie?: string | undefined };

export const Route = createFileRoute("/equipes/")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: (s["q"] as string) || undefined,
    departement: (s["departement"] as string) || undefined,
    commune: (s["commune"] as string) || undefined,
    categorie: (s["categorie"] as string) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Équipes — Foot Bénin Network" },
      { name: "description", content: "Toutes les équipes du football local béninois, par département et commune." },
      { property: "og:title", content: "Équipes — Foot Bénin Network" },
      { property: "og:description", content: "Annuaire des équipes du football local béninois." },
    ],
  }),
  loader: () => getTeams(),
  component: EquipesPage,
});

const PAR_PAGE = 6;

function EquipesPage() {
  const toutes = Route.useLoaderData();
  const init = Route.useSearch();
  const [q, setQ] = useState(init.q ?? "");
  const [departement, setDepartement] = useState(init.departement ?? "");
  const [commune, setCommune] = useState(init.commune ?? "");
  const [categorie, setCategorie] = useState(init.categorie ?? "");
  const [statut, setStatut] = useState("");
  const [vue, setVue] = useState<"cartes" | "liste">("cartes");
  const [page, setPage] = useState(1);

  const filtrees = useMemo(
    () =>
      toutes.filter(
        (t) =>
          (!q || `${t.nom} ${t.commune}`.toLowerCase().includes(q.toLowerCase())) &&
          (!departement || t.departement === departement) &&
          (!commune || t.commune === commune) &&
          (!categorie || t.categories.includes(categorie as never)) &&
          (!statut || (statut === "verifie" ? t.verifie : t.actif)),
      ),
    [toutes, q, departement, commune, categorie, statut],
  );
  const pages = Math.ceil(filtrees.length / PAR_PAGE);
  const visibles = filtrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);
  const communes = departement ? (COMMUNES[departement] ?? []) : Object.values(COMMUNES).flat();

  return (
    <PublicLayout>
      <PageHeading surtitre="Annuaire" titre="Toutes les équipes" intro="Clubs et équipes référencés sur FBN (données de démonstration)." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FilterBar>
          <SearchFilter value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Nom, commune…" />
          <SelectFilter label="Département" value={departement} onChange={(v) => { setDepartement(v); setCommune(""); setPage(1); }} options={DEPARTEMENTS} />
          <SelectFilter label="Commune" value={commune} onChange={(v) => { setCommune(v); setPage(1); }} options={communes} tous="Toutes" />
          <SelectFilter label="Catégorie" value={categorie} onChange={(v) => { setCategorie(v); setPage(1); }} options={CATEGORIES} tous="Toutes" />
          <SelectFilter label="Statut" value={statut} onChange={(v) => { setStatut(v); setPage(1); }} options={[{ value: "verifie", label: "Vérifiée" }, { value: "actif", label: "Active" }]} />
        </FilterBar>
        <div className="mt-5 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{filtrees.length} équipe(s)</p>
          <div className="flex gap-2">
            <button type="button" aria-label="Affichage en cartes" aria-pressed={vue === "cartes"} onClick={() => setVue("cartes")} className={`focus-ring grid size-10 place-items-center rounded-full ${vue === "cartes" ? "bg-primary text-primary-foreground" : "glass"}`}><LayoutGrid className="size-4" /></button>
            <button type="button" aria-label="Affichage en liste" aria-pressed={vue === "liste"} onClick={() => setVue("liste")} className={`focus-ring grid size-10 place-items-center rounded-full ${vue === "liste" ? "bg-primary text-primary-foreground" : "glass"}`}><List className="size-4" /></button>
          </div>
        </div>
        <div className="mt-4">
          {visibles.length === 0 ? (
            <EmptyState titre="Aucune équipe trouvée" />
          ) : vue === "cartes" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((t) => <TeamCard key={t.id} team={t} />)}
            </div>
          ) : (
            <div className="glass divide-y divide-border rounded-2xl">
              {visibles.map((t) => (
                <Link key={t.id} to="/equipes/$teamId" params={{ teamId: t.id }} className="focus-ring flex flex-wrap items-center gap-3 px-5 py-4 hover:bg-surface">
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/15 font-display text-xs text-primary">{t.sigle}</span>
                  <span className="min-w-40 flex-1 font-semibold">{t.nom}</span>
                  <span className="text-sm text-muted-foreground">{t.commune} · {t.departement}</span>
                  {t.verifie && <Chip className="border-primary/40 bg-primary/15 text-primary">Vérifiée</Chip>}
                </Link>
              ))}
            </div>
          )}
        </div>
        <Pagination page={page} total={pages} onChange={setPage} />
      </div>
    </PublicLayout>
  );
}
