export function YearBars({
  years,
}: {
  years: { year: number; count: number }[];
}) {
  const maxYear = Math.max(1, ...years.map((y) => y.count));
  return (
    <div className="flex items-end gap-1 overflow-x-auto rounded-2xl bg-card px-3 pb-3 pt-5 shadow-[var(--shadow-border)] sm:gap-2 sm:px-4 sm:pb-5">
      {years.map((row) => (
        <div key={row.year} className="flex min-w-7 flex-1 flex-col items-center gap-2 sm:min-w-0">
          <p className="text-xs tabular-nums text-muted-foreground">{row.count}</p>
          <div className="flex h-28 w-full items-end justify-center">
            <div
              className="w-full max-w-10 rounded-t-md bg-primary"
              style={{ height: `${Math.max(8, (row.count / maxYear) * 100)}%` }}
            />
          </div>
          <p className="h-11 text-[10px] tabular-nums leading-none text-subtle [writing-mode:vertical-rl] rotate-180 sm:h-auto sm:rotate-0 sm:text-[11px] sm:[writing-mode:horizontal-tb]">
            {row.year}
          </p>
        </div>
      ))}
    </div>
  );
}
