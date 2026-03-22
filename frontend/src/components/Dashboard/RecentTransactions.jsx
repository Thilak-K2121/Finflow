import { Link } from 'react-router-dom';

const ICONS = {
  'Food & Dining': '🍽️', 'Transportation': '🚗', 'Housing': '🏠',
  'Healthcare': '💊', 'Entertainment': '🎬', 'Shopping': '🛍️',
  'Utilities': '⚡', 'Education': '📚', 'Travel': '✈️',
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈',
  'Gift': '🎁', 'Refund': '↩️',
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const RowSkeleton = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', animation: 'pulse 1.5s ease-in-out infinite' }}>
    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f1f5f9', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: '14px', width: '35%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '6px' }} />
      <div style={{ height: '11px', width: '22%', background: '#f8fafc', borderRadius: '4px' }} />
    </div>
    <div style={{ height: '14px', width: '80px', background: '#f1f5f9', borderRadius: '4px' }} />
  </div>
);

export default function RecentTransactions({ transactions, loading }) {
  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', margin: 0 }}>Recent Transactions</p>
        <Link to="/transactions" style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 500, textDecoration: 'none' }}>
          View all →
        </Link>
      </div>

      {loading ? (
        <div>{[1,2,3,4,5].map(i => <RowSkeleton key={i} />)}</div>
      ) : !transactions?.length ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
          <p style={{ fontWeight: 500, color: '#64748b', marginBottom: '4px' }}>No transactions yet</p>
          <p style={{ fontSize: '13px', margin: 0 }}>Add your first transaction to get started</p>
        </div>
      ) : (
        <div>
          {transactions.map((tx, idx) => (
            <div
              key={tx._id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 8px', borderRadius: '10px',
                borderTop: idx > 0 ? '1px solid #f8fafc' : 'none',
                transition: 'background 0.15s ease', cursor: 'default',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: '#f8fafc', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '17px', flexShrink: 0,
              }}>
                {ICONS[tx.category] || (tx.type === 'income' ? '💰' : '💸')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.title}
                </p>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                  {tx.category} · {fmtDate(tx.date)}
                </p>
              </div>
              <span style={{
                fontSize: '14px', fontWeight: 600, flexShrink: 0, fontVariantNumeric: 'tabular-nums',
                color: tx.type === 'income' ? '#059669' : '#e11d48',
              }}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
