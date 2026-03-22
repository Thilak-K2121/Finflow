import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../UI/LoadingSpinner';

const CATEGORIES = {
  income: ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other Income'],
  expense: ['Food & Dining', 'Transportation', 'Housing', 'Healthcare', 'Entertainment', 'Shopping', 'Utilities', 'Education', 'Travel', 'Other Expense'],
};

const todayStr = () => new Date().toISOString().split('T')[0];
const defaultForm = { title: '', amount: '', type: 'expense', category: 'Food & Dining', date: todayStr(), notes: '' };

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
    {children}
  </label>
);

export default function TransactionModal({ isOpen, onClose, onSuccess, transaction }) {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEditing = !!transaction;

  useEffect(() => {
    if (!isOpen) return;
    if (transaction) {
      setForm({
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date?.split('T')[0] || todayStr(),
        notes: transaction.notes || '',
      });
    } else {
      setForm(defaultForm);
    }
    setError('');
  }, [transaction, isOpen]);

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleTypeChange = (type) => {
    setForm(f => ({ ...f, type, category: CATEGORIES[type][0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isEditing) {
        await api.put(`/transactions/${transaction._id}`, form);
      } else {
        await api.post('/transactions', form);
      }
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'relative', background: 'white', borderRadius: '20px',
        width: '100%', maxWidth: '440px',
        boxShadow: '0 20px 60px rgb(0 0 0 / 0.15)',
        animation: 'slideUp 0.2s ease-out',
      }}>
        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9' }}>
          <h2 style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a', margin: 0 }}>
            {isEditing ? 'Edit Transaction' : 'New Transaction'}
          </h2>
          <button
            onClick={onClose}
            style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', background: '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          {error && (
            <div style={{ background: '#fff1f2', color: '#be123c', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', border: '1px solid #ffe4e6' }}>
              {error}
            </div>
          )}

          {/* Type toggle */}
          <div style={{ marginBottom: '16px' }}>
            <Label>Type</Label>
            <div style={{ display: 'flex', gap: '8px', padding: '4px', background: '#f8fafc', borderRadius: '12px' }}>
              {['income', 'expense'].map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s ease',
                    background: form.type === t ? 'white' : 'transparent',
                    color: form.type === t ? (t === 'income' ? '#059669' : '#e11d48') : '#64748b',
                    boxShadow: form.type === t ? '0 1px 3px rgb(0 0 0 / 0.08)' : 'none',
                  }}
                >
                  {t === 'income' ? '↑ Income' : '↓ Expense'}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginBottom: '16px' }}>
            <Label>Title</Label>
            <input
              type="text" required placeholder="e.g. Grocery shopping, Monthly salary"
              value={form.title} onChange={set('title')}
              className="input-field"
            />
          </div>

          {/* Amount + Category row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <Label>Amount (₹)</Label>
              <input
                type="number" required min="0.01" step="0.01" placeholder="0.00"
                value={form.amount} onChange={set('amount')}
                className="input-field"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select value={form.category} onChange={set('category')} className="input-field">
                {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div style={{ marginBottom: '16px' }}>
            <Label>Date</Label>
            <input type="date" required value={form.date} onChange={set('date')} className="input-field" />
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '20px' }}>
            <Label>Notes (optional)</Label>
            <textarea
              rows={2} placeholder="Any additional details..."
              value={form.notes} onChange={set('notes')}
              className="input-field"
              style={{ resize: 'none' }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              {loading && <LoadingSpinner size="sm" />}
              {isEditing ? 'Save Changes' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
