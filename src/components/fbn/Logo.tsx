import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import logoMark from "@/assets/fbn-logo.png.asset.json";
import logoComplet from "@/assets/fbn-logo-complet.png.asset.json";

/** Logo officiel FBN. `complet` = version avec baseline (footer). */
export function Logo({
  compact = false,
  complet = false,
  className,
}: {
  compact?: boolean;
  complet?: boolean;
  className?: string;
}) {
  if (complet) {
    return (
      <Link to="/" aria-label="Foot Bénin Network — accueil" className={cn("focus-ring inline-block rounded-xl", className)}>
        <img src={logoComplet.url} alt="Foot Bénin Network — Le réseau numérique du football local béninois" className="h-24 w-auto" loading="lazy" />
      </Link>
    );
  }
  return (
    <Link
      to="/"
      aria-label="Foot Bénin Network — accueil"
      className={cn("focus-ring flex items-center gap-3 rounded-xl", className)}
    >
      <img src={logoMark.url} alt="FBN" className="h-8 w-auto" />
      {!compact && (
        <span className="hidden font-display text-sm tracking-wide uppercase sm:block">
          Foot Bénin <span className="text-accent">Network</span>
        </span>
      )}
    </Link>
  );
}
