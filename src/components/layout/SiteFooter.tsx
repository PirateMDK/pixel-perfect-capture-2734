import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/fbn/Logo";

const liens = [
  { to: "/equipes", label: "Équipes" },
  { to: "/joueurs", label: "Joueurs" },
  { to: "/tournois", label: "Tournois" },
  { to: "/matchs", label: "Matchs" },
  { to: "/statistiques", label: "Statistiques" },
  { to: "/actualites", label: "Actualités" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Le réseau numérique du football local béninois. Les données affichées sont fictives et
            servent uniquement à la démonstration.
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm tracking-wider uppercase text-muted-foreground">
            Explorer
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {liens.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="focus-ring rounded hover:text-primary">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm tracking-wider uppercase text-muted-foreground">
            Plateforme
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/talents" className="focus-ring rounded hover:text-primary">
                Talents
              </Link>
            </li>
            <li>
              <Link to="/inscription" className="focus-ring rounded hover:text-primary">
                Inscrire mon équipe
              </Link>
            </li>
            <li>
              <Link to="/connexion" className="focus-ring rounded hover:text-primary">
                Connexion
              </Link>
            </li>
            <li>
              <Link to="/recherche" search={{ q: "" }} className="focus-ring rounded hover:text-primary">
                Recherche
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm tracking-wider uppercase text-muted-foreground">
            Suivre
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>Facebook</li>
            <li>Instagram</li>
            <li>TikTok</li>
            <li>YouTube</li>
          </ul>
        </div>
      </div>
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3 border-t border-border px-4 py-6 text-xs text-muted-foreground sm:px-6">
        <span>© 2025 Foot Bénin Network — données de démonstration</span>
        <span>Conditions · Confidentialité · Contact</span>
      </div>
    </footer>
  );
}
