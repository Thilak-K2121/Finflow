export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = { sm: '16px', md: '24px', lg: '32px' };
  const s = sizes[size];
  return (
    <div
      className={className}
      style={{
        width: s, height: s, flexShrink: 0,
        border: '2px solid #e0e7ff',
        borderTopColor: '#4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  );
}
