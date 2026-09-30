import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { TournamentCard } from "@/components/fbn/Cards";
import { EmptyState } from "@/components/fbn/States";
import { FilterBar, SearchFilter, SelectFilter, Tabs } from "@/components/fbn/Filters";
import { CATEGORIES, DEPARTEMENTS } from "@/data/mock";
import { getTournaments } from "@/services/api";

export const Route = createFileRoute("/tournois/")({
  head: () => ({
    meta: [
      { title: "Tournois — Foot Bénin Network" },
      { name: "description", content: "Tous les tournois du football local béninois : inscriptions, en cours, terminés." },
      { property: "og:title", content: "Tournois — Foot Bénin Network" },
      { property: "og:description", content: "Calendrier des compétitions locales au Bénin." },
    ],
  }),
  loader: () => getTournaments(),
  component: TournoisPage,
});

const RAPIDES: Record<string, string> = { Tous: "", "Inscriptions ouvertes": "inscriptions", "En cours": "en_cours", Terminés: "termine" };

function TournoisPage() {
  const tous = Route.useLoaderData();
  const [rapide, setRapide] = useState("Tous");
  const [q, setQ] = useState("");
  const [departement, setDepartement] = useState("");
  const [categorie, setCategorie] = useState("");
  const [statut, setStatut] = useState("");
  const liste = useMemo(() => {
    const st = statut || RAPIDES[rapide];
    return tous.filter((t) =>
      (!q || `${t.nom} ${t.commune}`.toLowerCase().includes(q.toLowerCase())) &&
      (!departement || t.departement === departement) &&
      (!categorie || t.categorie === categorie) &&
      (!st || t.statut === st));
  }, [tous, q, departement, categorie, statut, rapide]);

  return (
    <PublicLayout>
      <PageHeading surtitre="Compétitions" titre="Tous les tournois" />
      <div className="mx-auto max-w-7xl space-y-5 px-4 sm:px-6">
        <Tabs onglets={Object.keys(RAPIDES)} actif={rapide} onChange={(o) => { setRapide(o); setStatut(""); }} />
        <FilterBar>
          <SearchFilter value={q} onChange={setQ} placeholder="Nom, commune…" />
          <SelectFilter label="Département" value={departement} onChange={setDepartement} options={DEPARTEMENTS} />
          <SelectFilter label="Catégorie" value={categorie} onChange={setCategorie} options={CATEGORIES} tous="Toutes" />
          <SelectFilter label="Statut" value={statut} onChange={setStatut} options={[{ value: "inscriptions", label: "Inscriptions ouvertes" }, { value: "bientot", label: "Bientôt" }, { value: "en_cours", label: "En cours" }, { value: "termine", label: "Terminé" }]} />
          <SelectFilter label="Date" value="" onChange={() => {}} options={["2025", "2026"]} tous="Toutes les dates" />
        </FilterBar>
        {liste.length === 0 ? <EmptyState /> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{liste.map((t) => <TournamentCard key={t.id} tournament={t} />)}</div>
        )}
      </div>
    </PublicLayout>
  );
}
