import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { Avatar } from "@/components/fbn/Cards";
import { EmptyState } from "@/components/fbn/States";
import { FilterBar, SelectFilter } from "@/components/fbn/Filters";
import { CATEGORIES, DEPARTEMENTS } from "@/data/mock";
import { GROUPES_POSTES } from "@/config/referentiels";
import { getPlayers, getTeams, getTournaments } from "@/services/api";

export const Route = createFileRoute("/talents")({
  head: () => ({
    meta: [
      { title: "Talents & détection — Foot Bénin Network" },
      { name: "description", content: "Outil de recherche de profils sportifs pour recruteurs, basé sur les statistiques." },
      { property: "og:title", content: "Talents — Foot Bénin Network" },
      { property: "og:description", content: "Détection de joueurs du football local béninois." },
    ],
  }),
  loader: async () => ({ joueurs: await getPlayers(), equipes: await getTeams(), tournois: await getTournaments() }),
  component: TalentsPage,
});

function TalentsPage() {
  const { joueurs, equipes, tournois } = Route.useLoaderData();
  const [categorie, setCategorie] = useState("");
  const [poste, setPoste] = useState("");
  const [departement, setDepartement] = useState("");
  const [saison, setSaison] = useState("2025");
  const [competition, setCompetition] = useState("");
  const [commune, setCommune] = useState("");
  const liste = useMemo(() => joueurs.filter((p) => (!categorie || p.categorie === categorie) && (!poste || p.poste === poste) && (!departement || p.departement === departement) && (!commune || p.commune === commune)), [joueurs, categorie, poste, departement, commune]);
  const communes = [...new Set(joueurs.map((p) => p.commune))];

  return (
    <PublicLayout>
      <PageHeading surtitre="Détection" titre="Talents" intro="Recherchez des profils à partir de leurs statistiques réelles de match. Aucune note arbitraire." />
      <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6">
        <div className="glass grid gap-3 rounded-2xl p-4 sm:grid-cols-3 lg:grid-cols-6">
          <SelectFilter label="Catégorie" value={categorie} onChange={setCategorie} options={CATEGORIES} tous="Toutes" />
          <SelectFilter label="Poste" value={poste} onChange={setPoste} options={[...GROUPES_POSTES]} />
          <SelectFilter label="Département" value={departement} onChange={setDepartement} options={DEPARTEMENTS} />
          <SelectFilter label="Commune" value={commune} onChange={setCommune} options={communes} tous="Toutes" />
          <SelectFilter label="Saison" value={saison} onChange={setSaison} options={["2025", "2024"]} tous="Toutes" />
          <SelectFilter label="Compétition" value={competition} onChange={setCompetition} options={tournois.map((t) => ({ value: t.id, label: t.nom }))} tous="Toutes" />
        </div>
        <p className="text-sm text-muted-foreground">{liste.length} profil(s)</p>
        {liste.length === 0 ? <EmptyState /> : (
          <div className="glass overflow-hidden rounded-2xl">
            <div className="hidden grid-cols-[2fr_1.5fr_1fr_1fr_repeat(3,0.6fr)_auto] gap-3 border-b border-border px-5 py-3 text-xs tracking-wider text-muted-foreground uppercase lg:grid">
              <span>Joueur</span><span>Équipe</span><span>Poste</span><span>Catégorie</span><span>Matchs</span><span>Buts</span><span>Passes</span><span className="w-28" />
            </div>
            {liste.map((p) => (
              <div key={p.id} className="grid grid-cols-2 items-center gap-3 border-b border-border px-5 py-4 last:border-0 lg:grid-cols-[2fr_1.5fr_1fr_1fr_repeat(3,0.6fr)_auto]">
                <span className="col-span-2 flex items-center gap-3 lg:col-span-1"><Avatar nom={p.nom} className="size-10" /><span className="font-semibold">{p.nom}</span></span>
                <span className="text-sm text-muted-foreground">{equipes.find((e) => e.id === p.teamId)?.nom}</span>
                <span className="text-sm">{p.poste}</span>
                <span className="text-sm">{p.categorie}</span>
                <span className="text-sm tabular-nums"><span className="lg:hidden text-muted-foreground">Matchs </span>{p.stats.matchs}</span>
                <span className="text-sm tabular-nums text-accent"><span className="lg:hidden text-muted-foreground">Buts </span>{p.stats.buts}</span>
                <span className="text-sm tabular-nums"><span className="lg:hidden text-muted-foreground">Passes </span>{p.stats.passes}</span>
                <Link to="/joueurs/$playerId" params={{ playerId: p.id }} className="focus-ring col-span-2 w-full rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold text-primary-foreground lg:col-span-1 lg:w-28">Voir le profil</Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
