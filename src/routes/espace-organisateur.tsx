import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout, KpiGrid, Panel, SimpleTable } from "@/components/layout/DashboardLayout";
import { MatchCard } from "@/components/fbn/Cards";
import { TournamentStatusBadge } from "@/components/fbn/StatusBadge";
import { CATEGORIES, DEPARTEMENTS } from "@/data/mock";
import { getMatches, getTeams, getTournaments } from "@/services/api";

export const Route = createFileRoute("/espace-organisateur")({
  head: () => ({
    meta: [
      { title: "Espace organisateur — FBN" },
      { name: "description", content: "Créez et gérez vos tournois sur Foot Bénin Network." },
      { property: "og:title", content: "Espace organisateur — FBN" },
      { property: "og:description", content: "Gestion de tournois, résultats et classements." },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: async () => ({ tournois: await getTournaments(), matchs: await getMatches(), equipes: await getTeams() }),
  component: EspaceOrganisateur,
});

const champ = "focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2.5 outline-none";

function EspaceOrganisateur() {
  const { tournois, matchs, equipes } = Route.useLoaderData();
  const mes = tournois.slice(0, 3);
  return (
    <DashboardLayout
      espace="Organisateur"
      utilisateur="Comité des quartiers d'Agla"
      sections={[
        { id: "dash", label: "Dashboard", contenu: (<>
          <KpiGrid items={[{ label: "Tournois", valeur: String(mes.length) }, { label: "Équipes inscrites", valeur: "34" }, { label: "Matchs à saisir", valeur: "3" }, { label: "Résultats validés", valeur: "18" }]} />
          <Panel titre="Mes tournois"><div className="space-y-3">{mes.map((t) => <div key={t.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-4 py-3"><span className="font-semibold">{t.nom}</span><TournamentStatusBadge statut={t.statut} /></div>)}</div></Panel>
        </>) },
        { id: "mes", label: "Mes tournois", contenu: <Panel><SimpleTable colonnes={["Tournoi", "Lieu", "Catégorie", "Équipes", "Dates"]} lignes={mes.map((t) => [t.nom, t.commune, t.categorie, t.equipes, `${t.debut} → ${t.fin}`])} /></Panel> },
        { id: "creer", label: "Créer un tournoi", contenu: (
          <Panel><form onSubmit={(e) => { e.preventDefault(); toast.success("Tournoi créé en brouillon (démonstration)."); }} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm sm:col-span-2">Nom du tournoi<input required className={champ} /></label>
            <label className="text-sm">Département<select className={champ}>{DEPARTEMENTS.map((d) => <option key={d}>{d}</option>)}</select></label>
            <label className="text-sm">Commune<input className={champ} /></label>
            <label className="text-sm">Catégorie<select className={champ}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="text-sm">Nombre d'équipes<input type="number" min={2} defaultValue={8} className={champ} /></label>
            <label className="text-sm">Date de début<input type="date" className={champ} /></label>
            <label className="text-sm">Date de fin<input type="date" className={champ} /></label>
            <label className="text-sm sm:col-span-2">Règlement<textarea rows={3} className={champ} /></label>
            <label className="text-sm sm:col-span-2">Affiche<input type="file" accept="image/*" className={champ} /></label>
            <button className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:w-fit">Créer le tournoi</button>
          </form></Panel>
        ) },
        { id: "equipes", label: "Équipes inscrites", contenu: <Panel><SimpleTable colonnes={["Équipe", "Commune", "Statut"]} lignes={equipes.map((e) => [e.nom, e.commune, e.verifie ? "Validée" : "En attente"])} /></Panel> },
        { id: "matchs", label: "Matchs", contenu: <Panel>{matchs.map((m) => <MatchCard key={m.id} match={m} />)}</Panel> },
        { id: "resultats", label: "Résultats", contenu: (
          <Panel titre="Saisir un résultat"><form onSubmit={(e) => { e.preventDefault(); toast.success("Résultat envoyé pour validation (démonstration)."); }} className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
            <label className="text-sm">Match<select className={champ}>{matchs.filter((m) => m.statut !== "termine").map((m) => <option key={m.id}>{m.domicile} – {m.exterieur}</option>)}</select></label>
            <label className="text-sm">Score domicile<input type="number" min={0} className={champ} /></label>
            <label className="text-sm">Score extérieur<input type="number" min={0} className={champ} /></label>
            <button className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground sm:w-fit">Enregistrer</button>
          </form></Panel>
        ) },
        { id: "classements", label: "Classements", contenu: <Panel><SimpleTable colonnes={["#", "Équipe", "Pts"]} lignes={equipes.slice(0, 6).map((e, i) => [i + 1, e.nom, 12 - i * 2])} /></Panel> },
        { id: "stats", label: "Statistiques", contenu: <KpiGrid items={[{ label: "Buts", valeur: "64" }, { label: "Moyenne / match", valeur: "2,9" }, { label: "Cartons jaunes", valeur: "41" }, { label: "Cartons rouges", valeur: "3" }]} /> },
        { id: "notifs", label: "Notifications", contenu: <Panel><ul className="space-y-3 text-sm"><li>3 nouvelles demandes d'inscription.</li><li>Résultat de la journée 12 validé par l'administration.</li></ul></Panel> },
        { id: "params", label: "Paramètres", contenu: <Panel><p className="text-sm text-muted-foreground">Paramètres disponibles après branchement de l'authentification.</p></Panel> },
      ]}
    />
  );
}
