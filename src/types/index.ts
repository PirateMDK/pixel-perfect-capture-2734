/**
 * Modèle de données FBN (V1 frontend).
 * Volontairement simple et non définitif : ces types seront alignés
 * sur les réponses de l'API REST (GET /api/v1/...) lors du branchement backend.
 */

export type Departement =
  | "Alibori"
  | "Atacora"
  | "Atlantique"
  | "Borgou"
  | "Collines"
  | "Couffo"
  | "Donga"
  | "Littoral"
  | "Mono"
  | "Ouémé"
  | "Plateau"
  | "Zou";

export type Categorie = "U15" | "U17" | "U19" | "Séniors" | "Féminin" | "Vétérans";

export type Poste = "Gardien" | "Défenseur" | "Milieu" | "Attaquant";

export type StatutTournoi = "inscriptions" | "bientot" | "en_cours" | "termine";

export type StatutMatch = "a_venir" | "en_cours" | "termine";

export type RoleUtilisateur = "equipe" | "organisateur" | "recruteur" | "joueur" | "media";

export interface Team {
  id: string;
  nom: string;
  sigle: string;
  departement: Departement;
  commune: string;
  arrondissement: string;
  categories: Categorie[];
  annee: number;
  couleurs: string;
  terrain: string;
  description: string;
  verifie: boolean;
  actif: boolean;
  joueurs: number;
}

export interface PlayerSeasonStats {
  matchs: number;
  titularisations: number;
  buts: number;
  passes: number;
  cartonsJaunes: number;
  cartonsRouges: number;
  minutes: number;
}

export interface Player {
  id: string;
  nom: string;
  numero: number;
  teamId: string;
  categorie: Categorie;
  poste: Poste;
  pied: "Droit" | "Gauche";
  departement: Departement;
  commune: string;
  statut: "Actif" | "Blessé" | "Suspendu";
  stats: PlayerSeasonStats;
  historique: { saison: string; equipe: string }[];
}

export interface Tournament {
  id: string;
  nom: string;
  organisateur: string;
  departement: Departement;
  commune: string;
  categorie: Categorie;
  debut: string;
  fin: string;
  equipes: number;
  statut: StatutTournoi;
  affiche: string;
  reglement: string;
  inscription: string;
  description: string;
}

export interface MatchEvent {
  minute: number;
  type: "but" | "jaune" | "rouge" | "remplacement";
  joueur: string;
  equipe: "domicile" | "exterieur";
}

export interface Match {
  id: string;
  tournamentId: string;
  tournoi: string;
  domicileId: string;
  exterieurId: string;
  domicile: string;
  exterieur: string;
  scoreDomicile: number | null;
  scoreExterieur: number | null;
  date: string;
  heure: string;
  lieu: string;
  statut: StatutMatch;
  journee: string;
  evenements: MatchEvent[];
  statistiques: { label: string; domicile: number; exterieur: number }[];
}

export interface Article {
  id: string;
  titre: string;
  chapeau: string;
  categorie: "Football local" | "Tournois" | "Équipes" | "Joueurs" | "Interviews" | "Résultats";
  auteur: string;
  date: string;
  image: string;
  aLaUne: boolean;
}

export interface PlatformStat {
  label: string;
  valeur: string;
}
