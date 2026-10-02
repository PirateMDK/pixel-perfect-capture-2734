import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, PlayerCard, TeamCard, TournamentCard } from "@/components/fbn/Cards";
import { EmptyState, LoadingState } from "@/components/fbn/States";
import { search } from "@/services/api";

export const Route = createFileRoute("/recherche")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s["q"] === "string" ? s["q"] : "" }),
  head: () => ({
    meta: [
      { title: "Recherche — Foot Bénin Network" },
      { name: "description", content: "Recherchez une équipe, un joueur, un tournoi ou une actualité." },
      { property: "og:title", content: "Recherche — Foot Bénin Network" },
      { property: "og:description", content: "Recherche globale FBN." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RecherchePage,
});

function RecherchePage() {
  const { q } = Route.useSearch();
  const [saisie, setSaisie] = useState(q);
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ["search", q], queryFn: () => search(q) });
  const total = data ? data.teams.length + data.players.length + data.tournaments.length + data.articles.length : 0;

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <h1 className="display-title text-3xl sm:text-4xl">{q ? <>Résultats pour « <span className="text-primary">{q}</span> »</> : "Recherche"}</h1>
        <form className="mt-5 max-w-2xl" onSubmit={(e) => { e.preventDefault(); navigate({ to: "/recherche", search: { q: saisie } }); }}>
          <label htmlFor="recherche-page" className="sr-only">Recherche</label>
          <div className="flex gap-2 rounded-full glass p-2">
            <input id="recherche-page" autoFocus value={saisie} onChange={(e) => setSaisie(e.target.value)} placeholder="Ex. Cotonou, Kossi, Coupe…" className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground" />
            <button type="submit" className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Rechercher</button>
          </div>
        </form>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Suggestions :</span>
          {["Cotonou", "Parakou", "Porto-Novo", "Borgou"].map((s) => <Link key={s} to="/recherche" search={{ q: s }} className="focus-ring rounded text-primary">{s}</Link>)}
        </div>
      </section>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        {isLoading ? <LoadingState /> : !q ? null : total === 0 ? <EmptyState titre="Aucun résultat" message="Essayez un autre nom d'équipe, de joueur, de commune ou de tournoi." /> : data && (
          <>
            {data.teams.length > 0 && <Groupe titre="Équipes" n={data.teams.length}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.teams.map((t) => <TeamCard key={t.id} team={t} />)}</div></Groupe>}
            {data.players.length > 0 && <Groupe titre="Joueurs" n={data.players.length}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{data.players.map((p) => <PlayerCard key={p.id} player={p} />)}</div></Groupe>}
            {data.tournaments.length > 0 && <Groupe titre="Tournois" n={data.tournaments.length}><div className="grid gap-4 md:grid-cols-3">{data.tournaments.map((t) => <TournamentCard key={t.id} tournament={t} />)}</div></Groupe>}
            {data.articles.length > 0 && <Groupe titre="Actualités" n={data.articles.length}><div className="grid gap-4 md:grid-cols-3">{data.articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div></Groupe>}
          </>
        )}
      </div>
    </PublicLayout>
  );
}

function Groupe({ titre, n, children }: { titre: string; n: number; children: React.ReactNode }) {
  return <section><h2 className="display-title mb-4 text-2xl">{titre} <span className="text-muted-foreground">({n})</span></h2>{children}</section>;
}
