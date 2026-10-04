import { useState } from "react";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import { CATEGORIES, GROUPES_POSTES, estCategorieMineure, postesDuGroupe, POSTES_REF } from "@/config/referentiels";
import type { Player, PlayerPrivate } from "@/types";
import { champ } from "@/components/fbn/Dialogs";

/** Sélecteur groupe → poste détaillé. */
export function PosteSelect({ label, value, onChange, optionnel }: { label: string; value: string; onChange: (code: string) => void; optionnel?: boolean }) {
  const [groupe, setGroupe] = useState(POSTES_REF.find((p) => p.code === value)?.groupe ?? "");
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="text-sm">{label} — groupe
        <select value={groupe} onChange={(e) => { setGroupe(e.target.value); onChange(""); }} className={champ}>
          <option value="">{optionnel ? "Aucun" : "Choisir…"}</option>
          {GROUPES_POSTES.map((g) => <option key={g}>{g}</option>)}
        </select>
      </label>
      <label className="text-sm">Poste
        <select value={value} disabled={!groupe} onChange={(e) => onChange(e.target.value)} className={champ}>
          <option value="">Choisir…</option>
          {postesDuGroupe(groupe).map((p) => <option key={p.code} value={p.code}>{p.code} — {p.libelle}</option>)}
        </select>
      </label>
    </div>
  );
}

function Section({ titre, children, prive }: { titre: string; children: React.ReactNode; prive?: boolean }) {
  return (
    <fieldset className={prive ? "rounded-2xl border border-warning/40 bg-warning/5 p-4" : "rounded-2xl border border-border p-4"}>
      <legend className="flex items-center gap-2 px-1 text-sm font-semibold">
        {prive && <Lock className="size-3.5 text-warning" aria-hidden />}{titre}
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${prive ? "bg-warning/15 text-warning" : "bg-primary/10 text-primary"}`}>{prive ? "Privé" : "Public"}</span>
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Formulaire joueur complet (création / modification). NPI volontairement absent. */
export function PlayerForm({ joueur, prive, onDone }: { joueur?: Player; prive?: PlayerPrivate; onDone?: () => void }) {
  const [nomComplet] = useState(joueur?.nom ?? "");
  const [categorie, setCategorie] = useState<string>(joueur?.categorie ?? "");
  const [poste, setPoste] = useState(joueur?.posteDetail ?? "");
  const [poste2, setPoste2] = useState(joueur?.posteSecondaire ?? "");
  const [envoi, setEnvoi] = useState(false);
  const mineur = estCategorieMineure(categorie);
  const [prenoms, ...reste] = nomComplet.split(" ");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!String(f.get("nom") ?? "").trim() || !String(f.get("prenoms") ?? "").trim()) return void toast.error("Nom et prénom(s) obligatoires.");
    if (!categorie || !poste) return void toast.error("Catégorie et poste principal obligatoires.");
    if (mineur && !String(f.get("tuteur") ?? "").trim()) return void toast.error("Pour un mineur, le parent/tuteur est obligatoire.");
    setEnvoi(true);
    await new Promise((r) => setTimeout(r, 400));
    setEnvoi(false);
    toast.success(joueur ? "Joueur modifié (démonstration, non enregistré)." : "Joueur créé (démonstration, non enregistré).");
    onDone?.();
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Section titre="Identité">
        <label className="text-sm">Nom<input name="nom" defaultValue={reste.join(" ")} maxLength={80} className={champ} /></label>
        <label className="text-sm">Prénom(s)<input name="prenoms" defaultValue={joueur ? prenoms : ""} maxLength={80} className={champ} /></label>
        <label className="text-sm">Surnom / pseudo sportif<input name="surnom" defaultValue={joueur?.surnom} maxLength={40} className={champ} /></label>
        <label className="text-sm">Photo<input type="file" accept="image/*" className={champ} /></label>
      </Section>
      <Section titre="Profil sportif">
        <label className="text-sm">Catégorie
          <select value={categorie} onChange={(e) => setCategorie(e.target.value)} className={champ}>
            <option value="">Choisir…</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="text-sm">Pied dominant
          <select name="pied" defaultValue={joueur?.pied ?? ""} className={champ}><option value="">Choisir…</option><option>Droit</option><option>Gauche</option><option>Les deux</option></select>
        </label>
        <div className="sm:col-span-2"><PosteSelect label="Poste principal" value={poste} onChange={setPoste} /></div>
        <div className="sm:col-span-2"><PosteSelect label="Poste secondaire" value={poste2} onChange={setPoste2} optionnel /></div>
        <label className="text-sm">Numéro de maillot<input name="numero" type="number" min={1} max={99} defaultValue={joueur?.numero} className={champ} /></label>
        <label className="text-sm">Statut
          <select name="statut" defaultValue={joueur?.statut ?? "Actif"} className={champ}>{["Actif", "Suspendu", "Archivé", "Corbeille"].map((s) => <option key={s}>{s}</option>)}</select>
        </label>
      </Section>
      <Section titre="Informations privées" prive>
        <label className="text-sm">Date de naissance<input name="naissance" type="date" defaultValue={prive?.dateNaissance} className={champ} /></label>
        <label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" defaultChecked={prive?.autorisationPhoto} /> Autorisation de diffusion de la photo</label>
        {mineur && (
          <>
            <p className="rounded-xl bg-warning/10 p-3 text-xs text-warning sm:col-span-2">Joueur mineur : les informations ci-dessous sont sensibles et ne sont jamais affichées publiquement.</p>
            <label className="text-sm">Parent / tuteur<input name="tuteur" defaultValue={prive?.tuteur?.nom} className={champ} /></label>
            <label className="text-sm">Relation avec le joueur<input defaultValue={prive?.tuteur?.relation} className={champ} /></label>
            <label className="text-sm">Contact du parent/tuteur<input type="tel" defaultValue={prive?.tuteur?.contact} className={champ} /></label>
          </>
        )}
        <label className="text-sm">Personne à contacter en urgence<input defaultValue={prive?.urgence?.nom} className={champ} /></label>
        <label className="text-sm">Contact d'urgence<input type="tel" defaultValue={prive?.urgence?.contact} className={champ} /></label>
        <p className="text-xs text-muted-foreground sm:col-span-2">Confidentialité : ces données sont réservées aux responsables de l'équipe et à l'administration. Elles ne figurent pas sur le profil public.</p>
      </Section>
      <button type="submit" disabled={envoi} className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
        {envoi ? "Enregistrement…" : joueur ? "Enregistrer les modifications" : "Créer le joueur"}
      </button>
    </form>
  );
}
