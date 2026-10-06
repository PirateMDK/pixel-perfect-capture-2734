import { EmptyState } from "@/components/fbn/States";
import { usePagination } from "@/components/fbn/CrudTable";
import { Pagination } from "@/components/fbn/Filters";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { MatchCard } from "@/components/fbn/Cards";
import { Tabs } from "@/components/fbn/Filters";
import { getMatches } from "@/services/api";

export const Route = createFileRoute("/matchs/")({
  head: () => ({
    meta: [
      { title: "Matchs — Foot Bénin Network" },
      { name: "description", content: "Résultats et prochains matchs du football local béninois." },
      { property: "og:title", content: "Matchs — Foot Bénin Network" },
      { property: "og:description", content: "Scores, calendrier et feuilles de match." },
    ],
  }),
  loader: () => getMatches(),
  component: MatchsPage,
});

function MatchsPage() {
  const matchs = Route.useLoaderData();
  const [onglet, setOnglet] = useState("Tous");
  const liste = matchs.filter((m) => onglet === "Tous" || (onglet === "Résultats" ? m.statut === "termine" : m.statut !== "termine"));
  const pg = usePagination(liste, 8);
  return (
    <PublicLayout>
      <PageHeading surtitre="Calendrier" titre="Matchs" />
      <div className="mx-auto max-w-4xl space-y-5 px-4 sm:px-6">
        <Tabs onglets={["Tous", "Résultats", "À venir"]} actif={onglet} onChange={setOnglet} />
        {liste.length === 0 ? <EmptyState titre="Aucun match" message="Aucun match ne correspond à cet onglet." /> : <div className="glass rounded-2xl px-5">{pg.visibles.map((m) => <MatchCard key={m.id} match={m} />)}</div>}
        <Pagination page={pg.page} total={pg.total} onChange={pg.setPage} />
      </div>
    </PublicLayout>
  );
}
