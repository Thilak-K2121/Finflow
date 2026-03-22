import { useState } from 'react';
import api from '../../api/axios';
import TransactionModal from './TransactionModal';

const ICONS = {
  'Food & Dining': '🍽️', 'Transportation': '🚗', 'Housing': '🏠',
  'Healthcare': '💊', 'Entertainment': '🎬', 'Shopping': '🛍️',
  'Utilities': '⚡', 'Education': '📚', 'Travel': '✈️',
  'Salary': '💼', 'Freelance': '💻', 'Investment': '📈',
  'Gift': '🎁', 'Refund': '↩️',
};

const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

const RowSkeleton = () => (
  <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', animation: 'pulse 1.5s ease-in-out infinite' }}>
    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f1f5f9', flexShrink: 0 }} />
    <div style={{ flex: 1 }}>
      <div style={{ height: '14px', width: '30%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '8px' }} />
      <div style={{ height: '11px', width: '20%', background: '#f8fafc', borderRadius: '4px' }} />
    </div>
    <div style={{ height: '14px', width: '90px', background: '#f1f5f9', borderRadius: '4px' }} />
  </div>
);

export default function TransactionList({ transactions, loading, onRefresh }) {
  const [editTx, setEditTx] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/transactions/${id}`);
      onRefresh();
    } catch {
      alert('Failed to delete. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        {[1,2,3,4,5,6].map(i => <RowSkeleton key={i} />)}
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="card" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ width: '52px', height: '52px', background: '#f8fafc', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
        </div>
        <p style={{ fontWeight: 600, color: '#475569', marginBottom: '6px' }}>No transactions found</p>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Try adjusting your filters or add a new transaction</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {transactions.map((tx) => (
          <div
            key={tx._id}
            className="card"
            style={{
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
              transition: 'all 0.15s ease', cursor: 'default',
              background: hoveredId === tx._id ? '#fafbff' : 'white',
            }}
            onMouseEnter={() => setHoveredId(tx._id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* Icon */}
            <div style={{
              width: '40px', height: '40px', borderRadius: '10px',
              background: '#f8fafc', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '18px', flexShrink: 0,
            }}>
              {ICONS[tx.category] || (tx.type === 'income' ? '💰' : '💸')}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                <p style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {tx.title}
                </p>
                <span style={{
                  fontSize: '11px', fontWeight: 600, padding: '2px 7px', borderRadius: '999px', flexShrink: 0,
                  background: tx.type === 'income' ? '#ecfdf5' : '#fff1f2',
                  color: tx.type === 'income' ? '#059669' : '#e11d48',
                }}>
                  {tx.type}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                {tx.category} · {fmtDate(tx.date)}
                {tx.notes ? ` · ${tx.notes.length > 30 ? tx.notes.slice(0, 30) + '…' : tx.notes}` : ''}
              </p>
            </div>

            {/* Amount + Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
              <span style={{
                fontSize: '15px', fontWeight: 700, fontVariantNumeric: 'tabular-nums',
                color: tx.type === 'income' ? '#059669' : '#e11d48',
              }}>
                {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
              </span>

              {/* Action buttons — show on hover */}
              <div style={{
                display: 'flex', gap: '4px',
                opacity: hoveredId === tx._id ? 1 : 0,
                transition: 'opacity 0.15s ease',
              }}>
                <button
                  onClick={() => setEditTx(tx)}
                  style={{
                    width: '28px', height: '28px', border: 'none', borderRadius: '7px',
                    background: '#f0f4ff', color: '#4f46e5', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  title="Edit"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(tx._id)}
                  disabled={deletingId === tx._id}
                  style={{
                    width: '28px', height: '28px', border: 'none', borderRadius: '7px',
                    background: '#fff1f2', color: '#e11d48', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s', opacity: deletingId === tx._id ? 0.5 : 1,
                  }}
                  title="Delete"
                >
                  <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TransactionModal
        isOpen={!!editTx}
        transaction={editTx}
        onClose={() => setEditTx(null)}
        onSuccess={onRefresh}
      />
    </>
  );
}
