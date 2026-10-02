import { useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { MatchCard, StatCard, TournamentCard } from "@/components/fbn/Cards";
import { Chip } from "@/components/fbn/StatusBadge";
import { EmptyState } from "@/components/fbn/States";
import { Tabs } from "@/components/fbn/Filters";
import { SimpleTable } from "@/components/layout/DashboardLayout";
import { AFFICHES } from "@/data/mock";
import { getMatches, getPlayers, getTeam, getTournaments } from "@/services/api";

export const Route = createFileRoute("/equipes/$teamId")({
  loader: async ({ params }) => {
    const team = await getTeam(params.teamId);
    if (!team) throw notFound();
    const [joueurs, matchs, tournois] = await Promise.all([
      getPlayers({ teamId: team.id }),
      getMatches({ teamId: team.id }),
      getTournaments(),
    ]);
    const ids = new Set(matchs.map((m) => m.tournamentId));
    return { team, joueurs, matchs, tournois: tournois.filter((t) => ids.has(t.id)) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Équipe introuvable — FBN" }, { name: "robots", content: "noindex" }] };
    const t = loaderData.team;
    return {
      meta: [
        { title: `${t.nom} — Foot Bénin Network` },
        { name: "description", content: `${t.nom}, club de ${t.commune} (${t.departement}) : effectif, matchs, statistiques.` },
        { property: "og:title", content: `${t.nom} — FBN` },
        { property: "og:description", content: t.description },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout><div className="mx-auto max-w-3xl px-4 py-20"><EmptyState titre="Équipe introuvable" message="Cette équipe n'existe pas ou a été retirée." /></div></PublicLayout>
  ),
  component: EquipePage,
});

const ONGLETS = ["Présentation", "Effectif", "Matchs", "Résultats", "Tournois", "Statistiques", "Galerie"];

function EquipePage() {
  const { team, joueurs, matchs, tournois } = Route.useLoaderData();
  const [onglet, setOnglet] = useState<string>(ONGLETS[0]!);
  const resultats = matchs.filter((m) => m.statut === "termine");
  const buts = joueurs.reduce((s, p) => s + p.stats.buts, 0);

  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="glass flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center">
          <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-primary/15 font-display text-2xl text-primary">{team.sigle}</span>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="display-title text-3xl sm:text-4xl">{team.nom}</h1>
              {team.verifie && <Chip className="border-primary/40 bg-primary/15 text-primary">Vérifiée</Chip>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{team.commune} · {team.arrondissement} · {team.departement}</p>
            <div className="mt-3 flex flex-wrap gap-2">{team.categories.map((c) => <Chip key={c}>{c}</Chip>)}</div>
          </div>
        </div>
        <div className="mt-6"><Tabs onglets={ONGLETS} actif={onglet} onChange={setOnglet} /></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {onglet === "Présentation" && (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <div className="glass rounded-2xl p-6"><h2 className="font-display text-xl uppercase">À propos</h2><p className="mt-3 text-muted-foreground">{team.description}</p></div>
            <dl className="glass space-y-3 rounded-2xl p-6 text-sm">
              {[["Création", team.annee], ["Couleurs", team.couleurs], ["Terrain", team.terrain], ["Département", team.departement], ["Commune", team.commune]].map(([k, v]) => (
                <div key={k as string} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
              ))}
            </dl>
          </div>
        )}
        {onglet === "Effectif" && (
          joueurs.length === 0 ? <EmptyState titre="Effectif non renseigné" /> : (
            <div className="glass rounded-2xl p-4">
              <div className="hidden sm:block">
                <SimpleTable colonnes={["N°", "Joueur", "Poste", "Catégorie", "Statut"]} lignes={joueurs.map((p) => [p.numero, p.nom, p.poste, p.categorie, p.statut])} />
              </div>
              <ul className="space-y-2">
                {joueurs.map((p) => (
                  <li key={p.id}>
                    <Link to="/joueurs/$playerId" params={{ playerId: p.id }} className="focus-ring flex items-center justify-between rounded-xl bg-surface px-4 py-3 text-sm hover:bg-surface-strong">
                      <span><span className="font-display text-primary">#{p.numero}</span> <span className="ml-2 font-semibold">{p.nom}</span></span>
                      <span className="text-muted-foreground">Voir le profil →</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        )}
        {(onglet === "Matchs" || onglet === "Résultats") && (
          <div className="glass rounded-2xl px-5">
            {(onglet === "Matchs" ? matchs : resultats).map((m) => <MatchCard key={m.id} match={m} />)}
            {(onglet === "Matchs" ? matchs : resultats).length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucun match.</p>}
          </div>
        )}
        {onglet === "Tournois" && (tournois.length ? <div className="grid gap-4 md:grid-cols-3">{tournois.map((t) => <TournamentCard key={t.id} tournament={t} />)}</div> : <EmptyState titre="Aucun tournoi" />)}
        {onglet === "Statistiques" && (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard valeur={String(joueurs.length)} label="Joueurs référencés" />
            <StatCard valeur={String(matchs.length)} label="Matchs" />
            <StatCard valeur={String(buts)} label="Buts (joueurs)" />
            <StatCard valeur={String(resultats.length)} label="Résultats enregistrés" />
          </div>
        )}
        {onglet === "Galerie" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {[AFFICHES.borgou, AFFICHES.talents, AFFICHES.littoral].map((src, i) => (
              <img key={i} src={src} alt={`Photo ${i + 1} de ${team.nom}`} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
