import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f5f3ff 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
    }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <div style={{ width: '100%', maxWidth: '380px', animation: 'slideUp 0.3s ease-out' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1, #4338ca)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgb(99 102 241 / 0.3)',
          }}>
            <svg width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75" />
            </svg>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.5px' }}>Finflow</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '28px', boxShadow: '0 8px 30px rgb(0 0 0 / 0.08)' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: '#fff1f2', color: '#be123c', fontSize: '13px', padding: '10px 14px', borderRadius: '10px', marginBottom: '18px', border: '1px solid #ffe4e6' }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email" required autoComplete="email" placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="input-field"
              />
            </div>
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password" required autoComplete="current-password" placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="input-field"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '11px' }}
            >
              {loading && <LoadingSpinner size="sm" />}
              Sign In
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: '14px', color: '#64748b', marginTop: '20px' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 600, textDecoration: 'none' }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
