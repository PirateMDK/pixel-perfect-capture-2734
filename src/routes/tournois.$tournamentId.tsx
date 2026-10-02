import { useState } from "react";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ArticleCard, MatchCard, StatCard, TeamCard } from "@/components/fbn/Cards";
import { TournamentStatusBadge } from "@/components/fbn/StatusBadge";
import { EmptyState } from "@/components/fbn/States";
import { Tabs } from "@/components/fbn/Filters";
import { SimpleTable } from "@/components/layout/DashboardLayout";
import { getArticles, getMatches, getPlayers, getTeams, getTournament } from "@/services/api";

export const Route = createFileRoute("/tournois/$tournamentId")({
  loader: async ({ params }) => {
    const t = await getTournament(params.tournamentId);
    if (!t) throw notFound();
    const matchs = await getMatches({ tournamentId: t.id });
    const ids = new Set(matchs.flatMap((m) => [m.domicileId, m.exterieurId]));
    const equipes = (await getTeams()).filter((e) => ids.has(e.id));
    const joueurs = (await getPlayers()).filter((p) => ids.has(p.teamId));
    return { t, matchs, equipes, joueurs, articles: (await getArticles("Tournois")).slice(0, 2) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Tournoi introuvable — FBN" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.t;
    return {
      meta: [
        { title: `${t.nom} — Foot Bénin Network` },
        { name: "description", content: t.description },
        { property: "og:title", content: `${t.nom} — FBN` },
        { property: "og:description", content: t.description },
      ],
    };
  },
  notFoundComponent: () => <PublicLayout><div className="mx-auto max-w-3xl px-4 py-20"><EmptyState titre="Tournoi introuvable" /></div></PublicLayout>,
  component: TournoiPage,
});

const ONGLETS = ["Présentation", "Équipes", "Groupes", "Calendrier", "Matchs", "Résultats", "Classement", "Buteurs", "Statistiques", "Actualités", "Galerie"];

function TournoiPage() {
  const { t, matchs, equipes, joueurs, articles } = Route.useLoaderData();
  const [onglet, setOnglet] = useState<string>(ONGLETS[0]!);
  const termines = matchs.filter((m) => m.statut === "termine");

  const classement = equipes.map((e) => {
    let pts = 0, j = 0, bp = 0, bc = 0;
    termines.forEach((m) => {
      const dom = m.domicileId === e.id, ext = m.exterieurId === e.id;
      if (!dom && !ext) return;
      j++;
      const pour = (dom ? m.scoreDomicile : m.scoreExterieur) ?? 0;
      const contre = (dom ? m.scoreExterieur : m.scoreDomicile) ?? 0;
      bp += pour; bc += contre;
      pts += pour > contre ? 3 : pour === contre ? 1 : 0;
    });
    return { nom: e.nom, j, bp, bc, pts };
  }).sort((a, b) => b.pts - a.pts || b.bp - b.bc - (a.bp - a.bc));

  const buteurs = [...joueurs].sort((a, b) => b.stats.buts - a.stats.buts).slice(0, 8);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="glass grid overflow-hidden rounded-2xl lg:grid-cols-[1.2fr_1fr]">
          <img src={t.affiche} alt={`Affiche ${t.nom}`} width={1088} height={608} className="aspect-[16/9] h-full w-full object-cover" />
          <div className="p-6">
            <TournamentStatusBadge statut={t.statut} />
            <h1 className="mt-3 display-title text-3xl sm:text-4xl">{t.nom}</h1>
            <dl className="mt-5 space-y-2 text-sm">
              {[["Organisateur", t.organisateur], ["Lieu", `${t.commune}, ${t.departement}`], ["Dates", `${t.debut} → ${t.fin}`], ["Catégorie", t.categorie], ["Équipes", t.equipes]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        </div>
        <div className="mt-6"><Tabs onglets={ONGLETS} actif={onglet} onChange={setOnglet} /></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {onglet === "Présentation" && (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="glass rounded-2xl p-6 lg:col-span-2"><h2 className="font-display text-xl uppercase">Présentation</h2><p className="mt-3 text-muted-foreground">{t.description}</p><h3 className="mt-6 font-display text-lg uppercase">Règlement</h3><p className="mt-2 text-sm text-muted-foreground">{t.reglement}</p></div>
            <div className="glass rounded-2xl p-6"><h2 className="font-display text-xl uppercase">Inscription</h2><p className="mt-3 text-sm text-muted-foreground">{t.inscription}</p></div>
          </div>
        )}
        {onglet === "Équipes" && (equipes.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{equipes.map((e) => <TeamCard key={e.id} team={e} />)}</div> : <EmptyState titre="Équipes à confirmer" />)}
        {onglet === "Groupes" && (
          <div className="grid gap-4 md:grid-cols-2">
            {["Groupe A", "Groupe B"].map((g, i) => (
              <div key={g} className="glass rounded-2xl p-5"><h2 className="font-display text-lg uppercase">{g}</h2><ul className="mt-3 space-y-2 text-sm">{equipes.filter((_, j) => j % 2 === i).map((e) => <li key={e.id}>{e.nom}</li>)}</ul></div>
            ))}
          </div>
        )}
        {(onglet === "Calendrier" || onglet === "Matchs" || onglet === "Résultats") && (
          <div className="glass rounded-2xl px-5">
            {(onglet === "Résultats" ? termines : onglet === "Calendrier" ? matchs.filter((m) => m.statut !== "termine") : matchs).map((m) => <MatchCard key={m.id} match={m} />)}
            {matchs.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucun match programmé.</p>}
          </div>
        )}
        {onglet === "Classement" && <div className="glass rounded-2xl p-4"><SimpleTable colonnes={["#", "Équipe", "J", "BP", "BC", "Diff", "Pts"]} lignes={classement.map((c, i) => [i + 1, c.nom, c.j, c.bp, c.bc, c.bp - c.bc, c.pts])} /></div>}
        {onglet === "Buteurs" && <div className="glass rounded-2xl p-4"><SimpleTable colonnes={["#", "Joueur", "Poste", "Buts", "Passes"]} lignes={buteurs.map((p, i) => [i + 1, p.nom, p.poste, p.stats.buts, p.stats.passes])} /></div>}
        {onglet === "Statistiques" && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard valeur={String(matchs.length)} label="Matchs" />
            <StatCard valeur={String(termines.length)} label="Matchs joués" />
            <StatCard valeur={String(termines.reduce((s, m) => s + (m.scoreDomicile ?? 0) + (m.scoreExterieur ?? 0), 0))} label="Buts marqués" />
            <StatCard valeur={String(t.equipes)} label="Équipes engagées" />
          </div>
        )}
        {onglet === "Actualités" && <div className="grid gap-4 md:grid-cols-2">{articles.map((a) => <ArticleCard key={a.id} article={a} />)}</div>}
        {onglet === "Galerie" && <div className="grid gap-4 sm:grid-cols-3">{[t.affiche, t.affiche, t.affiche].map((s, i) => <img key={i} src={s} alt={`Photo ${i + 1} — ${t.nom}`} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />)}</div>}
      </section>
    </PublicLayout>
  );
}
