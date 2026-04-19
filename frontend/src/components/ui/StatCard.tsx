type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export const StatCard = ({ label, value, helper }: StatCardProps) => (
  <div className="flex flex-col gap-1 rounded-2xl bg-surface p-5 shadow-sm transition-all duration-normal hover:shadow-md">
    <span className="text-xs font-medium tracking-wide text-fg-muted uppercase">{label}</span>
    <strong className="text-3xl font-semibold tracking-tight text-fg">{value}</strong>
    {helper ? <small className="text-xs text-fg-muted">{helper}</small> : null}
  </div>
);
