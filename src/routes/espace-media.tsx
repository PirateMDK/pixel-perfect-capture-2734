import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { DashboardLayout, KpiGrid, Panel } from "@/components/layout/DashboardLayout";
import { CrudTable } from "@/components/fbn/CrudTable";
import { StatusPill } from "@/components/fbn/StatusPill";
import { FormDialog, champ } from "@/components/fbn/Dialogs";
import { NotificationList } from "@/components/fbn/NotificationBell";
import { STATUTS_CONTENU } from "@/config/referentiels";
import { mediaContents } from "@/data/mock-espaces";
import type { MediaContent } from "@/types";

export const Route = createFileRoute("/espace-media")({
  head: () => ({
    meta: [
      { title: "Espace média — FBN" },
      { name: "description", content: "Gestion des articles, photos et vidéos des médias partenaires FBN." },
      { property: "og:title", content: "Espace média — FBN" },
      { property: "og:description", content: "Publication de contenus sur le football local béninois." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EspaceMedia,
});

const btn = "focus-ring rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground";

function EspaceMedia() {
  const [items, setItems] = useState<MediaContent[]>(mediaContents);
  const [edition, setEdition] = useState<{ open: boolean; c?: MediaContent; apercu?: boolean }>({ open: false });
  const set = (id: string, statut: MediaContent["statut"], msg: string) => { setItems((l) => l.map((c) => (c.id === id ? { ...c, statut } : c))); toast.success(msg); };

  const liste = (filtre: (c: MediaContent) => boolean, vide: string) => (
    <CrudTable
      lignes={items.filter(filtre)}
      vide={vide}
      entete={<><p className="text-sm text-muted-foreground">{items.filter(filtre).length} contenu(s)</p><button type="button" onClick={() => setEdition({ open: true })} className={btn}>Créer</button></>}
      colonnes={[
        { label: "Titre", rendu: (c) => c.titre },
        { label: "Type", rendu: (c) => c.type },
        { label: "Date", rendu: (c) => c.date },
        { label: "Vues", rendu: (c) => c.vues.toLocaleString("fr-FR") },
        { label: "Statut", rendu: (c) => <StatusPill statut={c.statut} defs={STATUTS_CONTENU} /> },
      ]}
      actions={[
        { label: "Prévisualiser", onSelect: (c) => setEdition({ open: true, c, apercu: true }) },
        { label: "Modifier", visible: (c) => c.statut !== "publie", onSelect: (c) => setEdition({ open: true, c }) },
        { label: "Soumettre à vérification", visible: (c) => c.statut === "brouillon" || c.statut === "rejete", onSelect: (c) => set(c.id, "attente", "Contenu soumis : en attente de vérification.") },
        { label: "Archiver", visible: (c) => c.statut !== "archive", onSelect: (c) => set(c.id, "archive", "Contenu archivé.") },
      ]}
    />
  );

  const enregistrer = (e: React.FormEvent<HTMLFormElement>, soumettre: boolean) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const titre = (f["titre"] ?? "").trim().slice(0, 150);
    if (titre.length < 5) return void toast.error("Le titre doit contenir au moins 5 caractères.");
    const statut: MediaContent["statut"] = soumettre ? "attente" : "brouillon";
    if (edition.c) setItems((l) => l.map((c) => (c.id === edition.c!.id ? { ...c, titre, type: f["type"] as MediaContent["type"], statut } : c)));
    else setItems((l) => [{ id: crypto.randomUUID(), titre, type: f["type"] as MediaContent["type"], date: new Date().toLocaleDateString("fr-FR"), vues: 0, statut }, ...l]);
    toast.success(soumettre ? "Contenu soumis à vérification (démonstration)." : "Brouillon enregistré (démonstration).");
    setEdition({ open: false });
  };

  const c = edition.c;
  const publies = items.filter((x) => x.statut === "publie");
  return (
    <>
      <DashboardLayout
        espace="Média"
        espaceId="media"
        utilisateur="Média Sport BJ · rédaction"
        sections={[
          { id: "dash", label: "Dashboard", contenu: <KpiGrid items={[{ label: "Contenus publiés", valeur: String(publies.length) }, { label: "En attente", valeur: String(items.filter((x) => x.statut === "attente").length) }, { label: "Brouillons", valeur: String(items.filter((x) => x.statut === "brouillon").length) }, { label: "Vues totales", valeur: publies.reduce((s, x) => s + x.vues, 0).toLocaleString("fr-FR") }]} /> },
          { id: "articles", label: "Articles", contenu: liste((x) => x.type === "Article", "Aucun article") },
          { id: "brouillons", label: "Brouillons", contenu: liste((x) => x.statut === "brouillon", "Aucun brouillon") },
          { id: "publications", label: "Publications", contenu: liste((x) => x.statut === "attente" || x.statut === "rejete", "Aucune publication en cours") },
          { id: "photos", label: "Photos", contenu: liste((x) => x.type === "Photo", "Aucune photo") },
          { id: "videos", label: "Vidéos", contenu: liste((x) => x.type === "Vidéo", "Aucune vidéo") },
          { id: "publies", label: "Contenus publiés", contenu: liste((x) => x.statut === "publie", "Aucun contenu publié") },
          { id: "stats", label: "Statistiques", contenu: <Panel titre="Contenus les plus vus"><ul className="space-y-3">{[...publies].sort((a, b) => b.vues - a.vues).map((x) => { const max = Math.max(...publies.map((p) => p.vues), 1); return <li key={x.id} className="text-sm"><div className="flex justify-between gap-3"><span>{x.titre}</span><span className="tabular-nums text-muted-foreground">{x.vues.toLocaleString("fr-FR")}</span></div><div className="mt-1 h-1.5 rounded-full bg-surface-strong"><div className="h-full rounded-full bg-primary" style={{ width: `${(x.vues / max) * 100}%` }} /></div></li>; })}</ul></Panel> },
          { id: "notifs", label: "Notifications", contenu: <Panel><NotificationList espace="media" /></Panel> },
          { id: "profil", label: "Profil média", contenu: <Panel><form onSubmit={(e) => { e.preventDefault(); toast.success("Profil enregistré (démonstration)."); }} className="grid gap-3 sm:grid-cols-2"><label className="text-sm">Nom du média<input defaultValue="Média Sport BJ" className={champ} /></label><label className="text-sm">Site web<input type="url" placeholder="https://" className={champ} /></label><label className="text-sm sm:col-span-2">Présentation<textarea rows={3} className={champ} /></label><button className={`${btn} sm:w-fit`}>Enregistrer</button></form></Panel> },
        ]}
      />
      <FormDialog titre={edition.apercu ? "Prévisualisation" : c ? "Modifier le contenu" : "Nouveau contenu"} open={edition.open} onOpenChange={(o) => setEdition((s) => ({ ...s, open: o }))}>
        {edition.apercu && c ? (
          <article className="space-y-2"><StatusPill statut={c.statut} defs={STATUTS_CONTENU} /><h2 className="font-display text-2xl uppercase">{c.titre}</h2><p className="text-sm text-muted-foreground">{c.type} · {c.date}</p></article>
        ) : (
          <form key={c?.id ?? "new"} onSubmit={(e) => enregistrer(e, (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "soumettre")} className="space-y-3">
            <label className="block text-sm">Type<select name="type" defaultValue={c?.type ?? "Article"} className={champ}><option>Article</option><option>Photo</option><option>Vidéo</option></select></label>
            <label className="block text-sm">Titre<input name="titre" defaultValue={c?.titre} maxLength={150} className={champ} /></label>
            <label className="block text-sm">Contenu / légende<textarea rows={4} className={champ} /></label>
            <label className="block text-sm">Fichier<input type="file" accept="image/*,video/*" className={champ} /></label>
            <div className="flex flex-wrap gap-2"><button value="brouillon" className="focus-ring rounded-full bg-surface px-4 py-2 text-sm">Enregistrer en brouillon</button><button value="soumettre" className={btn}>Soumettre</button></div>
          </form>
        )}
      </FormDialog>
    </>
  );
}
