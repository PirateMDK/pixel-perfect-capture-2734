import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { MatchStatusBadge } from "@/components/fbn/StatusBadge";
import { EmptyState } from "@/components/fbn/States";
import { getMatch, getPlayers } from "@/services/api";
import type { MatchEvent } from "@/types";

export const Route = createFileRoute("/matchs/$matchId")({
  loader: async ({ params }) => {
    const m = await getMatch(params.matchId);
    if (!m) throw notFound();
    return { m, dom: await getPlayers({ teamId: m.domicileId }), ext: await getPlayers({ teamId: m.exterieurId }) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Match introuvable — FBN" }, { name: "robots", content: "noindex" }] };
    const m = loaderData.m;
    const titre = `${m.domicile} – ${m.exterieur}`;
    return {
      meta: [
        { title: `${titre} — Foot Bénin Network` },
        { name: "description", content: `${titre}, ${m.tournoi}, ${m.date} à ${m.lieu}.` },
        { property: "og:title", content: titre },
        { property: "og:description", content: `${m.tournoi} · ${m.journee}` },
      ],
    };
  },
  notFoundComponent: () => <PublicLayout><div className="mx-auto max-w-3xl px-4 py-20"><EmptyState titre="Match introuvable" /></div></PublicLayout>,
  component: MatchPage,
});

function Evenements({ titre, items, m }: { titre: string; items: MatchEvent[]; m: { domicile: string; exterieur: string } }) {
  return (
    <div className="glass rounded-2xl p-5">
      <h2 className="font-display text-lg uppercase">{titre}</h2>
      {items.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Aucun.</p> : (
        <ul className="mt-3 space-y-2 text-sm">
          {items.map((e, i) => (
            <li key={i} className="flex gap-3"><span className="w-10 font-display text-primary">{e.minute}'</span><span className="flex-1">{e.joueur}</span><span className="text-muted-foreground">{e.equipe === "domicile" ? m.domicile : m.exterieur}</span></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MatchPage() {
  const { m, dom, ext } = Route.useLoaderData();
  const ev = (t: MatchEvent["type"][]) => m.evenements.filter((e) => t.includes(e.type));
  return (
    <PublicLayout>
      <section className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
        <div className="glass rounded-2xl p-6 text-center">
          <p className="text-xs tracking-widest text-primary uppercase">{m.tournoi} · {m.journee}</p>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <Link to="/equipes/$teamId" params={{ teamId: m.domicileId }} className="focus-ring rounded font-display text-xl uppercase hover:text-primary sm:text-3xl">{m.domicile}</Link>
            <h1 className="font-display text-5xl tabular-nums sm:text-7xl">{m.statut === "termine" ? `${m.scoreDomicile} — ${m.scoreExterieur}` : "vs"}</h1>
            <Link to="/equipes/$teamId" params={{ teamId: m.exterieurId }} className="focus-ring rounded font-display text-xl uppercase hover:text-primary sm:text-3xl">{m.exterieur}</Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-sm text-muted-foreground">
            <MatchStatusBadge statut={m.statut} /><span>{m.date}</span><span>· {m.heure}</span><span>· {m.lieu}</span>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3">
        <Evenements titre="Buts" items={ev(["but"])} m={m} />
        <Evenements titre="Cartons" items={ev(["jaune", "rouge"])} m={m} />
        <Evenements titre="Remplacements" items={ev(["remplacement"])} m={m} />
      </section>
      <section className="mx-auto grid max-w-5xl gap-4 px-4 sm:px-6 md:grid-cols-2">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg uppercase">Compositions</h2>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            {[[m.domicile, dom], [m.exterieur, ext]].map(([nom, liste]) => (
              <div key={nom as string}><p className="mb-2 font-semibold">{nom as string}</p><ul className="space-y-1 text-muted-foreground">{(liste as typeof dom).map((p) => <li key={p.id}>#{p.numero} {p.nom}</li>)}{(liste as typeof dom).length === 0 && <li>Non communiquée</li>}</ul></div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-lg uppercase">Statistiques du match</h2>
          {m.statistiques.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">Disponibles après le match.</p> : (
            <ul className="mt-4 space-y-4">
              {m.statistiques.map((s) => {
                const pct = (s.domicile / (s.domicile + s.exterieur || 1)) * 100;
                return (
                  <li key={s.label} className="text-sm">
                    <div className="flex justify-between"><span className="font-semibold tabular-nums">{s.domicile}</span><span className="text-muted-foreground">{s.label}</span><span className="font-semibold tabular-nums">{s.exterieur}</span></div>
                    <div className="mt-1 flex h-1.5 overflow-hidden rounded-full bg-surface-strong"><div className="bg-primary" style={{ width: `${pct}%` }} /><div className="flex-1 bg-accent" /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
