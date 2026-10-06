import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { STATUTS_RESULTAT, TYPES_EVENEMENT, libellePoste } from "@/config/referentiels";
import { StatusPill } from "@/components/fbn/StatusPill";
import { champ } from "@/components/fbn/Dialogs";
import type { Match, Player } from "@/types";

type Role = "titulaire" | "remplacant" | "non";
interface Ligne { joueur: Player; role: Role; capitaine: boolean; participe: boolean }
interface Ev { id: string; minute: number; type: string; joueur: string; equipe: "domicile" | "exterieur" }

const ORDRE = ["brouillon", "saisi", "soumis"] as const;

/** Feuille de match éditable (démonstration, non persistée). */
export function MatchSheet({ match, categorie, dom, ext }: { match: Match; categorie: string; dom: Player[]; ext: Player[] }) {
  const init = (l: Player[]): Ligne[] => l.map((joueur, i) => ({ joueur, role: i < 11 ? "titulaire" : "remplacant", capitaine: i === 0, participe: true }));
  const [compo, setCompo] = useState({ domicile: init(dom), exterieur: init(ext) });
  const [evs, setEvs] = useState<Ev[]>(match.evenements.map((e, i) => ({ ...e, id: String(i) })));
  const [statut, setStatut] = useState<string>(match.statutResultat === "valide" ? "valide" : "brouillon");
  const [nv, setNv] = useState({ minute: "", type: "but", joueur: "", equipe: "domicile" as Ev["equipe"] });
  const verrouille = statut === "soumis" || statut === "valide";

  const maj = (cote: "domicile" | "exterieur", id: string, patch: Partial<Ligne>) =>
    setCompo((c) => ({ ...c, [cote]: c[cote].map((l) => (patch.capitaine ? { ...l, capitaine: false } : l)).map((l) => (l.joueur.id === id ? { ...l, ...patch } : l)) }));

  const ajouter = (e: React.FormEvent) => {
    e.preventDefault();
    const minute = Number(nv.minute);
    if (!nv.joueur || !Number.isInteger(minute) || minute < 0 || minute > 130) return void toast.error("Minute (0–130) et joueur requis.");
    setEvs((l) => [...l, { id: crypto.randomUUID(), minute, type: nv.type, joueur: nv.joueur, equipe: nv.equipe }].sort((a, b) => a.minute - b.minute));
    setNv({ ...nv, minute: "", joueur: "" });
    if (statut === "brouillon") setStatut("saisi");
    toast.success("Événement ajouté.");
  };

  const avancer = () => {
    const i = ORDRE.indexOf(statut as (typeof ORDRE)[number]);
    const suivant = ORDRE[Math.min(i + 1, ORDRE.length - 1)] ?? "soumis";
    setStatut(suivant);
    toast(suivant === "soumis" ? "Feuille soumise : en attente de validation par l'administration." : "Feuille enregistrée comme saisie (démonstration).");
  };

  const joueursCote = (c: "domicile" | "exterieur") => compo[c].filter((l) => l.role !== "non");

  return (
    <div className="space-y-5">
      <section className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs tracking-widest text-primary uppercase">{match.tournoi} · {categorie}</p>
            <h2 className="font-display text-xl uppercase sm:text-2xl">{match.domicile} – {match.exterieur}</h2>
            <p className="text-sm text-muted-foreground">{match.date} · {match.heure} · {match.lieu}</p>
          </div>
          <StatusPill statut={statut} defs={STATUTS_RESULTAT} />
        </div>
        {statut === "valide" ? (
          <p className="mt-3 rounded-xl bg-success/10 p-3 text-sm text-success">Résultat validé : il alimente officiellement les statistiques.</p>
        ) : (
          <p className="mt-3 rounded-xl bg-warning/10 p-3 text-sm text-warning">Résultat non validé : il n'est pas pris en compte dans les statistiques.</p>
        )}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {(["domicile", "exterieur"] as const).map((cote) => (
          <section key={cote} className="glass rounded-2xl p-5">
            <h3 className="mb-3 font-display text-lg uppercase">{cote === "domicile" ? match.domicile : match.exterieur}</h3>
            {compo[cote].length === 0 ? <p className="text-sm text-muted-foreground">Aucun joueur enregistré pour cette équipe.</p> : (
              <ul className="space-y-2">
                {compo[cote].map((l) => (
                  <li key={l.joueur.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm">
                    <span className="min-w-0 flex-1"><span className="font-semibold">#{l.joueur.numero} {l.joueur.nom}</span> <span className="text-xs text-muted-foreground">{l.joueur.posteDetail} · {libellePoste(l.joueur.posteDetail)}</span></span>
                    <select aria-label="Rôle" disabled={verrouille} value={l.role} onChange={(e) => maj(cote, l.joueur.id, { role: e.target.value as Role })} className="focus-ring rounded-lg bg-surface-strong px-2 py-1 text-xs outline-none">
                      <option value="titulaire">Titulaire</option><option value="remplacant">Remplaçant</option><option value="non">Non convoqué</option>
                    </select>
                    <label className="flex items-center gap-1 text-xs"><input type="radio" disabled={verrouille} name={`cap-${cote}`} checked={l.capitaine} onChange={() => maj(cote, l.joueur.id, { capitaine: true })} /> Capitaine</label>
                    <label className="flex items-center gap-1 text-xs"><input type="checkbox" disabled={verrouille} checked={l.participe} onChange={(e) => maj(cote, l.joueur.id, { participe: e.target.checked })} /> A joué</label>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <section className="glass rounded-2xl p-5">
        <h3 className="mb-3 font-display text-lg uppercase">Événements</h3>
        {!verrouille && (
          <form onSubmit={ajouter} className="mb-4 grid gap-2 sm:grid-cols-[5rem_1fr_1fr_1.5fr_auto]">
            <label className="text-xs">Minute<input type="number" min={0} max={130} value={nv.minute} onChange={(e) => setNv({ ...nv, minute: e.target.value })} className={champ} /></label>
            <label className="text-xs">Type<select value={nv.type} onChange={(e) => setNv({ ...nv, type: e.target.value })} className={champ}>{TYPES_EVENEMENT.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
            <label className="text-xs">Équipe<select value={nv.equipe} onChange={(e) => setNv({ ...nv, equipe: e.target.value as Ev["equipe"], joueur: "" })} className={champ}><option value="domicile">{match.domicile}</option><option value="exterieur">{match.exterieur}</option></select></label>
            <label className="text-xs">Joueur<select value={nv.joueur} onChange={(e) => setNv({ ...nv, joueur: e.target.value })} className={champ}><option value="">Choisir…</option>{joueursCote(nv.equipe).map((l) => <option key={l.joueur.id}>{l.joueur.nom}</option>)}</select></label>
            <button className="focus-ring self-end rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Ajouter</button>
          </form>
        )}
        {evs.length === 0 ? <p className="text-sm text-muted-foreground">Aucun événement saisi.</p> : (
          <ul className="space-y-2 text-sm">
            {evs.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-xl bg-surface px-3 py-2">
                <span className="w-10 font-display text-primary">{e.minute}'</span>
                <span className="w-36 text-xs text-muted-foreground">{TYPES_EVENEMENT.find((t) => t.id === e.type)?.label ?? (e.type === "remplacement" ? "Remplacement" : e.type)}</span>
                <span className="flex-1">{e.joueur}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">{e.equipe === "domicile" ? match.domicile : match.exterieur}</span>
                {!verrouille && <button type="button" aria-label="Supprimer l'événement" onClick={() => setEvs((l) => l.filter((x) => x.id !== e.id))} className="focus-ring rounded p-1 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        {statut === "brouillon" || statut === "saisi" ? (
          <button type="button" onClick={avancer} className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{statut === "brouillon" ? "Enregistrer la saisie" : "Soumettre pour validation"}</button>
        ) : statut === "soumis" ? (
          <p className="text-sm text-muted-foreground">En attente de validation par l'administration.</p>
        ) : null}
        {(statut === "conteste" || statut === "rejete") && <button type="button" onClick={() => setStatut("saisi")} className="focus-ring rounded-full bg-surface px-5 py-2.5 text-sm">Corriger la feuille</button>}
      </div>
    </div>
  );
}
