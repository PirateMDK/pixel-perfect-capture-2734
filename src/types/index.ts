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

export type Categorie = import("@/config/referentiels").CategorieNom;

/** Groupe de poste ; le poste détaillé (GB, DC, MC…) est dans Player.posteDetail. */
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
  posteDetail: string;
  posteSecondaire?: string | undefined;
  surnom?: string | undefined;
  pied: "Droit" | "Gauche";
  departement: Departement;
  commune: string;
  statut: "Actif" | "Blessé" | "Suspendu" | "Archivé" | "Corbeille";
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
  type: "but" | "csc" | "penalty" | "passe" | "jaune" | "rouge" | "remplacement" | "entree" | "sortie";
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
  /** Seul un résultat "valide" alimente les statistiques. */
  statutResultat: "brouillon" | "saisi" | "soumis" | "valide" | "conteste" | "rejete";
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

export type EspaceId = "equipe" | "organisateur" | "recruteur" | "media" | "admin";

export interface AppNotification {
  id: string;
  espace: EspaceId;
  titre: string;
  description: string;
  date: string;
  lue: boolean;
  lien?: string | undefined;
}

export interface ContactRequest {
  id: string;
  recruteur: string;
  playerId: string;
  joueur: string;
  teamId: string;
  equipe: string;
  message: string;
  date: string;
  statut: "attente" | "acceptee" | "refusee" | "fermee";
}

export interface Report {
  id: string;
  cible: string;
  typeCible: string;
  motif: string;
  commentaire?: string | undefined;
  date: string;
  statut: "nouveau" | "en_cours" | "traite" | "rejete";
}

export interface TrashItem {
  id: string;
  type: string;
  nom: string;
  supprimeLe: string;
  par: string;
  raison?: string | undefined;
}

export interface Advertisement {
  id: string;
  annonceur: string;
  titre: string;
  visuel?: string | undefined;
  emplacement: string;
  debut: string;
  fin: string;
  statut: "brouillon" | "attente" | "active" | "expiree" | "desactivee";
}

export interface MediaContent {
  id: string;
  type: "Article" | "Photo" | "Vidéo";
  titre: string;
  date: string;
  vues: number;
  statut: "brouillon" | "attente" | "publie" | "rejete" | "archive";
}

export interface AdminUser {
  id: string;
  nom: string;
  role: string;
  email: string;
  statut: "actif" | "desactive" | "archive";
}

/** Données privées d'un joueur : jamais affichées sur le profil public. */
export interface PlayerPrivate {
  playerId: string;
  dateNaissance: string;
  tuteur?: { nom: string; relation: string; contact: string } | undefined;
  urgence?: { nom: string; contact: string } | undefined;
  autorisationPhoto: boolean;
}
