import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES_REF, GROUPES_POSTES, POSTES_REF, STATUTS_ENTITE, STATUTS_PUB, STATUTS_SIGNALEMENT, EMPLACEMENTS_PUB, ROLES_ADMIN, type CategorieRef, type PosteRef } from "@/config/referentiels";
import { advertisements, adminUsers, trash as trashInit } from "@/data/mock-espaces";
import { CrudTable } from "@/components/fbn/CrudTable";
import { StatusPill } from "@/components/fbn/StatusPill";
import { FormDialog, champ } from "@/components/fbn/Dialogs";
import { actions, useMockStore } from "@/lib/mock-store";
import type { AdminUser, Advertisement, TrashItem } from "@/types";

const btn = "focus-ring rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground";
const today = () => new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

/* ---------- Corbeille partagée (en mémoire) ---------- */
let trashState: TrashItem[] = [...trashInit];
const trashListeners = new Set<(t: TrashItem[]) => void>();
export function envoyerCorbeille(type: string, nom: string, raison?: string) {
  trashState = [{ id: crypto.randomUUID(), type, nom, supprimeLe: today(), par: "Admin FBN", raison }, ...trashState];
  trashListeners.forEach((l) => l(trashState));
  toast.success(`« ${nom} » envoyé à la corbeille.`);
}

export function Corbeille() {
  const [items, setItems] = useState(trashState);
  useState(() => { trashListeners.add(setItems); });
  const retirer = (id: string) => { trashState = trashState.filter((t) => t.id !== id); setItems(trashState); };
  return (
    <CrudTable
      lignes={items}
      vide="La corbeille est vide"
      colonnes={[
        { label: "Nom", rendu: (t) => t.nom },
        { label: "Type", rendu: (t) => t.type },
        { label: "Supprimé le", rendu: (t) => t.supprimeLe },
        { label: "Par", rendu: (t) => t.par },
        { label: "Raison", rendu: (t) => t.raison ?? "—" },
      ]}
      actions={[
        { label: "Restaurer", onSelect: (t) => { retirer(t.id); toast.success(`« ${t.nom} » restauré.`); } },
        { label: "Supprimer définitivement", danger: true, onSelect: (t) => { if (confirm(`Supprimer définitivement « ${t.nom} » ? (démonstration)`)) { retirer(t.id); toast.success("Élément supprimé définitivement (visuel uniquement)."); } } },
      ]}
      entete={<p className="text-xs text-muted-foreground">Suppression logique : la suppression définitive réelle sera gérée par le backend.</p>}
    />
  );
}

/* ---------- CRUD générique d'entités (équipes, joueurs, tournois) ---------- */
type Entite = { id: string; nom: string; statut: string; [k: string]: string };
export function EntityCrud({ type, init, colonnes, onVoir, formulaire }: {
  type: string;
  init: Entite[];
  colonnes: { label: string; cle: string }[];
  onVoir?: (e: Entite) => void;
  formulaire?: (e: Entite | undefined, fermer: () => void) => React.ReactNode;
}) {
  const [items, setItems] = useState(init);
  const [edition, setEdition] = useState<{ open: boolean; e?: Entite }>({ open: false });
  const statut = (id: string, s: string, msg: string) => { setItems((l) => l.map((x) => (x.id === id ? { ...x, statut: s } : x))); toast.success(msg); };
  const fermer = () => setEdition({ open: false });
  return (
    <>
      <CrudTable
        lignes={items}
        vide={`Aucun élément (${type.toLowerCase()})`}
        entete={<><p className="text-sm text-muted-foreground">{items.length} élément(s)</p><button type="button" onClick={() => setEdition({ open: true })} className={btn}>Créer</button></>}
        colonnes={[
          { label: "Nom", rendu: (e) => e.nom },
          ...colonnes.map((c) => ({ label: c.label, rendu: (e: Entite) => e[c.cle] })),
          { label: "Statut", rendu: (e) => <StatusPill statut={e.statut} defs={STATUTS_ENTITE} /> },
        ]}
        actions={[
          ...(onVoir ? [{ label: "Consulter", onSelect: onVoir }] : []),
          { label: "Modifier", onSelect: (e) => setEdition({ open: true, e }) },
          { label: "Activer", visible: (e) => e.statut !== "actif", onSelect: (e) => statut(e.id, "actif", `${e.nom} activé.`) },
          { label: "Désactiver", visible: (e) => e.statut === "actif", onSelect: (e) => statut(e.id, "desactive", `${e.nom} désactivé.`) },
          { label: "Archiver", visible: (e) => e.statut !== "archive", onSelect: (e) => statut(e.id, "archive", `${e.nom} archivé.`) },
          { label: "Envoyer à la corbeille", danger: true, onSelect: (e) => { setItems((l) => l.filter((x) => x.id !== e.id)); envoyerCorbeille(type, e.nom); } },
        ]}
      />
      <FormDialog titre={edition.e ? `Modifier — ${edition.e.nom}` : `Créer — ${type}`} open={edition.open} onOpenChange={(o) => setEdition((s) => ({ ...s, open: o }))}>
        {formulaire ? formulaire(edition.e, fermer) : (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              const nom = String(new FormData(ev.currentTarget).get("nom") ?? "").trim().slice(0, 120);
              if (nom.length < 2) return void toast.error("Le nom doit contenir au moins 2 caractères.");
              if (edition.e) setItems((l) => l.map((x) => (x.id === edition.e!.id ? { ...x, nom } : x)));
              else setItems((l) => [{ id: crypto.randomUUID(), nom, statut: "actif", ...Object.fromEntries(colonnes.map((c) => [c.cle, "—"])) }, ...l]);
              toast.success(edition.e ? "Modifications appliquées (démonstration)." : "Élément créé (démonstration).");
              fermer();
            }}
            className="space-y-4"
          >
            <label className="block text-sm">Nom<input name="nom" defaultValue={edition.e?.nom} className={champ} /></label>
            <button className={btn}>Enregistrer</button>
          </form>
        )}
      </FormDialog>
    </>
  );
}

/* ---------- Utilisateurs (rôles représentés, sécurité RBAC côté serveur plus tard) ---------- */
export function Utilisateurs() {
  const [items, setItems] = useState<AdminUser[]>(adminUsers);
  const [open, setOpen] = useState(false);
  const set = (id: string, statut: AdminUser["statut"]) => { setItems((l) => l.map((u) => (u.id === id ? { ...u, statut } : u))); toast.success("Statut mis à jour."); };
  return (
    <>
      <CrudTable
        lignes={items}
        vide="Aucun utilisateur"
        entete={<><p className="text-xs text-muted-foreground">Rôles affichés à titre indicatif : les permissions réelles seront vérifiées côté serveur.</p><button type="button" onClick={() => setOpen(true)} className={btn}>Inviter</button></>}
        colonnes={[
          { label: "Nom", rendu: (u) => u.nom },
          { label: "Rôle", rendu: (u) => u.role },
          { label: "Email", rendu: (u) => u.email },
          { label: "Statut", rendu: (u) => <StatusPill statut={u.statut} defs={STATUTS_ENTITE} /> },
        ]}
        actions={[
          { label: "Activer", visible: (u) => u.statut !== "actif", onSelect: (u) => set(u.id, "actif") },
          { label: "Désactiver", visible: (u) => u.statut === "actif", onSelect: (u) => set(u.id, "desactive") },
          { label: "Archiver", visible: (u) => u.statut !== "archive", onSelect: (u) => set(u.id, "archive") },
          { label: "Envoyer à la corbeille", danger: true, onSelect: (u) => { setItems((l) => l.filter((x) => x.id !== u.id)); envoyerCorbeille("Utilisateur", u.nom); } },
        ]}
      />
      <FormDialog titre="Inviter un utilisateur" open={open} onOpenChange={setOpen}>
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const nom = String(f.get("nom") ?? "").trim(); const email = String(f.get("email") ?? "").trim();
          if (nom.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return void toast.error("Nom et email valides requis.");
          setItems((l) => [{ id: crypto.randomUUID(), nom: nom.slice(0, 100), email: email.slice(0, 200), role: String(f.get("role")), statut: "actif" }, ...l]);
          toast.success("Invitation préparée (démonstration, aucun email envoyé)."); setOpen(false);
        }}>
          <label className="block text-sm">Nom<input name="nom" className={champ} /></label>
          <label className="block text-sm">Email<input name="email" type="email" className={champ} /></label>
          <label className="block text-sm">Rôle<select name="role" className={champ}>{[...ROLES_ADMIN, "Équipe", "Organisateur", "Recruteur", "Joueur", "Média"].map((r) => <option key={r}>{r}</option>)}</select></label>
          <button className={btn}>Envoyer l'invitation</button>
        </form>
      </FormDialog>
    </>
  );
}

/* ---------- Catégories ---------- */
export function GestionCategories() {
  const [items, setItems] = useState<CategorieRef[]>(CATEGORIES_REF);
  const [nom, setNom] = useState("");
  const tri = [...items].sort((a, b) => a.ordre - b.ordre);
  const deplacer = (id: string, d: -1 | 1) => {
    const i = tri.findIndex((c) => c.id === id); const j = i + d;
    if (j < 0 || j >= tri.length) return;
    const a = tri[i], b = tri[j];
    if (!a || !b) return;
    setItems((l) => l.map((c) => (c.id === a.id ? { ...c, ordre: b.ordre } : c.id === b.id ? { ...c, ordre: a.ordre } : c)));
  };
  return (
    <section className="glass rounded-2xl p-5">
      <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); const n = nom.trim(); if (!n || items.some((c) => c.nom === n)) return void toast.error("Nom vide ou déjà existant."); setItems((l) => [...l, { id: crypto.randomUUID(), nom: n.slice(0, 40), actif: true, ordre: l.length + 1 }]); setNom(""); toast.success("Catégorie ajoutée (démonstration)."); }}>
        <input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Nouvelle catégorie" aria-label="Nouvelle catégorie" className="focus-ring min-w-0 flex-1 rounded-xl bg-surface px-3 py-2.5 text-sm outline-none" />
        <button className={btn}>Ajouter</button>
      </form>
      <ul className="space-y-2">
        {tri.map((c, i) => (
          <li key={c.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm">
            <span className="w-6 text-center font-display text-primary">{c.ordre}</span>
            <input aria-label="Nom" defaultValue={c.nom} onBlur={(e) => setItems((l) => l.map((x) => (x.id === c.id ? { ...x, nom: e.target.value.trim().slice(0, 40) || x.nom } : x)))} className="focus-ring min-w-0 flex-1 rounded-lg bg-transparent px-2 py-1 outline-none" />
            <button type="button" aria-label="Monter" disabled={i === 0} onClick={() => deplacer(c.id, -1)} className="focus-ring rounded p-1 disabled:opacity-30"><ArrowUp className="size-4" /></button>
            <button type="button" aria-label="Descendre" disabled={i === tri.length - 1} onClick={() => deplacer(c.id, 1)} className="focus-ring rounded p-1 disabled:opacity-30"><ArrowDown className="size-4" /></button>
            <button type="button" onClick={() => setItems((l) => l.map((x) => (x.id === c.id ? { ...x, actif: !x.actif } : x)))} className="focus-ring">
              <StatusPill statut={c.actif ? "actif" : "desactive"} defs={STATUTS_ENTITE} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- Postes ---------- */
export function GestionPostes() {
  const [items, setItems] = useState<PosteRef[]>(POSTES_REF);
  const [nv, setNv] = useState({ code: "", libelle: "", groupe: "Gardien" });
  return (
    <div className="space-y-4">
      <form className="glass grid gap-2 rounded-2xl p-4 sm:grid-cols-[6rem_1fr_10rem_auto]" onSubmit={(e) => { e.preventDefault(); const code = nv.code.trim().toUpperCase(); if (!code || !nv.libelle.trim() || items.some((p) => p.code === code)) return void toast.error("Code unique et libellé requis."); setItems((l) => [...l, { code: code.slice(0, 5), libelle: nv.libelle.trim().slice(0, 60), groupe: nv.groupe as PosteRef["groupe"], actif: true, ordre: l.length + 1 }]); setNv({ ...nv, code: "", libelle: "" }); toast.success("Poste ajouté (démonstration)."); }}>
        <input aria-label="Code" placeholder="Code" value={nv.code} onChange={(e) => setNv({ ...nv, code: e.target.value })} className="focus-ring rounded-xl bg-surface px-3 py-2.5 text-sm outline-none" />
        <input aria-label="Libellé" placeholder="Libellé" value={nv.libelle} onChange={(e) => setNv({ ...nv, libelle: e.target.value })} className="focus-ring rounded-xl bg-surface px-3 py-2.5 text-sm outline-none" />
        <select aria-label="Groupe" value={nv.groupe} onChange={(e) => setNv({ ...nv, groupe: e.target.value })} className="focus-ring rounded-xl bg-surface px-3 py-2.5 text-sm outline-none">{GROUPES_POSTES.map((g) => <option key={g}>{g}</option>)}</select>
        <button className={btn}>Ajouter</button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {GROUPES_POSTES.map((g) => (
          <section key={g} className="glass rounded-2xl p-5">
            <h3 className="mb-3 font-display text-lg uppercase">{g}</h3>
            <ul className="space-y-2">
              {items.filter((p) => p.groupe === g).map((p) => (
                <li key={p.code} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2 text-sm">
                  <span className="w-12 font-display text-primary">{p.code}</span><span className="flex-1">{p.libelle}</span>
                  <button type="button" onClick={() => setItems((l) => l.map((x) => (x.code === p.code ? { ...x, actif: !x.actif } : x)))} className="focus-ring"><StatusPill statut={p.actif ? "actif" : "desactive"} defs={STATUTS_ENTITE} /></button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

/* ---------- Publicités ---------- */
export function Publicites() {
  const [items, setItems] = useState<Advertisement[]>(advertisements);
  const [edition, setEdition] = useState<{ open: boolean; a?: Advertisement }>({ open: false });
  const set = (id: string, statut: Advertisement["statut"]) => { setItems((l) => l.map((a) => (a.id === id ? { ...a, statut } : a))); toast.success("Statut de la publicité mis à jour."); };
  const enregistrer = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const f = { annonceur: String(fd.get("annonceur") ?? ""), titre: String(fd.get("titre") ?? ""), debut: String(fd.get("debut") ?? ""), fin: String(fd.get("fin") ?? ""), emplacement: String(fd.get("emplacement") ?? ""), statut: String(fd.get("statut") ?? "brouillon") };
    if (!f.annonceur?.trim() || !f.titre?.trim() || !f.debut || !f.fin) return void toast.error("Annonceur, titre et dates obligatoires.");
    if (f.fin < f.debut) return void toast.error("La date de fin doit suivre la date de début.");
    const data = { annonceur: f.annonceur.trim().slice(0, 100), titre: f.titre.trim().slice(0, 120), emplacement: f.emplacement, debut: f.debut, fin: f.fin, statut: f.statut as Advertisement["statut"] };
    if (edition.a) setItems((l) => l.map((a) => (a.id === edition.a!.id ? { ...a, ...data } : a)));
    else setItems((l) => [{ id: crypto.randomUUID(), ...data }, ...l]);
    toast.success("Publicité enregistrée (démonstration).");
    setEdition({ open: false });
  };
  const a = edition.a;
  return (
    <>
      <CrudTable
        lignes={items}
        vide="Aucune publicité"
        entete={<><p className="text-xs text-muted-foreground">Aucun paiement n'est géré par la plateforme.</p><button type="button" onClick={() => setEdition({ open: true })} className={btn}>Nouvelle publicité</button></>}
        colonnes={[
          { label: "Titre", rendu: (x) => <span className="flex items-center gap-2">{x.visuel && <img src={x.visuel} alt="" className="size-8 rounded object-cover" />}{x.titre}</span> },
          { label: "Annonceur", rendu: (x) => x.annonceur },
          { label: "Emplacement", rendu: (x) => x.emplacement },
          { label: "Période", rendu: (x) => `${x.debut} → ${x.fin}` },
          { label: "Statut", rendu: (x) => <StatusPill statut={x.statut} defs={STATUTS_PUB} /> },
        ]}
        actions={[
          { label: "Modifier", onSelect: (x) => setEdition({ open: true, a: x }) },
          { label: "Activer", visible: (x) => x.statut !== "active", onSelect: (x) => set(x.id, "active") },
          { label: "Désactiver", visible: (x) => x.statut === "active", onSelect: (x) => set(x.id, "desactivee") },
          { label: "Envoyer à la corbeille", danger: true, onSelect: (x) => { setItems((l) => l.filter((y) => y.id !== x.id)); envoyerCorbeille("Publicité", x.titre); } },
        ]}
      />
      <FormDialog titre={a ? "Modifier la publicité" : "Nouvelle publicité"} open={edition.open} onOpenChange={(o) => setEdition((s) => ({ ...s, open: o }))}>
        <form key={a?.id ?? "new"} onSubmit={enregistrer} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">Annonceur<input name="annonceur" defaultValue={a?.annonceur} className={champ} /></label>
          <label className="text-sm">Titre<input name="titre" defaultValue={a?.titre} className={champ} /></label>
          <label className="text-sm">Visuel<input type="file" accept="image/*" className={champ} /></label>
          <label className="text-sm">Emplacement<select name="emplacement" defaultValue={a?.emplacement} className={champ}>{EMPLACEMENTS_PUB.map((x) => <option key={x}>{x}</option>)}</select></label>
          <label className="text-sm">Date de début<input type="date" name="debut" defaultValue={a?.debut} className={champ} /></label>
          <label className="text-sm">Date de fin<input type="date" name="fin" defaultValue={a?.fin} className={champ} /></label>
          <label className="text-sm">Statut<select name="statut" defaultValue={a?.statut ?? "brouillon"} className={champ}>{Object.entries(STATUTS_PUB).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select></label>
          <button className={`${btn} sm:col-span-2 sm:w-fit`}>Enregistrer</button>
        </form>
      </FormDialog>
    </>
  );
}

/* ---------- Signalements ---------- */
export function Signalements() {
  const items = useMockStore((s) => s.reports);
  return (
    <CrudTable
      lignes={items}
      vide="Aucun signalement"
      colonnes={[
        { label: "Contenu", rendu: (r) => r.cible },
        { label: "Type", rendu: (r) => r.typeCible },
        { label: "Motif", rendu: (r) => r.motif },
        { label: "Commentaire", rendu: (r) => r.commentaire ?? "—" },
        { label: "Date", rendu: (r) => r.date },
        { label: "Statut", rendu: (r) => <StatusPill statut={r.statut} defs={STATUTS_SIGNALEMENT} /> },
      ]}
      actions={[
        { label: "Prendre en charge", visible: (r) => r.statut === "nouveau", onSelect: (r) => { actions.statutSignalement(r.id, "en_cours"); toast("Signalement en cours de traitement."); } },
        { label: "Marquer traité", visible: (r) => r.statut !== "traite", onSelect: (r) => { actions.statutSignalement(r.id, "traite"); toast.success("Signalement traité."); } },
        { label: "Rejeter", danger: true, visible: (r) => r.statut !== "rejete", onSelect: (r) => { actions.statutSignalement(r.id, "rejete"); toast("Signalement rejeté."); } },
      ]}
    />
  );
}
