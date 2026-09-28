import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";
import { Logo } from "@/components/fbn/Logo";

const nav = [
  { to: "/", label: "Accueil" },
  { to: "/equipes", label: "Équipes" },
  { to: "/joueurs", label: "Joueurs" },
  { to: "/tournois", label: "Tournois" },
  { to: "/matchs", label: "Matchs" },
  { to: "/statistiques", label: "Statistiques" },
  { to: "/talents", label: "Talents" },
  { to: "/actualites", label: "Actualités" },
] as const;

export function SiteHeader() {
  const [ouvert, setOuvert] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const lancerRecherche = (e: React.FormEvent) => {
    e.preventDefault();
    setOuvert(false);
    navigate({ to: "/recherche", search: { q } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Logo />
        <nav aria-label="Navigation principale" className="ml-4 hidden items-center gap-5 xl:flex">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{ className: "text-primary" }}
              className="focus-ring rounded text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/recherche"
            search={{ q: "" }}
            aria-label="Rechercher"
            className="focus-ring grid size-10 place-items-center rounded-full glass text-muted-foreground transition-colors hover:text-foreground"
          >
            <Search className="size-4" aria-hidden="true" />
          </Link>
          <Link
            to="/connexion"
            className="focus-ring hidden rounded-full glass px-4 py-2 text-sm font-semibold transition-colors hover:bg-surface-strong sm:inline-flex"
          >
            Connexion
          </Link>
          <Link
            to="/inscription"
            className="focus-ring hidden rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            Créer un compte
          </Link>
          <button
            type="button"
            onClick={() => setOuvert((v) => !v)}
            aria-expanded={ouvert}
            aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
            className="focus-ring grid size-10 place-items-center rounded-full glass xl:hidden"
          >
            {ouvert ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {ouvert && (
        <div className="border-t border-border bg-background/95 px-4 pb-5 sm:px-6 xl:hidden">
          <form onSubmit={lancerRecherche} className="pt-4">
            <label htmlFor="recherche-mobile" className="sr-only">
              Rechercher une équipe, un joueur ou un tournoi
            </label>
            <div className="flex gap-2 rounded-full glass p-1.5">
              <input
                id="recherche-mobile"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Équipe, joueur, tournoi…"
                className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                OK
              </button>
            </div>
          </form>
          <nav aria-label="Navigation mobile" className="mt-4 grid grid-cols-2 gap-2">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOuvert(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-primary" }}
                className="focus-ring rounded-xl glass px-4 py-3 text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              to="/connexion"
              onClick={() => setOuvert(false)}
              className="focus-ring rounded-full glass px-4 py-3 text-center text-sm font-semibold"
            >
              Connexion
            </Link>
            <Link
              to="/inscription"
              onClick={() => setOuvert(false)}
              className="focus-ring rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
