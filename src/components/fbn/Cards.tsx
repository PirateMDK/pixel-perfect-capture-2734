import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Chip, MatchStatusBadge, TournamentStatusBadge } from "@/components/fbn/StatusBadge";
import type { Article, Match, Player, Team, Tournament } from "@/types";

export function Avatar({ nom, className }: { nom: string; className?: string }) {
  const initiales = nom
    .split(" ")
    .slice(0, 2)
    .map((m) => m[0])
    .join("");
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid size-12 shrink-0 place-items-center rounded-full bg-primary/20 text-sm font-semibold",
        className,
      )}
    >
      {initiales}
    </span>
  );
}

export function StatCard({ valeur, label }: { valeur: string; label: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="font-display text-3xl text-accent sm:text-4xl">{valeur}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      to="/equipes/$teamId"
      params={{ teamId: team.id }}
      className="glass focus-ring block rounded-2xl p-5 transition-colors hover:bg-surface-strong"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/15 font-display text-sm text-primary"
        >
          {team.sigle}
        </span>
        <div className="min-w-0">
          <h3 className="truncate font-display text-lg uppercase">{team.nom}</h3>
          <p className="text-sm text-muted-foreground">
            {team.commune} · {team.departement}
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {team.categories.map((c) => (
          <Chip key={c}>{c}</Chip>
        ))}
        {team.verifie && (
          <Chip className="border-primary/30 bg-primary/15 text-primary">Vérifiée</Chip>
        )}
      </div>
    </Link>
  );
}

export function PlayerCard({ player, teamNom }: { player: Player; teamNom?: string | undefined }) {
  return (
    <Link
      to="/joueurs/$playerId"
      params={{ playerId: player.id }}
      className="glass focus-ring block rounded-2xl p-5 transition-colors hover:bg-surface-strong"
    >
      <div className="flex items-center gap-4">
        <Avatar nom={player.nom} />
        <div className="min-w-0">
          <h3 className="truncate font-semibold">{player.nom}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {player.poste} · {teamNom ?? player.categorie}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Matchs", player.stats.matchs],
          ["Buts", player.stats.buts],
          ["Passes", player.stats.passes],
        ].map(([label, valeur], i) => (
          <div key={label as string} className="rounded-xl bg-surface px-2 py-2">
            <dd
              className={cn(
                "font-display text-lg tabular-nums",
                i === 1 && "text-primary",
              )}
            >
              {valeur}
            </dd>
            <dt className="text-[10px] tracking-wider text-muted-foreground uppercase">{label}</dt>
          </div>
        ))}
      </dl>
    </Link>
  );
}

export function TournamentCard({ tournament }: { tournament: Tournament }) {
  return (
    <article className="glass overflow-hidden rounded-2xl">
      <img
        src={tournament.affiche}
        alt={`Affiche du tournoi ${tournament.nom}`}
        loading="lazy"
        width={1088}
        height={608}
        className="aspect-[16/9] w-full object-cover"
      />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          <TournamentStatusBadge statut={tournament.statut} />
          <span className="text-xs text-muted-foreground">
            {tournament.commune} · {tournament.categorie}
          </span>
        </div>
        <h3 className="mt-3 font-display text-xl uppercase">{tournament.nom}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {tournament.equipes} équipes · {tournament.debut}
        </p>
        <Link
          to="/tournois/$tournamentId"
          params={{ tournamentId: tournament.id }}
          className="focus-ring mt-4 inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Voir le tournoi
        </Link>
      </div>
    </article>
  );
}

export function MatchCard({ match }: { match: Match }) {
  const termine = match.statut === "termine";
  return (
    <Link
      to="/matchs/$matchId"
      params={{ matchId: match.id }}
      className="focus-ring block border-b border-border py-4 last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {match.domicile} <span className="text-muted-foreground">vs</span> {match.exterieur}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {match.tournoi} · {match.date} · {match.heure}
          </p>
        </div>
        {termine ? (
          <span className="font-display text-xl text-primary tabular-nums">
            {match.scoreDomicile} — {match.scoreExterieur}
          </span>
        ) : (
          <MatchStatusBadge statut={match.statut} />
        )}
      </div>
    </Link>
  );
}

export function ArticleCard({ article, grand = false }: { article: Article; grand?: boolean }) {
  return (
    <article className={cn("glass overflow-hidden rounded-2xl", grand && "lg:col-span-2")}>
      <img
        src={article.image}
        alt={article.titre}
        loading="lazy"
        width={1280}
        height={720}
        className={cn("w-full object-cover", grand ? "aspect-[16/8]" : "aspect-[16/9]")}
      />
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Chip className="border-primary/30 bg-primary/15 text-primary">{article.categorie}</Chip>
          <span>{article.date}</span>
          <span>· {article.auteur}</span>
        </div>
        <h3
          className={cn(
            "mt-3 font-display uppercase",
            grand ? "text-2xl sm:text-3xl" : "text-lg",
          )}
        >
          {article.titre}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">{article.chapeau}</p>
      </div>
    </article>
  );
}
