import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionModal from '../components/Transactions/TransactionModal';

const CATEGORIES = [
  'All Categories', 'Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other Income',
  'Food & Dining', 'Transportation', 'Housing', 'Healthcare', 'Entertainment',
  'Shopping', 'Utilities', 'Education', 'Travel', 'Other Expense',
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [filters, setFilters] = useState({ type: '', category: 'All Categories', page: 1 });

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 15,
        sortBy: 'date',
        sortOrder: 'desc',
        ...(filters.type && { type: filters.type }),
        ...(filters.category !== 'All Categories' && { category: filters.category }),
      });
      const { data } = await api.get(`/transactions?${params}`);
      setTransactions(data.data.transactions);
      setPagination(data.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const filterBtnStyle = (active, color) => ({
    padding: '6px 14px', borderRadius: '8px', border: 'none',
    fontFamily: 'inherit', fontSize: '13px', fontWeight: 600,
    cursor: 'pointer', transition: 'all 0.15s',
    background: active
      ? color === 'green' ? '#ecfdf5' : color === 'red' ? '#fff1f2' : '#eef2ff'
      : '#f1f5f9',
    color: active
      ? color === 'green' ? '#059669' : color === 'red' ? '#e11d48' : '#4338ca'
      : '#64748b',
  });

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            Transactions
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {pagination.total != null ? `${pagination.total} total transactions` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 16px', marginBottom: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button style={filterBtnStyle(filters.type === '', 'brand')} onClick={() => setFilters(f => ({ ...f, type: '', page: 1 }))}>
            All
          </button>
          <button style={filterBtnStyle(filters.type === 'income', 'green')} onClick={() => setFilters(f => ({ ...f, type: 'income', page: 1 }))}>
            ↑ Income
          </button>
          <button style={filterBtnStyle(filters.type === 'expense', 'red')} onClick={() => setFilters(f => ({ ...f, type: 'expense', page: 1 }))}>
            ↓ Expense
          </button>
        </div>
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
          className="input-field"
          style={{ width: 'auto', fontSize: '13px', padding: '6px 10px' }}
        >
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* List */}
      <TransactionList
        transactions={transactions}
        loading={loading}
        onRefresh={fetchTransactions}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
            className="btn-secondary"
            style={{ padding: '7px 16px', fontSize: '13px' }}
          >
            ← Prev
          </button>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Page {filters.page} of {pagination.pages}
          </span>
          <button
            disabled={filters.page >= pagination.pages}
            onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
            className="btn-secondary"
            style={{ padding: '7px 16px', fontSize: '13px' }}
          >
            Next →
          </button>
        </div>
      )}

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </div>
  );
}
