import { createFileRoute, Link } from "@tanstack/react-router";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { PlayerCard } from "@/components/fbn/Cards";
import { getPlayers } from "@/services/api";
import { AiScouting } from "@/components/fbn/AiScouting";
import { NotificationList } from "@/components/fbn/NotificationBell";
import { StatusPill } from "@/components/fbn/StatusPill";
import { STATUTS_CONTACT } from "@/config/referentiels";
import { useMockStore } from "@/lib/mock-store";

function ContactsRecruteur() {
  const liste = useMockStore((s) => s.contacts).filter((c) => c.recruteur === "Scout · Académie partenaire");
  return <Panel><p className="mb-3 text-xs text-muted-foreground">Les échanges passent par l'équipe : les coordonnées personnelles des joueurs ne sont jamais communiquées.</p><SimpleTable colonnes={["Joueur", "Équipe contactée", "Date", "Statut"]} lignes={liste.map((c) => [c.joueur, c.equipe, c.date, <StatusPill key={c.id} statut={c.statut} defs={STATUTS_CONTACT} />])} vide="Aucune demande de contact" /></Panel>;
}

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
      espaceId="recruteur"
      utilisateur="Scout · Académie partenaire"
      sections={[
        { id: "dash", label: "Dashboard", contenu: (<>
          <KpiGrid items={[{ label: "Profils sauvegardés", valeur: String(sauvegardes.length) }, { label: "Recherches sauvegardées", valeur: "3" }, { label: "Contacts en cours", valeur: "2" }, { label: "Nouveaux profils U19", valeur: "7" }]} />
          <Panel titre="Profils suivis"><div className="grid gap-4 sm:grid-cols-2">{sauvegardes.slice(0, 2).map((p) => <PlayerCard key={p.id} player={p} />)}</div></Panel>
        </>) },
        { id: "ia", label: "Analyse IA", contenu: <AiScouting joueurs={joueurs} /> },
        { id: "recherche", label: "Rechercher un joueur", contenu: <Panel><p className="text-sm text-muted-foreground">Utilisez l'outil de détection complet avec filtres par poste, catégorie et zone.</p><Link to="/talents" className="focus-ring mt-4 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Ouvrir la détection</Link></Panel> },
        { id: "profils", label: "Profils sauvegardés", contenu: <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{sauvegardes.map((p) => <PlayerCard key={p.id} player={p} />)}</div> },
        { id: "recherches", label: "Recherches sauvegardées", contenu: <Panel><SimpleTable colonnes={["Recherche", "Résultats"]} lignes={[["Attaquants · Seniors · Ouémé", 4], ["Milieux · Seniors · Littoral", 2], ["Gardiens · U18/U19", 1]]} /></Panel> },
        { id: "contacts", label: "Contacts", contenu: <ContactsRecruteur /> },
        { id: "notifs", label: "Notifications", contenu: <Panel><NotificationList espace="recruteur" /></Panel> },
        { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Paramètres disponibles après branchement de l'authentification.</p></Panel> },
      ]}
    />
  );
}
