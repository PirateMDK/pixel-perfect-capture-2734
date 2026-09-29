import type { ReactNode } from "react";

export function FilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="glass grid gap-3 rounded-2xl p-4 sm:grid-cols-2 lg:grid-cols-5">{children}</div>
  );
}

export function SelectFilter({
  label,
  value,
  onChange,
  options,
  tous = "Tous",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[];
  tous?: string;
}) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm text-foreground outline-none"
      >
        <option value="">{tous}</option>
        {options.map((o) =>
          typeof o === "string" ? (
            <option key={o} value={o}>
              {o}
            </option>
          ) : (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ),
        )}
      </select>
    </label>
  );
}

export function SearchFilter({
  label = "Recherche",
  value,
  onChange,
  placeholder,
}: {
  label?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="text-xs text-muted-foreground">
      {label}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="focus-ring mt-1 w-full rounded-xl bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

export function Tabs({
  onglets,
  actif,
  onChange,
}: {
  onglets: string[];
  actif: string;
  onChange: (o: string) => void;
}) {
  return (
    <div role="tablist" className="flex gap-2 overflow-x-auto pb-1">
      {onglets.map((o) => (
        <button
          key={o}
          role="tab"
          type="button"
          aria-selected={o === actif}
          onClick={() => onChange(o)}
          className={
            o === actif
              ? "focus-ring shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              : "focus-ring shrink-0 rounded-full glass px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          }
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function Pagination({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (p: number) => void;
}) {
  if (total <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-current={i + 1 === page ? "page" : undefined}
          onClick={() => onChange(i + 1)}
          className={
            i + 1 === page
              ? "focus-ring size-10 rounded-full bg-primary text-sm font-semibold text-primary-foreground"
              : "focus-ring size-10 rounded-full glass text-sm"
          }
        >
          {i + 1}
        </button>
      ))}
    </nav>
  );
}
