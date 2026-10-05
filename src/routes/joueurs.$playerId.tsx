import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ContactTeamButton, ReportButton } from "@/components/fbn/Dialogs";
import { libellePoste } from "@/config/referentiels";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Avatar, MatchCard } from "@/components/fbn/Cards";
import { Chip } from "@/components/fbn/StatusBadge";
import { EmptyState } from "@/components/fbn/States";
import { getMatches, getPlayer, getTeam } from "@/services/api";

export const Route = createFileRoute("/joueurs/$playerId")({
  loader: async ({ params }) => {
    const player = await getPlayer(params.playerId);
    if (!player) throw notFound();
    return { player, team: await getTeam(player.teamId), matchs: await getMatches({ teamId: player.teamId }) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return { meta: [{ title: "Joueur introuvable — FBN" }, { name: "robots", content: "noindex" }] };
    const p = loaderData.player;
    return {
      meta: [
        { title: `${p.nom} — Foot Bénin Network` },
        { name: "description", content: `${p.nom}, ${p.poste.toLowerCase()} : ${p.stats.matchs} matchs, ${p.stats.buts} buts, ${p.stats.passes} passes décisives.` },
        { property: "og:title", content: `${p.nom} — FBN` },
        { property: "og:description", content: `Profil sportif et statistiques de ${p.nom}.` },
      ],
    };
  },
  notFoundComponent: () => (
    <PublicLayout><div className="mx-auto max-w-3xl px-4 py-20"><EmptyState titre="Joueur introuvable" message="Ce profil n'existe pas." /></div></PublicLayout>
  ),
  component: JoueurPage,
});

function JoueurPage() {
  const { player: p, team, matchs } = Route.useLoaderData();
  const s = p.stats;
  const stats: [string, number][] = [
    ["Matchs", s.matchs], ["Titularisations", s.titularisations], ["Buts", s.buts], ["Passes décisives", s.passes],
    ["Cartons jaunes", s.cartonsJaunes], ["Cartons rouges", s.cartonsRouges], ["Minutes jouées", s.minutes],
  ];
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
        <div className="glass flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-center">
          <Avatar nom={p.nom} className="size-24 text-2xl" />
          <div className="flex-1">
            <p className="font-display text-primary">#{p.numero}</p>
            <h1 className="display-title text-3xl sm:text-4xl">{p.nom}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {team && <Link to="/equipes/$teamId" params={{ teamId: team.id }} className="focus-ring rounded text-foreground hover:text-primary">{team.nom}</Link>} · {p.commune}
            </p>
            <div className="mt-3 flex flex-wrap gap-2"><Chip>{p.poste} · {p.posteDetail} ({libellePoste(p.posteDetail)})</Chip>{p.posteSecondaire && <Chip>2nd : {p.posteSecondaire}</Chip>}<Chip>{p.categorie}</Chip><Chip>Pied {p.pied.toLowerCase()}</Chip><Chip>{p.statut}</Chip></div>
          </div>
          <div className="flex flex-wrap gap-2">{team && <ContactTeamButton playerId={p.id} joueur={p.nom} teamId={team.id} equipe={team.nom} />}<ReportButton cible={p.nom} typeCible="Joueur" /></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="display-title mb-1 text-2xl">Statistiques de la saison</h2>
        <p className="mb-4 text-xs text-muted-foreground">Calculées à partir des matchs et événements validés uniquement.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {stats.map(([l, v]) => (
            <div key={l} className="glass rounded-2xl p-4">
              <div className={`font-display text-2xl tabular-nums ${l === "Buts" ? "text-accent" : ""}`}>{v}</div>
              <div className="mt-1 text-xs text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-[1fr_2fr]">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl uppercase">Historique des équipes</h2>
          <ol className="mt-4 space-y-3">
            {p.historique.map((h) => (
              <li key={h.saison} className="flex items-center gap-3 text-sm"><span className="font-display text-primary">{h.saison}</span><span aria-hidden>→</span><span>{h.equipe}</span></li>
            ))}
          </ol>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-display text-xl uppercase">Historique des matchs</h2>
          {matchs.length ? matchs.map((m) => <MatchCard key={m.id} match={m} />) : <p className="py-6 text-sm text-muted-foreground">Aucun match enregistré.</p>}
        </div>
      </section>
    </PublicLayout>
  );
}
