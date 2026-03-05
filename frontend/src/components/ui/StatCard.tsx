type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export const StatCard = ({ label, value, helper }: StatCardProps) => (
  <div className="flex flex-col gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
    <span className="text-xs font-medium text-white/40">{label}</span>
    <strong className="text-2xl font-bold tracking-tight text-white">{value}</strong>
    {helper ? <small className="text-[11px] text-white/30">{helper}</small> : null}
  </div>
);
