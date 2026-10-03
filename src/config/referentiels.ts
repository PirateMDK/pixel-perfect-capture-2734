/**
 * Référentiels FBN centralisés (catégories, postes, statuts).
 * Source unique pour toute l'interface : à remplacer plus tard par
 * GET /api/v1/referentiels sans toucher aux composants.
 */

export const CATEGORIES_OFFICIELLES = [
  "U6/U7",
  "U8/U9",
  "U10/U11",
  "U12/U13",
  "U14/U15",
  "U16/U17",
  "U18/U19",
  "U20",
  "Seniors",
  "Vétérans",
] as const;

export type CategorieNom = (typeof CATEGORIES_OFFICIELLES)[number];

export interface CategorieRef {
  id: string;
  nom: string;
  actif: boolean;
  ordre: number;
}

export const CATEGORIES_REF: CategorieRef[] = CATEGORIES_OFFICIELLES.map((nom, i) => ({
  id: `cat-${i + 1}`,
  nom,
  actif: true,
  ordre: i + 1,
}));

/** Catégories actives, triées : à utiliser dans tous les filtres et formulaires. */
export const CATEGORIES: string[] = CATEGORIES_REF.filter((c) => c.actif)
  .sort((a, b) => a.ordre - b.ordre)
  .map((c) => c.nom);

/** Mineurs : toutes les catégories jeunes jusqu'à U18/U19 incluse. */
export const estCategorieMineure = (c: string) => /^U(\d+)/.test(c) && !c.startsWith("U20");

export const GROUPES_POSTES = ["Gardien", "Défenseur", "Milieu", "Attaquant"] as const;
export type GroupePoste = (typeof GROUPES_POSTES)[number];

export interface PosteRef {
  code: string;
  libelle: string;
  groupe: GroupePoste;
  actif: boolean;
  ordre: number;
}

const p = (code: string, libelle: string, groupe: GroupePoste, ordre: number): PosteRef => ({
  code,
  libelle,
  groupe,
  actif: true,
  ordre,
});

export const POSTES_REF: PosteRef[] = [
  p("GB", "Gardien de but", "Gardien", 1),
  p("DC", "Défenseur central", "Défenseur", 2),
  p("ALG", "Arrière latéral gauche", "Défenseur", 3),
  p("ALD", "Arrière latéral droit", "Défenseur", 4),
  p("PG", "Piston gauche", "Défenseur", 5),
  p("PD", "Piston droit", "Défenseur", 6),
  p("MDC", "Milieu défensif central", "Milieu", 7),
  p("MC", "Milieu central", "Milieu", 8),
  p("MOC", "Milieu offensif central", "Milieu", 9),
  p("MLG", "Milieu latéral gauche", "Milieu", 10),
  p("MLD", "Milieu latéral droit", "Milieu", 11),
  p("AG", "Ailier gauche", "Attaquant", 12),
  p("AD", "Ailier droit", "Attaquant", 13),
  p("AC", "Avant-centre", "Attaquant", 14),
  p("AT", "Attaquant de soutien", "Attaquant", 15),
];

export type PosteCode = string;

export const postesDuGroupe = (g: string) =>
  POSTES_REF.filter((x) => x.groupe === g && x.actif).sort((a, b) => a.ordre - b.ordre);

export const libellePoste = (code?: string) =>
  POSTES_REF.find((x) => x.code === code)?.libelle ?? code ?? "";

/* ---------- Statuts (libellé + tonalité visuelle) ---------- */

export type Tonalite = "succes" | "attente" | "danger" | "neutre" | "info";

export type StatutDef = Record<string, { label: string; ton: Tonalite }>;

export const STATUTS_RESULTAT: StatutDef = {
  brouillon: { label: "Brouillon", ton: "neutre" },
  saisi: { label: "Saisi", ton: "info" },
  soumis: { label: "Soumis", ton: "attente" },
  valide: { label: "Validé", ton: "succes" },
  conteste: { label: "Contesté", ton: "danger" },
  rejete: { label: "Rejeté", ton: "danger" },
};

export const STATUTS_JOUEUR: StatutDef = {
  Actif: { label: "Actif", ton: "succes" },
  Blessé: { label: "Blessé", ton: "attente" },
  Suspendu: { label: "Suspendu", ton: "danger" },
  Archivé: { label: "Archivé", ton: "neutre" },
  Corbeille: { label: "Corbeille", ton: "danger" },
};

export const STATUTS_ENTITE: StatutDef = {
  actif: { label: "Actif", ton: "succes" },
  desactive: { label: "Désactivé", ton: "attente" },
  archive: { label: "Archivé", ton: "neutre" },
};

export const STATUTS_CONTENU: StatutDef = {
  brouillon: { label: "Brouillon", ton: "neutre" },
  attente: { label: "En attente de vérification", ton: "attente" },
  publie: { label: "Publié", ton: "succes" },
  rejete: { label: "Rejeté", ton: "danger" },
  archive: { label: "Archivé", ton: "neutre" },
};

export const STATUTS_PUB: StatutDef = {
  brouillon: { label: "Brouillon", ton: "neutre" },
  attente: { label: "En attente", ton: "attente" },
  active: { label: "Active", ton: "succes" },
  expiree: { label: "Expirée", ton: "danger" },
  desactivee: { label: "Désactivée", ton: "neutre" },
};

export const STATUTS_CONTACT: StatutDef = {
  attente: { label: "En attente", ton: "attente" },
  acceptee: { label: "Acceptée", ton: "succes" },
  refusee: { label: "Refusée", ton: "danger" },
  fermee: { label: "Fermée", ton: "neutre" },
};

export const STATUTS_SIGNALEMENT: StatutDef = {
  nouveau: { label: "Nouveau", ton: "danger" },
  en_cours: { label: "En cours", ton: "attente" },
  traite: { label: "Traité", ton: "succes" },
  rejete: { label: "Rejeté", ton: "neutre" },
};

export const MOTIFS_SIGNALEMENT = [
  "Informations incorrectes",
  "Contenu inapproprié",
  "Faux profil",
  "Usurpation",
  "Spam",
  "Autre",
];

export const ROLES_ADMIN = [
  "Super Admin",
  "Admin",
  "Moderator",
  "Competition Manager",
  "Media Manager",
  "Support",
];

export const TYPES_EVENEMENT = [
  { id: "but", label: "But" },
  { id: "csc", label: "But contre son camp" },
  { id: "penalty", label: "Penalty" },
  { id: "passe", label: "Passe décisive" },
  { id: "jaune", label: "Carton jaune" },
  { id: "rouge", label: "Carton rouge" },
  { id: "entree", label: "Entrée" },
  { id: "sortie", label: "Sortie" },
] as const;

export const EMPLACEMENTS_PUB = ["Accueil — bandeau", "Accueil — encart", "Page tournoi", "Page match", "Actualités"];
