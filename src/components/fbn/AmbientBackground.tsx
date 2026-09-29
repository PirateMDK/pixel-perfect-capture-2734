/** Décor de fond : halos colorés + panneaux de verre en lente dérive. */
export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-24 -left-24 size-[620px] rounded-full bg-primary/25 blur-[130px]" />
      <div className="absolute top-1/3 -right-24 size-[560px] rounded-full bg-accent/10 blur-[130px]" />
      <div className="absolute -top-20 -left-10 hidden h-[760px] w-[460px] -skew-x-[18deg] glass drift md:block" />
      <div className="absolute -top-10 -right-16 hidden h-[720px] w-[380px] -skew-x-[12deg] glass drift-2 md:block" />
    </div>
  );
}
