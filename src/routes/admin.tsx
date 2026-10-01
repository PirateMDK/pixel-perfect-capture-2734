import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { getArticles, getMatches, getPlayers, getTeams, getTournaments } from "@/services/api";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Administration — FBN" },
      { name: "description", content: "Interface d'administration de Foot Bénin Network." },
      { property: "og:title", content: "Administration — FBN" },
      { property: "og:description", content: "Modération et validation des contenus FBN." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async () => ({ equipes: await getTeams(), joueurs: await getPlayers(), tournois: await getTournaments(), matchs: await getMatches(), articles: await getArticles() }),
  component: Admin,
});

type Attente = { id: number; type: string; titre: string; auteur: string };
const ATTENTE: Attente[] = [
  { id: 1, type: "Nouvelle équipe", titre: "Aguégué Sport", auteur: "Resp. d'équipe" },
  { id: 2, type: "Joueur", titre: "Ismaël Bani (U19)", auteur: "Espoir de Djougou" },
  { id: 3, type: "Tournoi", titre: "Coupe des Collines", auteur: "Mairie de Savalou" },
  { id: 4, type: "Résultat", titre: "Cotonou FC 1 – 1 Racing Parakou", auteur: "Collectif Féminin" },
  { id: 5, type: "Article", titre: "Le football féminin de Cotonou…", auteur: "Média partenaire" },
  { id: 6, type: "Média", titre: "Galerie — finale Zou Masters", auteur: "Lion d'Abomey" },
];

function Validation() {
  const [items, setItems] = useState(ATTENTE);
  const act = (id: number, msg: string) => { setItems((l) => l.filter((i) => i.id !== id)); toast.success(msg); };
  if (!items.length) return <Panel><p className="text-sm text-muted-foreground">Aucun élément en attente.</p></Panel>;
  return (
    <Panel titre={`Éléments en attente (${items.length})`}>
      <ul className="space-y-3">
        {items.map((i) => (
          <li key={i.id} className="flex flex-col gap-3 rounded-xl bg-surface p-4 sm:flex-row sm:items-center">
            <div className="flex-1"><p className="text-xs tracking-wider text-accent uppercase">{i.type}</p><p className="font-semibold">{i.titre}</p><p className="text-xs text-muted-foreground">Soumis par {i.auteur}</p></div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => act(i.id, "Élément validé.")} className="focus-ring rounded-full bg-success px-4 py-2 text-sm font-semibold text-success-foreground">Valider</button>
              <button onClick={() => act(i.id, "Modification demandée.")} className="focus-ring rounded-full bg-warning px-4 py-2 text-sm font-semibold text-warning-foreground">Demander une modification</button>
              <button onClick={() => act(i.id, "Élément rejeté.")} className="focus-ring rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">Rejeter</button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function Admin() {
  const { equipes, joueurs, tournois, matchs, articles } = Route.useLoaderData();
  const t = (colonnes: string[], lignes: (string | number)[][]) => <Panel><SimpleTable colonnes={colonnes} lignes={lignes} /></Panel>;
  return (
    <DashboardLayout
      espace="Administration"
      utilisateur="Administrateur FBN"
      sections={[
        { id: "dash", label: "Dashboard", contenu: (<>
          <KpiGrid items={[{ label: "Utilisateurs", valeur: "1 284" }, { label: "Équipes", valeur: String(equipes.length) }, { label: "En attente de validation", valeur: String(ATTENTE.length) }, { label: "Signalements", valeur: "2" }]} />
          <Validation />
        </>) },
        { id: "users", label: "Utilisateurs", contenu: t(["Nom", "Rôle", "Statut"], [["Comité d'Agla", "Organisateur", "Actif"], ["AS Porto-Novo", "Équipe", "Actif"], ["Scout Académie", "Recruteur", "Actif"], ["Média Sport BJ", "Média", "En attente"]]) },
        { id: "equipes", label: "Équipes", contenu: t(["Équipe", "Département", "Vérifiée"], equipes.map((e) => [e.nom, e.departement, e.verifie ? "Oui" : "Non"])) },
        { id: "joueurs", label: "Joueurs", contenu: t(["Joueur", "Poste", "Catégorie", "Statut"], joueurs.map((p) => [p.nom, p.poste, p.categorie, p.statut])) },
        { id: "orga", label: "Organisateurs", contenu: t(["Organisateur", "Tournois"], [...new Set(tournois.map((x) => x.organisateur))].map((o) => [o, tournois.filter((x) => x.organisateur === o).length])) },
        { id: "recruteurs", label: "Recruteurs", contenu: t(["Recruteur", "Profils suivis"], [["Scout Académie", 4], ["Club partenaire Lomé", 2]]) },
        { id: "tournois", label: "Tournois", contenu: t(["Tournoi", "Lieu", "Statut"], tournois.map((x) => [x.nom, x.commune, x.statut])) },
        { id: "matchs", label: "Matchs", contenu: t(["Match", "Date", "Statut"], matchs.map((m) => [`${m.domicile} – ${m.exterieur}`, m.date, m.statut])) },
        { id: "resultats", label: "Résultats", contenu: t(["Match", "Score"], matchs.filter((m) => m.statut === "termine").map((m) => [`${m.domicile} – ${m.exterieur}`, `${m.scoreDomicile} – ${m.scoreExterieur}`])) },
        { id: "stats", label: "Statistiques", contenu: <KpiGrid items={[{ label: "Matchs", valeur: "1 240" }, { label: "Buts", valeur: "3 106" }, { label: "Joueurs", valeur: "3 480" }, { label: "Visites / mois", valeur: "48 k" }]} /> },
        { id: "actus", label: "Actualités", contenu: t(["Titre", "Catégorie", "Date"], articles.map((a) => [a.titre, a.categorie, a.date])) },
        { id: "medias", label: "Médias", contenu: t(["Fichier", "Type", "Taille"], [["finale-zou.jpg", "Image", "1,2 Mo"], ["resume-quart.mp4", "Vidéo", "48 Mo"]]) },
        { id: "pubs", label: "Publicités", contenu: t(["Campagne", "Emplacement", "Statut"], [["Équipementier local", "Accueil", "Active"]]) },
        { id: "sponsors", label: "Sponsors", contenu: t(["Sponsor", "Tournoi"], [["Partenaire télécom", "Coupe du Littoral 2025"]]) },
        { id: "signalements", label: "Signalements", contenu: t(["Contenu", "Motif", "Date"], [["Commentaire article a3", "Propos injurieux", "22 juin 2025"], ["Profil joueur", "Doublon", "20 juin 2025"]]) },
        { id: "validation", label: "Validation", contenu: <Validation /> },
        { id: "journal", label: "Journal d'activité", contenu: t(["Heure", "Action", "Par"], [["09:12", "Résultat validé", "Admin"], ["08:47", "Équipe créée", "AS Porto-Novo"], ["08:05", "Tournoi publié", "Comité d'Agla"]]) },
        { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Rôles, permissions et paramètres globaux — à brancher sur le backend.</p></Panel> },
      ]}
    />
  );
}
