import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { PublicLayout, Section } from "@/components/layout/PublicLayout";
import { MatchCard, PlayerCard, StatCard, TournamentCard } from "@/components/fbn/Cards";
import { CATEGORIES, COMMUNES, DEPARTEMENTS } from "@/data/mock";
import {
  getMatches,
  getPlatformStats,
  getPlayers,
  getTeams,
  getTournaments,
} from "@/services/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Foot Bénin Network — le football local béninois réuni au même endroit" },
      {
        name: "description",
        content:
          "Découvrez les équipes, les joueurs, les tournois, les matchs et les statistiques du football local au Bénin.",
      },
      { property: "og:title", content: "Foot Bénin Network" },
      {
        property: "og:description",
        content: "Équipes, joueurs, tournois, matchs et statistiques du football local béninois.",
      },
    ],
  }),
  loader: async () => ({
    tournois: (await getTournaments()).filter((t) => t.statut !== "termine").slice(0, 3),
    resultats: (await getMatches({ statut: "termine" })).slice(0, 3),
    prochains: (await getMatches({ statut: "a_venir" })).slice(0, 3),
    joueurs: (await getPlayers()).slice(0, 4),
    equipes: await getTeams(),
    stats: await getPlatformStats(),
  }),
  component: Accueil,
});

function Accueil() {
  const { tournois, resultats, prochains, joueurs, equipes, stats } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [departement, setDepartement] = useState<string>("Littoral");
  const [commune, setCommune] = useState<string>("");
  const [categorie, setCategorie] = useState<string>("");
  const navigate = useNavigate();

  const nomEquipe = (id: string) => equipes.find((e) => e.id === id)?.nom;

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-6 sm:px-6 lg:pt-16">
        <p className="rise text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Saison 2025 · données de démonstration
        </p>
        <h1 className="rise mt-4 display-title max-w-4xl text-[clamp(2.4rem,7vw,5rem)]">
          Le football local béninois, <span className="text-primary">réuni</span> au même endroit.
        </h1>
        <p className="rise mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
          Découvrez les équipes, les joueurs, les tournois, les matchs et les statistiques du
          football local au Bénin.
        </p>

        <form
          className="rise mt-8 max-w-2xl"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/recherche", search: { q } });
          }}
        >
          <label htmlFor="recherche-accueil" className="sr-only">
            Rechercher une équipe, un joueur ou un tournoi
          </label>
          <div className="flex items-center gap-2 rounded-full glass p-2">
            <input
              id="recherche-accueil"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher une équipe, un joueur ou un tournoi…"
              className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="focus-ring shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Rechercher
            </button>
          </div>
        </form>

        <div className="rise mt-5 flex flex-wrap gap-3">
          <Link
            to="/equipes"
            className="focus-ring rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Explorer le football
          </Link>
          <Link
            to="/inscription"
            className="focus-ring rounded-full glass px-5 py-3 text-sm font-semibold transition-colors hover:bg-surface-strong"
          >
            Inscrire mon équipe
          </Link>
        </div>
      </section>

      {/* Explorer par localisation */}
      <Section titre="Explorez le football près de chez vous">
        <div className="glass rounded-2xl p-5">
          <div className="flex flex-wrap gap-2">
            {DEPARTEMENTS.slice(0, 8).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => {
                  setDepartement(d);
                  setCommune("");
                }}
                className={
                  d === departement
                    ? "focus-ring rounded-full border border-primary/40 bg-primary/15 px-4 py-1.5 text-xs font-semibold text-primary"
                    : "focus-ring rounded-full border border-border bg-surface px-4 py-1.5 text-xs text-muted-foreground hover:text-foreground"
                }
              >
                {d}
              </button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="text-xs text-muted-foreground">
              Commune
              <select
                value={commune}
                onChange={(e) => setCommune(e.target.value)}
                className="mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="">Toutes les communes</option>
                {(COMMUNES[departement] ?? []).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Arrondissement
              <select className="mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm text-foreground outline-none">
                <option>Tous les arrondissements</option>
              </select>
            </label>
            <label className="text-xs text-muted-foreground">
              Catégorie
              <select
                value={categorie}
                onChange={(e) => setCategorie(e.target.value)}
                className="mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm text-foreground outline-none"
              >
                <option value="">Toutes les catégories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <Link
            to="/equipes"
            search={{ departement, commune, categorie, q: "" }}
            className="focus-ring mt-4 inline-flex rounded-full bg-surface-strong px-4 py-2 text-sm font-semibold hover:bg-primary hover:text-primary-foreground"
          >
            Voir les équipes de ce secteur
          </Link>
        </div>
      </Section>

      {/* Chiffres */}
      <section className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          {stats.map((s) => (
            <StatCard key={s.label} valeur={s.valeur} label={s.label} />
          ))}
        </div>
      </section>

      {/* Tournois */}
      <Section
        titre="Tournois à venir"
        action={
          <Link to="/tournois" className="focus-ring rounded text-sm font-semibold text-primary">
            Tous les tournois
          </Link>
        }
      >
        <div className="grid gap-4 md:grid-cols-3">
          {tournois.map((t) => (
            <TournamentCard key={t.id} tournament={t} />
          ))}
        </div>
      </Section>

      {/* Résultats & prochains matchs */}
      <section className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 lg:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="display-title mb-2 text-2xl">Derniers résultats</h2>
          {resultats.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="display-title mb-2 text-2xl">Prochains matchs</h2>
          {prochains.map((m) => (
            <MatchCard key={m.id} match={m} />
          ))}
        </div>
      </section>

      {/* Joueurs à suivre */}
      <Section
        titre="Joueurs à suivre"
        action={
          <Link to="/statistiques" className="focus-ring rounded text-sm font-semibold text-primary">
            Classements
          </Link>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {joueurs.map((p) => (
            <PlayerCard key={p.id} player={p} teamNom={nomEquipe(p.teamId)} />
          ))}
        </div>
      </Section>
    </PublicLayout>
  );
}
