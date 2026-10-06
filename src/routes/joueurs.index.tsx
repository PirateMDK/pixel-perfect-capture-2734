import { usePagination } from "@/components/fbn/CrudTable";
import { Pagination } from "@/components/fbn/Filters";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { PlayerCard } from "@/components/fbn/Cards";
import { EmptyState } from "@/components/fbn/States";
import { FilterBar, SearchFilter, SelectFilter } from "@/components/fbn/Filters";
import { CATEGORIES, DEPARTEMENTS } from "@/data/mock";
import { GROUPES_POSTES } from "@/config/referentiels";
import { getPlayers, getTeams } from "@/services/api";

export const Route = createFileRoute("/joueurs/")({
  head: () => ({
    meta: [
      { title: "Joueurs — Foot Bénin Network" },
      { name: "description", content: "Profils et statistiques des joueurs du football local béninois." },
      { property: "og:title", content: "Joueurs — Foot Bénin Network" },
      { property: "og:description", content: "Profils sportifs et statistiques de saison." },
    ],
  }),
  loader: async () => ({ joueurs: await getPlayers(), equipes: await getTeams() }),
  component: JoueursPage,
});

function JoueursPage() {
  const { joueurs, equipes } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [departement, setDepartement] = useState("");
  const [categorie, setCategorie] = useState("");
  const [poste, setPoste] = useState("");
  const [equipe, setEquipe] = useState("");
  const liste = useMemo(
    () => joueurs.filter((p) =>
      (!q || p.nom.toLowerCase().includes(q.toLowerCase())) &&
      (!departement || p.departement === departement) &&
      (!categorie || p.categorie === categorie) &&
      (!poste || p.poste === poste) &&
      (!equipe || p.teamId === equipe)),
    [joueurs, q, departement, categorie, poste, equipe],
  );
  const pg = usePagination(liste, 8);
  const nom = (id: string) => equipes.find((e) => e.id === id)?.nom;

  return (
    <PublicLayout>
      <PageHeading surtitre="Profils" titre="Joueurs" intro="Chaque profil est construit à partir des statistiques enregistrées." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FilterBar>
          <SearchFilter value={q} onChange={setQ} placeholder="Nom du joueur" />
          <SelectFilter label="Département" value={departement} onChange={setDepartement} options={DEPARTEMENTS} />
          <SelectFilter label="Catégorie" value={categorie} onChange={setCategorie} options={CATEGORIES} tous="Toutes" />
          <SelectFilter label="Poste" value={poste} onChange={setPoste} options={[...GROUPES_POSTES]} />
          <SelectFilter label="Équipe" value={equipe} onChange={setEquipe} options={equipes.map((e) => ({ value: e.id, label: e.nom }))} tous="Toutes" />
        </FilterBar>
        <p className="mt-5 text-sm text-muted-foreground">{liste.length} joueur(s)</p>
        <div className="mt-4">
          {liste.length === 0 ? <EmptyState titre="Aucun joueur trouvé" /> : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {pg.visibles.map((p) => <PlayerCard key={p.id} player={p} teamNom={nom(p.teamId)} />)}
            </div>
          )}
        </div>
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </div>
    </PublicLayout>
  );
}
