import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { MatchCard } from "@/components/fbn/Cards";
import { AFFICHES } from "@/data/mock";
import { getMatches, getPlayers, getTeam } from "@/services/api";

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

function EspaceEquipe() {
  const { team, joueurs, matchs } = Route.useLoaderData();
  const prochains = matchs.filter((m) => m.statut !== "termine");
  const resultats = matchs.filter((m) => m.statut === "termine");
  const effectif = <Panel titre="Effectif"><SimpleTable colonnes={["N°", "Joueur", "Poste", "Catégorie", "Statut"]} lignes={joueurs.map((p) => [p.numero, p.nom, p.poste, p.categorie, p.statut])} /></Panel>;
  const sauver = () => toast.success("Modifications enregistrées (démonstration).");
  return (
    <DashboardLayout
      espace="Mon équipe"
      utilisateur={`${team.nom} · responsable`}
      sections={[
        { id: "dash", label: "Tableau de bord", contenu: (<>
          <KpiGrid items={[{ label: "Joueurs", valeur: String(team.joueurs) }, { label: "Tournois actifs", valeur: "2" }, { label: "Matchs joués", valeur: String(resultats.length) }, { label: "Buts", valeur: String(joueurs.reduce((s, p) => s + p.stats.buts, 0)) }]} />
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel titre="Prochains matchs">{prochains.length ? prochains.map((m) => <MatchCard key={m.id} match={m} />) : <p className="text-sm text-muted-foreground">Aucun match programmé.</p>}</Panel>
            <Panel titre="Derniers résultats">{resultats.map((m) => <MatchCard key={m.id} match={m} />)}</Panel>
          </div>
        </>) },
        { id: "profil", label: "Profil", contenu: (
          <Panel><form onSubmit={(e) => { e.preventDefault(); sauver(); }} className="grid gap-4 sm:grid-cols-2">
            {[["Nom", team.nom], ["Commune", team.commune], ["Arrondissement", team.arrondissement], ["Couleurs", team.couleurs], ["Terrain", team.terrain], ["Année de création", String(team.annee)]].map(([l, v]) => (
              <label key={l} className="text-sm">{l}<input defaultValue={v} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2.5 outline-none" /></label>
            ))}
            <label className="text-sm sm:col-span-2">Description<textarea defaultValue={team.description} rows={3} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2.5 outline-none" /></label>
            <button className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:w-fit">Enregistrer</button>
          </form></Panel>
        ) },
        { id: "effectif", label: "Effectif", contenu: effectif },
        { id: "matchs", label: "Matchs", contenu: <Panel>{matchs.map((m) => <MatchCard key={m.id} match={m} />)}</Panel> },
        { id: "tournois", label: "Tournois", contenu: <Panel><SimpleTable colonnes={["Tournoi", "Statut"]} lignes={[["Coupe du Littoral 2025", "En cours"], ["Trophée des Talents U19", "Inscription envoyée"]]} /></Panel> },
        { id: "stats", label: "Statistiques", contenu: <Panel><SimpleTable colonnes={["Joueur", "Matchs", "Buts", "Passes", "Minutes"]} lignes={joueurs.map((p) => [p.nom, p.stats.matchs, p.stats.buts, p.stats.passes, p.stats.minutes])} /></Panel> },
        { id: "galerie", label: "Galerie", contenu: <div className="grid gap-4 sm:grid-cols-3">{[AFFICHES.littoral, AFFICHES.borgou, AFFICHES.talents].map((s, i) => <img key={i} src={s} alt={`Photo ${i + 1}`} className="aspect-[4/3] rounded-2xl object-cover" loading="lazy" />)}</div> },
        { id: "notifs", label: "Notifications", contenu: <Panel><ul className="space-y-3 text-sm"><li>Votre résultat contre Étoile de Sègbé a été validé.</li><li>Inscription au Trophée des Talents U19 en cours d'examen.</li><li>Un recruteur a consulté le profil de Kossi Mensah.</li></ul></Panel> },
        { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Gestion des accès, notifications et confidentialité — disponible après branchement de l'authentification.</p></Panel> },
      ]}
    />
  );
}
