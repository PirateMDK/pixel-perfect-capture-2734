import { useState, type ReactNode } from "react";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MOTIFS_SIGNALEMENT } from "@/config/referentiels";
import { actions } from "@/lib/mock-store";

export const champ = "focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2.5 text-sm text-foreground outline-none";

/** Bouton « Signaler » + formulaire (motif, commentaire, confirmation). */
export function ReportButton({ cible, typeCible }: { cible: string; typeCible: string }) {
  const [open, setOpen] = useState(false);
  const [motif, setMotif] = useState("");
  const [commentaire, setCommentaire] = useState("");
  const [confirme, setConfirme] = useState(false);
  const envoyer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!motif) return void toast.error("Choisissez un motif.");
    if (!confirme) return void toast.error("Confirmez votre signalement.");
    actions.signaler({ cible, typeCible, motif, commentaire: commentaire.trim().slice(0, 500) || undefined });
    toast.success("Signalement transmis à la modération (démonstration).");
    setOpen(false); setMotif(""); setCommentaire(""); setConfirme(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="focus-ring inline-flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm hover:bg-surface-strong">
        <Flag className="size-4" aria-hidden /> Signaler
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signaler « {cible} »</DialogTitle>
          <DialogDescription>Votre signalement sera examiné par l'équipe de modération.</DialogDescription>
        </DialogHeader>
        <form onSubmit={envoyer} className="space-y-4">
          <label className="block text-sm">Motif
            <select value={motif} onChange={(e) => setMotif(e.target.value)} className={champ}>
              <option value="">Choisir…</option>
              {MOTIFS_SIGNALEMENT.map((m) => <option key={m}>{m}</option>)}
            </select>
          </label>
          <label className="block text-sm">Commentaire (facultatif)
            <textarea value={commentaire} maxLength={500} onChange={(e) => setCommentaire(e.target.value)} rows={3} className={champ} />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={confirme} onChange={(e) => setConfirme(e.target.checked)} className="mt-1" />
            Je confirme que ce signalement est sincère.
          </label>
          <button type="submit" className="focus-ring rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground">Envoyer le signalement</button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Le recruteur contacte l'ÉQUIPE (jamais le joueur directement). */
export function ContactTeamButton({ playerId, joueur, teamId, equipe }: { playerId: string; joueur: string; teamId: string; equipe: string }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const envoyer = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = message.trim();
    if (m.length < 10) return void toast.error("Votre message doit contenir au moins 10 caractères.");
    setEnvoi(true);
    await new Promise((r) => setTimeout(r, 400));
    actions.envoyerContact({ recruteur: "Scout · Académie partenaire", playerId, joueur, teamId, equipe, message: m.slice(0, 1000) });
    setEnvoi(false); setOpen(false); setMessage("");
    toast.success(`Demande envoyée à ${equipe}. Statut : en attente (démonstration).`);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="focus-ring rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Contacter l'équipe</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Contacter {equipe}</DialogTitle>
          <DialogDescription>Votre demande au sujet de {joueur} est transmise au responsable de l'équipe. Les coordonnées personnelles du joueur ne sont jamais communiquées.</DialogDescription>
        </DialogHeader>
        <form onSubmit={envoyer} className="space-y-4">
          <label className="block text-sm">Message
            <textarea value={message} maxLength={1000} onChange={(e) => setMessage(e.target.value)} rows={4} className={champ} placeholder="Présentez-vous et précisez l'objet de votre demande…" />
          </label>
          <button type="submit" disabled={envoi} className="focus-ring rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            {envoi ? "Envoi…" : "Envoyer la demande"}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** Modale générique pour les formulaires CRUD. */
export function FormDialog({ titre, open, onOpenChange, children }: { titre: string; open: boolean; onOpenChange: (o: boolean) => void; children: ReactNode }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader><DialogTitle>{titre}</DialogTitle><DialogDescription>Démonstration : les modifications ne sont pas enregistrées sur un serveur.</DialogDescription></DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
