type SpinnerProps = {
  label?: string;
  size?: number;
};

export const Spinner = ({ label, size = 28 }: SpinnerProps) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '3px solid #e2e8f0',
        borderTopColor: '#6366f1',
        animation: 'spin 1s linear infinite',
      }}
    />
    {label ? <small style={{ color: '#475569' }}>{label}</small> : null}
  </div>
);
