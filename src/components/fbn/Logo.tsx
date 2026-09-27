import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Wordmark FBN provisoire, volontairement minimaliste et remplaçable. */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      to="/"
      aria-label="Foot Bénin Network — accueil"
      className={cn("flex items-center gap-3 focus-ring rounded-xl", className)}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary font-display text-lg text-primary-foreground">
        FBN
      </span>
      {!compact && (
        <span className="hidden font-display text-base tracking-wide uppercase sm:block">
          Foot Bénin Network
        </span>
      )}
    </Link>
  );
}
