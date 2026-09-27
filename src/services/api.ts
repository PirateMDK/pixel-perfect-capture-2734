/**
 * Couche d'accès aux données FBN.
 *
 * Chaque fonction est asynchrone et renvoie exactement ce que renverra l'API
 * REST à venir. Pour brancher le backend, il suffira de remplacer le corps de
 * ces fonctions par un fetch (ex. GET /api/v1/teams) : aucun composant ne lit
 * les données mockées directement.
 */
import {
  articles,
  matches,
  platformStats,
  players,
  teams,
  tournaments,
} from "@/data/mock";
import type { Article, Match, Player, PlatformStat, Team, Tournament } from "@/types";

const delay = <T,>(value: T): Promise<T> => Promise.resolve(value);

export interface TeamFilters {
  q?: string;
  departement?: string;
  commune?: string;
  categorie?: string;
  statut?: string;
}

export const getTeams = (filters: TeamFilters = {}): Promise<Team[]> => {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return delay(
    teams.filter((t) => {
      if (q && !`${t.nom} ${t.commune} ${t.departement}`.toLowerCase().includes(q)) return false;
      if (filters.departement && t.departement !== filters.departement) return false;
      if (filters.commune && t.commune !== filters.commune) return false;
      if (filters.categorie && !t.categories.includes(filters.categorie as Team["categories"][0]))
        return false;
      if (filters.statut === "verifie" && !t.verifie) return false;
      if (filters.statut === "actif" && !t.actif) return false;
      return true;
    }),
  );
};

export const getTeam = (id: string): Promise<Team | undefined> =>
  delay(teams.find((t) => t.id === id));

export interface PlayerFilters {
  q?: string;
  departement?: string;
  commune?: string;
  categorie?: string;
  poste?: string;
  teamId?: string;
}

export const getPlayers = (filters: PlayerFilters = {}): Promise<Player[]> => {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return delay(
    players.filter((p) => {
      if (q && !p.nom.toLowerCase().includes(q)) return false;
      if (filters.departement && p.departement !== filters.departement) return false;
      if (filters.commune && p.commune !== filters.commune) return false;
      if (filters.categorie && p.categorie !== filters.categorie) return false;
      if (filters.poste && p.poste !== filters.poste) return false;
      if (filters.teamId && p.teamId !== filters.teamId) return false;
      return true;
    }),
  );
};

export const getPlayer = (id: string): Promise<Player | undefined> =>
  delay(players.find((p) => p.id === id));

export interface TournamentFilters {
  q?: string;
  departement?: string;
  categorie?: string;
  statut?: string;
}

export const getTournaments = (filters: TournamentFilters = {}): Promise<Tournament[]> => {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return delay(
    tournaments.filter((t) => {
      if (q && !`${t.nom} ${t.commune}`.toLowerCase().includes(q)) return false;
      if (filters.departement && t.departement !== filters.departement) return false;
      if (filters.categorie && t.categorie !== filters.categorie) return false;
      if (filters.statut && t.statut !== filters.statut) return false;
      return true;
    }),
  );
};

export const getTournament = (id: string): Promise<Tournament | undefined> =>
  delay(tournaments.find((t) => t.id === id));

export interface MatchFilters {
  statut?: string;
  tournamentId?: string;
  teamId?: string;
}

export const getMatches = (filters: MatchFilters = {}): Promise<Match[]> =>
  delay(
    matches.filter((m) => {
      if (filters.statut && m.statut !== filters.statut) return false;
      if (filters.tournamentId && m.tournamentId !== filters.tournamentId) return false;
      if (filters.teamId && m.domicileId !== filters.teamId && m.exterieurId !== filters.teamId)
        return false;
      return true;
    }),
  );

export const getMatch = (id: string): Promise<Match | undefined> =>
  delay(matches.find((m) => m.id === id));

export const getArticles = (categorie?: string): Promise<Article[]> =>
  delay(categorie ? articles.filter((a) => a.categorie === categorie) : articles);

export const getPlatformStats = (): Promise<PlatformStat[]> => delay(platformStats);

export interface SearchResults {
  teams: Team[];
  players: Player[];
  tournaments: Tournament[];
  articles: Article[];
}

export const search = async (q: string): Promise<SearchResults> => {
  const term = q.trim().toLowerCase();
  if (!term) return { teams: [], players: [], tournaments: [], articles: [] };
  return {
    teams: teams.filter((t) =>
      `${t.nom} ${t.commune} ${t.departement}`.toLowerCase().includes(term),
    ),
    players: players.filter((p) => `${p.nom} ${p.commune}`.toLowerCase().includes(term)),
    tournaments: tournaments.filter((t) =>
      `${t.nom} ${t.commune} ${t.departement}`.toLowerCase().includes(term),
    ),
    articles: articles.filter((a) => `${a.titre} ${a.chapeau}`.toLowerCase().includes(term)),
  };
};

/** Classements dérivés des statistiques joueurs (jamais de note arbitraire). */
export const getLeaderboards = async () => {
  const byGoals = [...players].sort((a, b) => b.stats.buts - a.stats.buts);
  const byAssists = [...players].sort((a, b) => b.stats.passes - a.stats.passes);
  const byMinutes = [...players].sort((a, b) => b.stats.minutes - a.stats.minutes);
  return { byGoals, byAssists, byMinutes };
};
