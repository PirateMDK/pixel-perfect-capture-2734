import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { NotificationList } from "@/components/fbn/NotificationBell";
import { StatusPill } from "@/components/fbn/StatusPill";
import { PlayerForm } from "@/components/fbn/PlayerForm";
import { Corbeille, EntityCrud, GestionCategories, GestionPostes, Publicites, Signalements, Utilisateurs } from "@/components/admin/AdminPanels";
import { STATUTS_RESULTAT } from "@/config/referentiels";
import { getArticles, getMatches, getPlayers, getTeams, getTournaments } from "@/services/api";
import { useMockStore } from "@/lib/mock-store";

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
  { id: 2, type: "Joueur", titre: "Ismaël Bani (U18/U19)", auteur: "Espoir de Djougou" },
  { id: 3, type: "Tournoi", titre: "Coupe des Collines", auteur: "Mairie de Savalou" },
  { id: 4, type: "Résultat", titre: "Cotonou FC 1 – 1 Racing Parakou", auteur: "Cotonou FC" },
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

const statutEntite = (actif: boolean) => (actif ? "actif" : "desactive");

function Admin() {
  const { equipes, joueurs, tournois, matchs, articles } = Route.useLoaderData();
  const navigate = useNavigate();
  const nbSignalements = useMockStore((s) => s.reports.filter((r) => r.statut === "nouveau").length);
  const t = (colonnes: string[], lignes: React.ReactNode[][], vide?: string) => <Panel><SimpleTable colonnes={colonnes} lignes={lignes} vide={vide} /></Panel>;
  return (
    <DashboardLayout
      espace="Administration"
      espaceId="admin"
      utilisateur="Super Admin (session simulée)"
      sections={[
        { id: "dash", label: "Dashboard", contenu: (<>
          <KpiGrid items={[{ label: "Utilisateurs", valeur: "1 284" }, { label: "Équipes", valeur: String(equipes.length) }, { label: "En attente de validation", valeur: String(ATTENTE.length) }, { label: "Nouveaux signalements", valeur: String(nbSignalements) }]} />
          <Validation />
        </>) },
        { id: "users", label: "Utilisateurs", contenu: <Utilisateurs /> },
        { id: "equipes", label: "Équipes", contenu: <EntityCrud type="Équipe" init={equipes.map((e) => ({ id: e.id, nom: e.nom, departement: e.departement, verifie: e.verifie ? "Oui" : "Non", statut: statutEntite(e.actif) }))} colonnes={[{ label: "Département", cle: "departement" }, { label: "Vérifiée", cle: "verifie" }]} onVoir={(e) => navigate({ to: "/equipes/$teamId", params: { teamId: e.id } })} /> },
        { id: "joueurs", label: "Joueurs", contenu: <EntityCrud type="Joueur" init={joueurs.map((p) => ({ id: p.id, nom: p.nom, poste: `${p.poste} (${p.posteDetail})`, categorie: p.categorie, statut: p.statut === "Archivé" ? "archive" : "actif" }))} colonnes={[{ label: "Poste", cle: "poste" }, { label: "Catégorie", cle: "categorie" }]} onVoir={(e) => navigate({ to: "/joueurs/$playerId", params: { playerId: e.id } })} formulaire={(e, fermer) => <PlayerForm joueur={joueurs.find((p) => p.id === e?.id)} onDone={fermer} />} /> },
        { id: "tournois", label: "Tournois", contenu: <EntityCrud type="Tournoi" init={tournois.map((x) => ({ id: x.id, nom: x.nom, commune: x.commune, categorie: x.categorie, statut: x.statut === "termine" ? "archive" : "actif" }))} colonnes={[{ label: "Lieu", cle: "commune" }, { label: "Catégorie", cle: "categorie" }]} onVoir={(e) => navigate({ to: "/tournois/$tournamentId", params: { tournamentId: e.id } })} /> },
        { id: "orga", label: "Organisateurs", contenu: t(["Organisateur", "Tournois"], [...new Set(tournois.map((x) => x.organisateur))].map((o) => [o, tournois.filter((x) => x.organisateur === o).length])) },
        { id: "recruteurs", label: "Recruteurs", contenu: t(["Recruteur", "Profils suivis"], [["Scout Académie", 4], ["Club partenaire Lomé", 2]]) },
        { id: "categories", label: "Catégories", contenu: <GestionCategories /> },
        { id: "postes", label: "Postes", contenu: <GestionPostes /> },
        { id: "matchs", label: "Matchs", contenu: t(["Match", "Date", "Statut"], matchs.map((m) => [`${m.domicile} – ${m.exterieur}`, m.date, m.statut]), "Aucun match") },
        { id: "resultats", label: "Résultats", contenu: t(["Match", "Score", "Statut du résultat"], matchs.filter((m) => m.statut !== "a_venir").map((m) => [`${m.domicile} – ${m.exterieur}`, `${m.scoreDomicile ?? "-"} – ${m.scoreExterieur ?? "-"}`, <StatusPill key={m.id} statut={m.statutResultat} defs={STATUTS_RESULTAT} />]), "Aucun résultat") },
        { id: "stats", label: "Statistiques", contenu: <KpiGrid items={[{ label: "Matchs", valeur: "1 240" }, { label: "Buts", valeur: "3 106" }, { label: "Joueurs", valeur: "3 480" }, { label: "Visites / mois", valeur: "48 k" }]} /> },
        { id: "actus", label: "Actualités", contenu: t(["Titre", "Catégorie", "Date"], articles.map((a) => [a.titre, a.categorie, a.date]), "Aucun article") },
        { id: "medias", label: "Médias", contenu: t(["Fichier", "Type", "Taille"], [["finale-zou.jpg", "Image", "1,2 Mo"], ["resume-quart.mp4", "Vidéo", "48 Mo"]]) },
        { id: "pubs", label: "Publicités", contenu: <Publicites /> },
        { id: "sponsors", label: "Sponsors", contenu: t(["Sponsor", "Tournoi"], [["Partenaire télécom", "Coupe du Littoral 2025"]]) },
        { id: "signalements", label: "Signalements", contenu: <Signalements /> },
        { id: "validation", label: "Validation", contenu: <Validation /> },
        { id: "corbeille", label: "Corbeille", contenu: <Corbeille /> },
        { id: "notifs", label: "Notifications", contenu: <Panel><NotificationList espace="admin" /></Panel> },
        { id: "journal", label: "Journal d'activité", contenu: t(["Heure", "Action", "Par"], [["09:12", "Résultat validé", "Admin"], ["08:47", "Équipe créée", "AS Porto-Novo"], ["08:05", "Tournoi publié", "Comité d'Agla"]]) },
        { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Rôles administratifs prévus : Super Admin, Admin, Moderator, Competition Manager, Media Manager, Support. Les permissions réelles seront appliquées côté serveur.</p></Panel> },
      ]}
    />
  );
}
