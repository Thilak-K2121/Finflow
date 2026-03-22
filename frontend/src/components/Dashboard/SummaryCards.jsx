const fmt = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);

const Skeleton = () => (
  <div style={{ height: '28px', width: '140px', background: '#f1f5f9', borderRadius: '8px', animation: 'pulse 1.5s ease-in-out infinite' }} />
);

const cards = [
  {
    key: 'balance',
    label: 'Total Balance',
    iconBg: '#eef2ff',
    iconColor: '#4f46e5',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
  {
    key: 'income',
    label: 'Total Income',
    iconBg: '#ecfdf5',
    iconColor: '#059669',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
      </svg>
    ),
  },
  {
    key: 'expense',
    label: 'Total Expenses',
    iconBg: '#fff1f2',
    iconColor: '#e11d48',
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.286 4.286a11.948 11.948 0 004.306-6.43l.776-2.898m0 0l3.182 5.511m-3.182-5.51l-5.511 3.181" />
      </svg>
    ),
  },
];

const valueColor = (key, val) => {
  if (key === 'balance') return val >= 0 ? '#059669' : '#e11d48';
  if (key === 'income') return '#059669';
  return '#e11d48';
};

export default function SummaryCards({ summary, loading }) {
  const vals = {
    balance: summary?.totals?.balance ?? 0,
    income: summary?.totals?.income ?? 0,
    expense: summary?.totals?.expense ?? 0,
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
      {cards.map((card) => (
        <div key={card.key} className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: card.iconBg, color: card.iconColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {card.icon}
            </div>
            {card.key === 'balance' && !loading && (
              <span style={{
                fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '999px',
                background: vals.balance >= 0 ? '#ecfdf5' : '#fff1f2',
                color: vals.balance >= 0 ? '#059669' : '#e11d48',
              }}>
                {vals.balance >= 0 ? '↑ Positive' : '↓ Negative'}
              </span>
            )}
          </div>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: '0 0 6px', fontWeight: 500 }}>{card.label}</p>
          {loading
            ? <Skeleton />
            : <p style={{ fontSize: '26px', fontWeight: 700, margin: 0, color: valueColor(card.key, vals[card.key]), letterSpacing: '-0.5px' }}>
                {fmt(vals[card.key])}
              </p>
          }
        </div>
      ))}
    </div>
  );
}
