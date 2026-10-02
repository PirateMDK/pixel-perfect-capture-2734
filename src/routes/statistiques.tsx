import { useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeading, PublicLayout, Section } from "@/components/layout/PublicLayout";
import { FilterBar, SelectFilter } from "@/components/fbn/Filters";
import { CATEGORIES, DEPARTEMENTS } from "@/data/mock";
import { getPlayers, getTeams, getTournaments } from "@/services/api";
import type { Player } from "@/types";

export const Route = createFileRoute("/statistiques")({
  head: () => ({
    meta: [
      { title: "Statistiques — Foot Bénin Network" },
      { name: "description", content: "Meilleurs buteurs, passeurs et classements par poste du football local béninois." },
      { property: "og:title", content: "Statistiques — Foot Bénin Network" },
      { property: "og:description", content: "Les chiffres du football local béninois." },
    ],
  }),
  loader: async () => ({ joueurs: await getPlayers(), equipes: await getTeams(), tournois: await getTournaments() }),
  component: StatsPage,
});

function Classement({ titre, joueurs, cle, label, equipes }: { titre: string; joueurs: Player[]; cle: keyof Player["stats"]; label: string; equipes: { id: string; nom: string }[] }) {
  const top = [...joueurs].sort((a, b) => b.stats[cle] - a.stats[cle]).slice(0, 5);
  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="font-display text-lg uppercase">{titre}</h3>
      <ol className="mt-3 space-y-1">
        {top.map((p, i) => (
          <li key={p.id}>
            <Link to="/joueurs/$playerId" params={{ playerId: p.id }} className="focus-ring flex items-center gap-3 rounded-xl px-2 py-2 text-sm hover:bg-surface">
              <span className="w-5 font-display text-muted-foreground">{i + 1}</span>
              <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.nom}</span><span className="block truncate text-xs text-muted-foreground">{equipes.find((e) => e.id === p.teamId)?.nom}</span></span>
              <span className={`font-display text-lg tabular-nums ${i === 0 ? "text-accent" : ""}`}>{p.stats[cle]}</span>
              <span className="sr-only">{label}</span>
            </Link>
          </li>
        ))}
        {top.length === 0 && <li className="py-4 text-sm text-muted-foreground">Aucune donnée.</li>}
      </ol>
    </div>
  );
}

function StatsPage() {
  const { joueurs, equipes, tournois } = Route.useLoaderData();
  const [saison, setSaison] = useState("2025");
  const [departement, setDepartement] = useState("");
  const [categorie, setCategorie] = useState("");
  const [competition, setCompetition] = useState("");
  const [poste, setPoste] = useState("");
  const liste = useMemo(() => joueurs.filter((p) => (!departement || p.departement === departement) && (!categorie || p.categorie === categorie) && (!poste || p.poste === poste)), [joueurs, departement, categorie, poste]);
  const parPoste = (po: string) => liste.filter((p) => p.poste === po);
  const graph = [...liste].sort((a, b) => b.stats.buts - a.stats.buts).slice(0, 8).map((p) => ({ nom: p.nom.split(" ")[0], buts: p.stats.buts, passes: p.stats.passes }));
  const annuel = [{ mois: "Jan", buts: 180 }, { mois: "Fév", buts: 210 }, { mois: "Mar", buts: 265 }, { mois: "Avr", buts: 240 }, { mois: "Mai", buts: 310 }, { mois: "Juin", buts: 355 }];
  const joueurDuMois = [...liste].sort((a, b) => b.stats.buts + b.stats.passes - (a.stats.buts + a.stats.passes))[0];

  return (
    <PublicLayout>
      <PageHeading surtitre="Données" titre="Statistiques" intro="Classements calculés à partir des feuilles de match (données fictives de démonstration)." />
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <FilterBar>
          <SelectFilter label="Saison" value={saison} onChange={setSaison} options={["2025", "2024"]} tous="Toutes" />
          <SelectFilter label="Département" value={departement} onChange={setDepartement} options={DEPARTEMENTS} />
          <SelectFilter label="Catégorie" value={categorie} onChange={setCategorie} options={CATEGORIES} tous="Toutes" />
          <SelectFilter label="Compétition" value={competition} onChange={setCompetition} options={tournois.map((t) => ({ value: t.id, label: t.nom }))} tous="Toutes" />
          <SelectFilter label="Poste" value={poste} onChange={setPoste} options={["Gardien", "Défenseur", "Milieu", "Attaquant"]} />
        </FilterBar>
      </div>
      <Section titre="Meilleurs buteurs & passeurs">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1.4fr]">
          <Classement titre="Meilleurs buteurs" joueurs={liste} cle="buts" label="buts" equipes={equipes} />
          <Classement titre="Passes décisives" joueurs={liste} cle="passes" label="passes" equipes={equipes} />
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-lg uppercase">Buts et passes — top 8</h3>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={graph}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="nom" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar isAnimationActive={false} dataKey="buts" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                  <Bar isAnimationActive={false} dataKey="passes" fill="var(--accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Section>
      <Section titre="Par poste">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Classement titre="Gardiens (minutes)" joueurs={parPoste("Gardien")} cle="minutes" label="minutes" equipes={equipes} />
          <Classement titre="Défenseurs (matchs)" joueurs={parPoste("Défenseur")} cle="matchs" label="matchs" equipes={equipes} />
          <Classement titre="Milieux (passes)" joueurs={parPoste("Milieu")} cle="passes" label="passes" equipes={equipes} />
          <Classement titre="Attaquants (buts)" joueurs={parPoste("Attaquant")} cle="buts" label="buts" equipes={equipes} />
        </div>
      </Section>
      <Section titre="Statistiques annuelles">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-lg uppercase">Joueur du mois</h3>
            {joueurDuMois && (
              <Link to="/joueurs/$playerId" params={{ playerId: joueurDuMois.id }} className="focus-ring mt-4 block rounded-xl">
                <p className="font-display text-3xl uppercase">{joueurDuMois.nom}</p>
                <p className="mt-2 text-sm text-muted-foreground"><span className="font-display text-accent">{joueurDuMois.stats.buts}</span> buts · <span className="font-display text-accent">{joueurDuMois.stats.passes}</span> passes décisives</p>
              </Link>
            )}
          </div>
          <div className="glass rounded-2xl p-5">
            <h3 className="font-display text-lg uppercase">Buts enregistrés par mois — {saison}</h3>
            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={annuel}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="mois" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12 }} />
                  <Bar isAnimationActive={false} dataKey="buts" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Section>
    </PublicLayout>
  );
}
