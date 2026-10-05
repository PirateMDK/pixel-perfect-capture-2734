import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import type { Player } from "@/types";
import { analyserProfils } from "@/lib/scouting.functions";

import { GROUPES_POSTES as POSTES } from "@/config/referentiels";

export function AiScouting({ joueurs }: { joueurs: Player[] }) {
  const analyser = useServerFn(analyserProfils);
  const [poste, setPoste] = useState("Attaquant");
  const [criteres, setCriteres] = useState("");
  const [choisis, setChoisis] = useState<string[]>(() => joueurs.map((p) => p.id));
  const [chargement, setChargement] = useState(false);
  const [resultat, setResultat] = useState("");

  const toggle = (id: string) =>
    setChoisis((l) => (l.includes(id) ? l.filter((x) => x !== id) : [...l, id]));

  const lancer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (criteres.trim().length < 3) { toast.error("Décrivez vos critères (3 caractères minimum)."); return; }
    if (choisis.length === 0) { toast.error("Sélectionnez au moins un profil."); return; }
    const sel = joueurs.filter((p) => choisis.includes(p.id)).slice(0, 40);
    setChargement(true);
    setResultat("");
    const id = toast.loading("Analyse des profils en cours…");
    try {
      const r = await analyser({
        data: {
          poste,
          criteres: criteres.slice(0, 1500),
          joueurs: sel.map((p) => ({
            id: p.id, nom: p.nom, poste: `${p.poste} (${p.posteDetail})`, categorie: p.categorie, pied: p.pied,
            commune: p.commune, statut: p.statut, ...p.stats,
          })),
        },
      });
      if (r.ok) {
        setResultat(r.texte);
        toast.success("Analyse terminée.", { id });
      } else toast.error(r.message, { id });
    } catch {
      toast.error("Requête invalide ou service indisponible.", { id });
    } finally {
      setChargement(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={lancer} className="glass space-y-4 rounded-2xl p-5">
        <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
          <label className="block text-sm">Poste recherché
            <select value={poste} onChange={(e) => setPoste(e.target.value)} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none">
              {POSTES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label className="block text-sm">Critères de détection
            <textarea value={criteres} maxLength={1500} onChange={(e) => setCriteres(e.target.value)} rows={3} placeholder="Ex. finisseur efficace, pied gauche, régulier, peu de cartons…" className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none" />
          </label>
        </div>
        <fieldset>
          <legend className="text-sm font-semibold">Profils à analyser ({choisis.length})</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {joueurs.map((p) => (
              <label key={p.id} className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs focus-within:ring-2 focus-within:ring-ring ${choisis.includes(p.id) ? "border-primary bg-primary/10" : "border-border bg-surface"}`}>
                <input type="checkbox" className="sr-only" checked={choisis.includes(p.id)} onChange={() => toggle(p.id)} />
                {p.nom} · {p.poste}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" disabled={chargement} className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {chargement ? "Analyse en cours…" : "Identifier les meilleurs profils"}
        </button>
      </form>
      {resultat && (
        <div className="glass rounded-2xl p-5">
          <h3 className="mb-3 font-semibold">Recommandations</h3>
          {/* Rendered as plain text: no HTML injection possible */}
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{resultat}</div>
          <p className="mt-4 text-xs text-muted-foreground">Analyse générée automatiquement à partir des statistiques fournies — à confirmer par l'observation terrain.</p>
        </div>
      )}
    </div>
  );
}
