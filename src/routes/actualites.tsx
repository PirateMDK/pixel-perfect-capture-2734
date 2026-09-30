import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeading, PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard } from "@/components/fbn/Cards";
import { Tabs } from "@/components/fbn/Filters";
import { EmptyState } from "@/components/fbn/States";
import { getArticles } from "@/services/api";

export const Route = createFileRoute("/actualites")({
  head: () => ({
    meta: [
      { title: "Actualités — Foot Bénin Network" },
      { name: "description", content: "Actualités, interviews et résultats du football local béninois." },
      { property: "og:title", content: "Actualités — Foot Bénin Network" },
      { property: "og:description", content: "Le média du football local béninois." },
    ],
  }),
  loader: () => getArticles(),
  component: ActualitesPage,
});

const CATS = ["Toutes", "Football local", "Tournois", "Équipes", "Joueurs", "Interviews", "Résultats"];

function ActualitesPage() {
  const articles = Route.useLoaderData();
  const [cat, setCat] = useState("Toutes");
  const liste = cat === "Toutes" ? articles : articles.filter((a) => a.categorie === cat);
  const une = liste.find((a) => a.aLaUne) ?? liste[0];
  const autres = liste.filter((a) => a !== une);
  return (
    <PublicLayout>
      <PageHeading surtitre="Média" titre="Actualités" />
      <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6">
        <Tabs onglets={CATS} actif={cat} onChange={setCat} />
        {!une ? <EmptyState titre="Aucun article" /> : (
          <div className="grid gap-4 lg:grid-cols-3">
            <ArticleCard article={une} grand />
            {autres.map((a) => <ArticleCard key={a.id} article={a} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
