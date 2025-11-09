type StatCardProps = {
  label: string;
  value: string | number;
  helper?: string;
};

export const StatCard = ({ label, value, helper }: StatCardProps) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{label}</span>
    <strong style={{ fontSize: '2rem' }}>{value}</strong>
    {helper ? <small style={{ color: '#94a3b8' }}>{helper}</small> : null}
  </div>
);
