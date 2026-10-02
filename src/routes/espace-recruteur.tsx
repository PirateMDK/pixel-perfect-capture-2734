import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { PlayerCard } from "@/components/fbn/Cards";
import { getPlayers } from "@/services/api";
import { AiScouting } from "@/components/fbn/AiScouting";

export const Route = createFileRoute("/espace-recruteur")({
  head: () => ({
    meta: [
      { title: "Espace recruteur — FBN" },
      { name: "description", content: "Scouting et suivi de profils sportifs sur Foot Bénin Network." },
      { property: "og:title", content: "Espace recruteur — FBN" },
      { property: "og:description", content: "Outils de détection du football local béninois." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: () => getPlayers(),
  component: EspaceRecruteur,
});

function EspaceRecruteur() {
  const joueurs = Route.useLoaderData();
  const sauvegardes = joueurs.slice(0, 4);
  return (
    <DashboardLayout
      espace="Recruteur"
      utilisateur="Scout · Académie partenaire"
      sections={[
        { id: "dash", label: "Dashboard", contenu: (<>
          <KpiGrid items={[{ label: "Profils sauvegardés", valeur: String(sauvegardes.length) }, { label: "Recherches sauvegardées", valeur: "3" }, { label: "Contacts en cours", valeur: "2" }, { label: "Nouveaux profils U19", valeur: "7" }]} />
          <Panel titre="Profils suivis"><div className="grid gap-4 sm:grid-cols-2">{sauvegardes.slice(0, 2).map((p) => <PlayerCard key={p.id} player={p} />)}</div></Panel>
        </>) },
        { id: "ia", label: "Analyse IA", contenu: <AiScouting joueurs={joueurs} /> },
        { id: "recherche", label: "Rechercher un joueur", contenu: <Panel><p className="text-sm text-muted-foreground">Utilisez l'outil de détection complet avec filtres par poste, catégorie et zone.</p><Link to="/talents" className="focus-ring mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ouvrir la détection</Link></Panel> },
        { id: "profils", label: "Profils sauvegardés", contenu: <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{sauvegardes.map((p) => <PlayerCard key={p.id} player={p} />)}</div> },
        { id: "recherches", label: "Recherches sauvegardées", contenu: <Panel><SimpleTable colonnes={["Recherche", "Résultats"]} lignes={[["Attaquants · Séniors · Ouémé", 4], ["Milieux · Féminin · Littoral", 2], ["Gardiens · U19", 1]]} /></Panel> },
        { id: "contacts", label: "Contacts", contenu: <Panel><SimpleTable colonnes={["Joueur", "Équipe contactée", "Statut"]} lignes={[["Kossi Mensah", "AS Porto-Novo", "Réponse reçue"], ["Baba Saka", "Racing Parakou", "En attente"]]} /></Panel> },
        { id: "notifs", label: "Notifications", contenu: <Panel><ul className="space-y-3 text-sm"><li>Kossi Mensah a marqué 2 buts en quart de finale.</li><li>Nouveau tournoi de détection : Trophée des Talents U19.</li></ul></Panel> },
        { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Paramètres disponibles après branchement de l'authentification.</p></Panel> },
      ]}
    />
  );
}
