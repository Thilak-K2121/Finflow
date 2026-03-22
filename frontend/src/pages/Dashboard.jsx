import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import SummaryCards from '../components/Dashboard/SummaryCards';
import ExpensePieChart from '../components/Dashboard/ExpensePieChart';
import MonthlyBarChart from '../components/Dashboard/MonthlyBarChart';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import TransactionModal from '../components/Transactions/TransactionModal';

const greet = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryRes, txRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions?limit=8&sortBy=date&sortOrder=desc'),
      ]);
      setSummary(summaryRes.data.data);
      setTransactions(txRes.data.data.transactions);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div style={{ padding: '32px', maxWidth: '1100px', margin: '0 auto' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
            {greet()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Here's your financial overview
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

      {/* Summary Cards */}
      <SummaryCards summary={summary} loading={loading} />

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '16px', marginTop: '16px' }}>
        <MonthlyBarChart monthly={summary?.monthly} loading={loading} />
        <ExpensePieChart categoryBreakdown={summary?.categoryBreakdown} loading={loading} />
      </div>

      {/* Recent Transactions */}
      <div style={{ marginTop: '16px' }}>
        <RecentTransactions transactions={transactions} loading={loading} />
      </div>

      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
