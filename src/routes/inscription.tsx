import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/inscription")({
  head: () => ({
    meta: [
      { title: "Créer un compte — Foot Bénin Network" },
      { name: "description", content: "Inscrivez votre équipe, vos tournois ou votre profil sur FBN." },
      { property: "og:title", content: "Créer un compte — FBN" },
      { property: "og:description", content: "Rejoignez le réseau du football local béninois." },
    ],
  }),
  component: InscriptionPage,
});

const ROLES = [
  { id: "equipe", label: "Responsable d'équipe", desc: "Gérer l'effectif, les matchs et la visibilité du club." },
  { id: "organisateur", label: "Organisateur", desc: "Créer des tournois, saisir résultats et classements." },
  { id: "recruteur", label: "Recruteur", desc: "Rechercher et suivre des profils sportifs." },
  { id: "joueur", label: "Joueur", desc: "Suivre ses statistiques et son historique." },
  { id: "media", label: "Média", desc: "Publier actualités, photos et vidéos." },
];

function InscriptionPage() {
  const [role, setRole] = useState("");
  const [nom, setNom] = useState("");
  const [contact, setContact] = useState("");
  const [erreur, setErreur] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const fail = (m: string) => { setErreur(m); toast.error(m); };
    if (!ROLES.some((r) => r.id === role)) return fail("Choisissez votre profil.");
    const n = nom.trim(), c = contact.trim();
    if (n.length < 2 || n.length > 100) return fail("Renseignez un nom valide (2 à 100 caractères).");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c) && !/^\+?[0-9 ]{8,15}$/.test(c)) return fail("Email ou téléphone invalide.");
    setErreur("");
    toast.success("Compte créé (démonstration) — la validation sera branchée plus tard.");
  };
  return (
    <PublicLayout>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <form onSubmit={submit} className="glass space-y-5 rounded-2xl p-6" noValidate>
          <h1 className="display-title text-3xl">Créer un compte</h1>
          <fieldset>
            <legend className="text-sm font-semibold">Je suis :</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <label key={r.id} className={`focus-within:ring-2 focus-within:ring-ring cursor-pointer rounded-xl border p-4 ${role === r.id ? "border-primary bg-primary/10" : "border-border bg-surface"}`}>
                  <input type="radio" name="role" value={r.id} checked={role === r.id} onChange={() => setRole(r.id)} className="sr-only" />
                  <span className="block font-semibold">{r.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{r.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm">Nom complet
            <input value={nom} onChange={(e) => setNom(e.target.value)} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none" />
          </label>
          <label className="block text-sm">Email ou téléphone
            <input value={contact} onChange={(e) => setContact(e.target.value)} className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none" />
          </label>
          <label className="block text-sm">Mot de passe
            <input type="password" autoComplete="new-password" className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none" />
          </label>
          {erreur && <p role="alert" className="text-sm text-destructive">{erreur}</p>}
          <button type="submit" className="focus-ring w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">Créer mon compte</button>
          <p className="text-center text-sm text-muted-foreground">Déjà inscrit ? <Link to="/connexion" className="focus-ring rounded text-primary">Connexion</Link></p>
        </form>
      </div>
    </PublicLayout>
  );
}
