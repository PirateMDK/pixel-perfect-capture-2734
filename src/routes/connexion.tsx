import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Foot Bénin Network" },
      { name: "description", content: "Connectez-vous à votre espace FBN." },
      { property: "og:title", content: "Connexion — FBN" },
      { property: "og:description", content: "Accès aux espaces équipe, organisateur, recruteur." },
    ],
  }),
  component: ConnexionPage,
});

function ConnexionPage() {
  const [id, setId] = useState("");
  const [mdp, setMdp] = useState("");
  const [erreur, setErreur] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const ident = id.trim();
    const valide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ident) || /^\+?[0-9 ]{8,15}$/.test(ident);
    if (!valide || mdp.length < 8 || mdp.length > 128) {
      const msg = "Email ou téléphone valide et mot de passe de 8 caractères minimum requis.";
      setErreur(msg);
      toast.error(msg);
      return;
    }
    setErreur("");
    toast.success("Connexion simulée — l'authentification réelle sera branchée plus tard.");
  };
  return (
    <PublicLayout>
      <div className="mx-auto max-w-md px-4 py-16">
        <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6" noValidate>
          <h1 className="display-title text-3xl">Connexion</h1>
          <label className="block text-sm">Email ou téléphone
            <input value={id} onChange={(e) => setId(e.target.value)} autoComplete="username" className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none" />
          </label>
          <label className="block text-sm">Mot de passe
            <input type="password" value={mdp} onChange={(e) => setMdp(e.target.value)} autoComplete="current-password" className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-3 outline-none" />
          </label>
          {erreur && <p role="alert" className="text-sm text-destructive">{erreur}</p>}
          <button type="submit" className="focus-ring w-full rounded-full bg-primary py-3 font-semibold text-primary-foreground">Se connecter</button>
          <div className="flex justify-between text-sm">
            <button type="button" onClick={() => toast("Un lien de réinitialisation sera envoyé (démonstration).")} className="focus-ring rounded text-muted-foreground hover:text-foreground">Mot de passe oublié ?</button>
            <Link to="/inscription" className="focus-ring rounded text-primary">Créer un compte</Link>
          </div>
        </form>
        <div className="glass mt-4 rounded-2xl p-4 text-sm">
          <p className="text-muted-foreground">Aperçu des espaces (démonstration) :</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Link to="/espace-equipe" className="focus-ring rounded-full bg-surface px-3 py-1.5 hover:bg-surface-strong">Équipe</Link>
            <Link to="/espace-organisateur" className="focus-ring rounded-full bg-surface px-3 py-1.5 hover:bg-surface-strong">Organisateur</Link>
            <Link to="/espace-recruteur" className="focus-ring rounded-full bg-surface px-3 py-1.5 hover:bg-surface-strong">Recruteur</Link>
            <Link to="/espace-media" className="focus-ring rounded-full bg-surface px-3 py-1.5 hover:bg-surface-strong">Média</Link>
            <Link to="/admin" className="focus-ring rounded-full bg-surface px-3 py-1.5 hover:bg-surface-strong">Administration</Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
