/**
 * Classy AdSense placeholder slot. Replace inner content with real
 * <ins class="adsbygoogle"> tags once AdSense is approved.
 */
export function AdSlot({
  label = "Sponsored",
  className = "",
  height = "h-28",
}: {
  label?: string;
  className?: string;
  height?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 text-center">
        {label}
      </div>
      <div
        className={`${height} rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm grid place-items-center text-xs text-muted-foreground/70`}
      >
        Ad space — designed to be classy & non-intrusive
      </div>
    </div>
  );
}
