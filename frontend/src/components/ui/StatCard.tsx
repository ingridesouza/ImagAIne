type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export const StatCard = ({ label, value, helper }: StatCardProps) => (
  <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-border-strong">
    <span className="text-xs font-medium text-fg-sec">{label}</span>
    <strong className="text-3xl font-bold tracking-tight text-fg">{value}</strong>
    {helper ? <small className="text-xs text-fg-muted">{helper}</small> : null}
  </div>
);
