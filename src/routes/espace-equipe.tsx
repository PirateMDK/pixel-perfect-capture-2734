import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { MatchCard } from "@/components/fbn/Cards";
import { CrudTable } from "@/components/fbn/CrudTable";
import { FormDialog } from "@/components/fbn/Dialogs";
import { NotificationList } from "@/components/fbn/NotificationBell";
import { PlayerForm } from "@/components/fbn/PlayerForm";
import { StatusPill } from "@/components/fbn/StatusPill";
import { STATUTS_CONTACT, STATUTS_JOUEUR, libellePoste } from "@/config/referentiels";
import { AFFICHES } from "@/data/mock";
import { adminUsers, playersPrivate } from "@/data/mock-espaces";
import { actions, useMockStore } from "@/lib/mock-store";
import { getMatches, getPlayers, getTeam } from "@/services/api";
import type { Player } from "@/types";

export const Route = createFileRoute("/espace-equipe")({
  head: () => ({
    meta: [
      { title: "Mon équipe — Espace FBN" },
      { name: "description", content: "Tableau de bord du responsable d'équipe." },
      { property: "og:title", content: "Espace équipe — FBN" },
      { property: "og:description", content: "Gestion d'équipe sur Foot Bénin Network." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async () => {
    const team = (await getTeam("as-porto-novo"))!;
    return { team, joueurs: await getPlayers({ teamId: team.id }), matchs: await getMatches({ teamId: team.id }) };
  },
  component: EspaceEquipe,
});

function Contacts({ teamId }: { teamId: string }) {
  const liste = useMockStore((s) => s.contacts).filter((c) => c.teamId === teamId);
  return (
    <CrudTable
      lignes={liste}
      vide="Aucune demande de contact"
      colonnes={[
        { label: "Recruteur", rendu: (c) => c.recruteur },
        { label: "Joueur", rendu: (c) => c.joueur },
        { label: "Message", rendu: (c) => <span className="line-clamp-2 max-w-xs">{c.message}</span> },
        { label: "Date", rendu: (c) => c.date },
        { label: "Statut", rendu: (c) => <StatusPill statut={c.statut} defs={STATUTS_CONTACT} /> },
      ]}
      actions={[
        { label: "Accepter", visible: (c) => c.statut === "attente", onSelect: (c) => { actions.statutContact(c.id, "acceptee"); toast.success("Demande acceptée : le recruteur est notifié."); } },
        { label: "Refuser", danger: true, visible: (c) => c.statut === "attente", onSelect: (c) => { actions.statutContact(c.id, "refusee"); toast("Demande refusée."); } },
        { label: "Clôturer", visible: (c) => c.statut === "acceptee", onSelect: (c) => { actions.statutContact(c.id, "fermee"); toast("Échange clôturé."); } },
      ]}
    />
  );
}

function EspaceEquipe() {
  const { team, joueurs: init, matchs } = Route.useLoaderData();
  const [joueurs, setJoueurs] = useState<Player[]>(init);
  const [edition, setEdition] = useState<{ open: boolean; p?: Player }>({ open: false });
  const prochains = matchs.filter((m) => m.statut !== "termine");
  const resultats = matchs.filter((m) => m.statut === "termine");
  const responsables = adminUsers.filter((u) => u.nom.startsWith(team.nom));
  const statut = (id: string, s: Player["statut"]) => { setJoueurs((l) => l.map((p) => (p.id === id ? { ...p, statut: s } : p))); toast.success(`Statut mis à jour : ${s}.`); };
  const sauver = () => toast.success("Modifications enregistrées (démonstration).");
  const effectif = (
    <CrudTable
      lignes={joueurs.filter((p) => p.statut !== "Corbeille")}
      vide="Aucun joueur enregistré"
      entete={<><p className="text-sm text-muted-foreground">{joueurs.length} joueur(s)</p><button type="button" onClick={() => setEdition({ open: true })} className="focus-ring rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Ajouter un joueur</button></>}
      colonnes={[
        { label: "Joueur", rendu: (p) => `#${p.numero} ${p.nom}` },
        { label: "Poste", rendu: (p) => `${p.posteDetail} · ${libellePoste(p.posteDetail)}` },
        { label: "Catégorie", rendu: (p) => p.categorie },
        { label: "Statut", rendu: (p) => <StatusPill statut={p.statut} defs={STATUTS_JOUEUR} /> },
      ]}
      actions={[
        { label: "Modifier", onSelect: (p) => setEdition({ open: true, p }) },
        { label: "Réactiver", visible: (p) => p.statut !== "Actif", onSelect: (p) => statut(p.id, "Actif") },
        { label: "Suspendre", visible: (p) => p.statut === "Actif", onSelect: (p) => statut(p.id, "Suspendu") },
        { label: "Archiver", visible: (p) => p.statut !== "Archivé", onSelect: (p) => statut(p.id, "Archivé") },
        { label: "Envoyer à la corbeille", danger: true, onSelect: (p) => statut(p.id, "Corbeille") },
      ]}
    />
  );
  return (
    <>
      <DashboardLayout
        espace="Mon équipe"
        espaceId="equipe"
        utilisateur={`${team.nom} · responsable`}
        sections={[
          { id: "dash", label: "Tableau de bord", contenu: (<>
            <KpiGrid items={[{ label: "Joueurs", valeur: String(team.joueurs) }, { label: "Tournois actifs", valeur: "2" }, { label: "Matchs joués", valeur: String(resultats.length) }, { label: "Buts (résultats validés)", valeur: String(joueurs.reduce((s, p) => s + p.stats.buts, 0)) }]} />
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel titre="Prochains matchs">{prochains.length ? prochains.map((m) => <MatchCard key={m.id} match={m} />) : <p className="text-sm text-muted-foreground">Aucun match programmé.</p>}</Panel>
              <Panel titre="Derniers résultats">{resultats.length ? resultats.map((m) => <MatchCard key={m.id} match={m} />) : <p className="text-sm text-muted-foreground">Aucun match.</p>}</Panel>
            </div>
          </>) },
          { id: "profil", label: "Profil", contenu: (<>
            <Panel><form onSubmit={(e) => { e.preventDefault(); sauver(); }} className="grid gap-4 sm:grid-cols-2">
              {[["Nom", team.nom], ["Commune", team.commune], ["Arrondissement", team.arrondissement], ["Couleurs", team.couleurs], ["Terrain", team.terrain], ["Année de création", String(team.annee)]].map(([l, v]) => (
                <label key={l} className="text-sm">{l}<input defaultValue={v} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2.5 outline-none" /></label>
              ))}
              <label className="text-sm sm:col-span-2">Description<textarea defaultValue={team.description} rows={3} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2.5 outline-none" /></label>
              <button className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:w-fit">Enregistrer</button>
            </form></Panel>
            <Panel titre="Responsables de l'équipe"><SimpleTable colonnes={["Nom", "Email"]} lignes={responsables.map((u) => [u.nom, u.email])} vide="Aucun responsable" /><button type="button" onClick={() => toast("Invitation d'un co-responsable (démonstration).")} className="focus-ring mt-3 rounded-full bg-surface px-4 py-2 text-sm">Inviter un responsable</button></Panel>
          </>) },
          { id: "effectif", label: "Effectif", contenu: effectif },
          { id: "contacts", label: "Demandes de contact", contenu: <Contacts teamId={team.id} /> },
          { id: "matchs", label: "Matchs", contenu: <Panel>{matchs.length ? matchs.map((m) => <MatchCard key={m.id} match={m} />) : <p className="text-sm text-muted-foreground">Aucun match.</p>}</Panel> },
          { id: "tournois", label: "Tournois", contenu: <Panel><SimpleTable colonnes={["Tournoi", "Statut"]} lignes={[["Coupe du Littoral 2025", "En cours"], ["Trophée des Talents U18/U19", "Inscription envoyée"]]} /></Panel> },
          { id: "stats", label: "Statistiques", contenu: <Panel><p className="mb-3 text-xs text-muted-foreground">Calculées uniquement à partir des matchs et événements validés.</p><SimpleTable colonnes={["Joueur", "Matchs", "Buts", "Passes", "Minutes"]} lignes={joueurs.map((p) => [p.nom, p.stats.matchs, p.stats.buts, p.stats.passes, p.stats.minutes])} /></Panel> },
          { id: "galerie", label: "Galerie", contenu: <div className="grid gap-4 sm:grid-cols-3">{[AFFICHES.littoral, AFFICHES.borgou, AFFICHES.talents].map((s, i) => <img key={i} src={s} alt={`Photo ${i + 1}`} className="aspect-[4/3] rounded-2xl object-cover" loading="lazy" />)}</div> },
          { id: "notifs", label: "Notifications", contenu: <Panel><NotificationList espace="equipe" /></Panel> },
          { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Gestion des accès, notifications et confidentialité — disponible après branchement de l'authentification.</p></Panel> },
        ]}
      />
      <FormDialog titre={edition.p ? `Modifier — ${edition.p.nom}` : "Ajouter un joueur"} open={edition.open} onOpenChange={(o) => setEdition((s) => ({ ...s, open: o }))}>
        <PlayerForm key={edition.p?.id ?? "new"} joueur={edition.p} prive={playersPrivate.find((x) => x.playerId === edition.p?.id)} onDone={() => setEdition({ open: false })} />
      </FormDialog>
    </>
  );
}
