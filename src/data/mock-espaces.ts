/**
 * Données de DÉMONSTRATION des espaces connectés (notifications, demandes de
 * contact, signalements, corbeille, publicités, contenus média, utilisateurs).
 * Fictives et non persistantes : à remplacer par l'API REST /api/v1.
 */
import type {
  AdminUser,
  Advertisement,
  AppNotification,
  ContactRequest,
  MediaContent,
  PlayerPrivate,
  Report,
  TrashItem,
} from "@/types";
import { AFFICHES } from "@/data/mock";

export const notifications: AppNotification[] = [
  { id: "n1", espace: "equipe", titre: "Résultat validé", description: "AS Porto-Novo 2 – 1 Étoile de Sègbé a été validé.", date: "22 juin 2025", lue: false, lien: "/matchs/m1" },
  { id: "n2", espace: "equipe", titre: "Demande de contact", description: "Un recruteur souhaite échanger au sujet de Kossi Mensah.", date: "21 juin 2025", lue: false },
  { id: "n3", espace: "equipe", titre: "Inscription en examen", description: "Trophée des Talents U18/U19 : dossier en cours d'examen.", date: "18 juin 2025", lue: true },
  { id: "n4", espace: "organisateur", titre: "Nouvelles inscriptions", description: "3 équipes ont demandé à rejoindre votre tournoi.", date: "22 juin 2025", lue: false },
  { id: "n5", espace: "organisateur", titre: "Résultat contesté", description: "Un résultat de la journée 12 est contesté.", date: "20 juin 2025", lue: true },
  { id: "n6", espace: "recruteur", titre: "Demande acceptée", description: "AS Porto-Novo a accepté votre demande au sujet de Kossi Mensah.", date: "22 juin 2025", lue: false, lien: "/joueurs/kossi-mensah" },
  { id: "n7", espace: "recruteur", titre: "Nouveau tournoi de détection", description: "Trophée des Talents U18/U19 : inscriptions ouvertes.", date: "19 juin 2025", lue: true, lien: "/tournois" },
  { id: "n8", espace: "media", titre: "Article publié", description: "« La Coupe du Littoral entre dans sa phase finale » est en ligne.", date: "21 juin 2025", lue: false, lien: "/actualites" },
  { id: "n9", espace: "media", titre: "Contenu rejeté", description: "La galerie « Entraînement U14/U15 » nécessite des autorisations photo.", date: "17 juin 2025", lue: true },
  { id: "n10", espace: "admin", titre: "Nouveau signalement", description: "Profil joueur signalé : doublon possible.", date: "22 juin 2025", lue: false },
  { id: "n11", espace: "admin", titre: "Résultats à valider", description: "4 résultats sont en attente de validation.", date: "22 juin 2025", lue: false },
  { id: "n12", espace: "admin", titre: "Publicité expirée", description: "La campagne « Rentrée sportive » est arrivée à échéance.", date: "15 juin 2025", lue: true },
];

export const contactRequests: ContactRequest[] = [
  { id: "c1", recruteur: "Scout · Académie partenaire", playerId: "kossi-mensah", joueur: "Kossi Mensah", teamId: "as-porto-novo", equipe: "AS Porto-Novo", message: "Nous aimerions observer Kossi lors d'un prochain match.", date: "20 juin 2025", statut: "acceptee" },
  { id: "c2", recruteur: "Scout · Académie partenaire", playerId: "moise-kpodo", joueur: "Moïse Kpodo", teamId: "as-porto-novo", equipe: "AS Porto-Novo", message: "Profil intéressant, disponible pour un essai ?", date: "21 juin 2025", statut: "attente" },
  { id: "c3", recruteur: "Club partenaire Lomé", playerId: "baba-saka", joueur: "Baba Saka", teamId: "racing-parakou", equipe: "Racing Parakou", message: "Demande d'informations sur le joueur.", date: "12 juin 2025", statut: "refusee" },
];

export const reports: Report[] = [
  { id: "r1", cible: "Commentaire article a3", typeCible: "Contenu", motif: "Contenu inapproprié", commentaire: "Propos injurieux.", date: "22 juin 2025", statut: "nouveau" },
  { id: "r2", cible: "Ismaël Bani", typeCible: "Joueur", motif: "Faux profil", commentaire: "Doublon possible.", date: "20 juin 2025", statut: "en_cours" },
  { id: "r3", cible: "Aguégué Sport", typeCible: "Équipe", motif: "Informations incorrectes", date: "14 juin 2025", statut: "traite" },
];

export const trash: TrashItem[] = [
  { id: "t1", type: "Joueur", nom: "Joueur doublon — K. Mensah", supprimeLe: "19 juin 2025", par: "Moderator", raison: "Doublon" },
  { id: "t2", type: "Article", nom: "Brouillon — Annonce stage", supprimeLe: "10 juin 2025", par: "Media Manager" },
  { id: "t3", type: "Tournoi", nom: "Coupe test 2024", supprimeLe: "2 mai 2025", par: "Admin", raison: "Tournoi de test" },
];

export const advertisements: Advertisement[] = [
  { id: "ad1", annonceur: "Équipementier local", titre: "Maillots saison 2025", visuel: AFFICHES.littoral, emplacement: "Accueil — bandeau", debut: "2025-06-01", fin: "2025-07-31", statut: "active" },
  { id: "ad2", annonceur: "Partenaire télécom", titre: "Forfait supporters", visuel: AFFICHES.borgou, emplacement: "Page match", debut: "2025-07-01", fin: "2025-08-15", statut: "attente" },
  { id: "ad3", annonceur: "Boutique sport", titre: "Rentrée sportive", emplacement: "Actualités", debut: "2025-04-01", fin: "2025-05-31", statut: "expiree" },
];

export const mediaContents: MediaContent[] = [
  { id: "mc1", type: "Article", titre: "La Coupe du Littoral entre dans sa phase finale", date: "21 juin 2025", vues: 1840, statut: "publie" },
  { id: "mc2", type: "Article", titre: "Portrait : Aline Gbédé, meneuse de Cotonou FC", date: "19 juin 2025", vues: 0, statut: "attente" },
  { id: "mc3", type: "Article", titre: "Brouillon — Bilan de la saison U16/U17", date: "18 juin 2025", vues: 0, statut: "brouillon" },
  { id: "mc4", type: "Photo", titre: "Galerie — finale Zou Masters", date: "15 juin 2025", vues: 920, statut: "publie" },
  { id: "mc5", type: "Photo", titre: "Galerie — Entraînement U14/U15", date: "17 juin 2025", vues: 0, statut: "rejete" },
  { id: "mc6", type: "Vidéo", titre: "Résumé — quart de finale Porto-Novo", date: "22 juin 2025", vues: 3120, statut: "publie" },
  { id: "mc7", type: "Vidéo", titre: "Interview — saison 2024", date: "10 déc. 2024", vues: 640, statut: "archive" },
];

export const adminUsers: AdminUser[] = [
  { id: "u1", nom: "Admin FBN", role: "Super Admin", email: "admin@fbn.bj", statut: "actif" },
  { id: "u2", nom: "Modération", role: "Moderator", email: "moderation@fbn.bj", statut: "actif" },
  { id: "u3", nom: "Comité d'Agla", role: "Organisateur", email: "agla@exemple.bj", statut: "actif" },
  { id: "u4", nom: "AS Porto-Novo — resp. 1", role: "Équipe", email: "resp1@asportonovo.bj", statut: "actif" },
  { id: "u5", nom: "AS Porto-Novo — resp. 2", role: "Équipe", email: "resp2@asportonovo.bj", statut: "actif" },
  { id: "u6", nom: "Scout Académie", role: "Recruteur", email: "scout@academie.bj", statut: "actif" },
  { id: "u7", nom: "Média Sport BJ", role: "Média", email: "redaction@mediasport.bj", statut: "desactive" },
  { id: "u8", nom: "Gestion compétitions", role: "Competition Manager", email: "competitions@fbn.bj", statut: "actif" },
  { id: "u9", nom: "Support FBN", role: "Support", email: "support@fbn.bj", statut: "actif" },
  { id: "u10", nom: "Ancien compte test", role: "Équipe", email: "test@exemple.bj", statut: "archive" },
];

/** Accès restreint (espace équipe uniquement) — jamais exposé publiquement. */
export const playersPrivate: PlayerPrivate[] = [
  { playerId: "afiavi-dossou", dateNaissance: "2007-03-14", tuteur: { nom: "Joseph Dossou", relation: "Père", contact: "+229 •• •• •• 12" }, urgence: { nom: "Mariam Dossou", contact: "+229 •• •• •• 48" }, autorisationPhoto: true },
  { playerId: "gaston-zinsou", dateNaissance: "2009-08-02", tuteur: { nom: "Hélène Zinsou", relation: "Mère", contact: "+229 •• •• •• 33" }, urgence: { nom: "Hélène Zinsou", contact: "+229 •• •• •• 33" }, autorisationPhoto: false },
  { playerId: "kossi-mensah", dateNaissance: "1999-11-21", autorisationPhoto: true },
  { playerId: "moise-kpodo", dateNaissance: "2001-05-09", autorisationPhoto: true },
];
