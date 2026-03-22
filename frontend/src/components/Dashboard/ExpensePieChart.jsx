import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);

const PALETTE = [
  '#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316',
  '#eab308','#10b981','#14b8a6','#06b6d4','#3b82f6',
];

const ChartSkeleton = () => (
  <div className="card" style={{ padding: '24px' }}>
    <div style={{ height: '18px', width: '150px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
    <div style={{ height: '220px', background: '#f8fafc', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
  </div>
);

export default function ExpensePieChart({ categoryBreakdown, loading }) {
  if (loading) return <ChartSkeleton />;

  if (!categoryBreakdown?.length) {
    return (
      <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '280px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', background: '#f8fafc', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#94a3b8" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        </div>
        <p style={{ fontWeight: 600, color: '#475569', margin: '0 0 4px' }}>No expense data yet</p>
        <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>Add expenses to see breakdown</p>
      </div>
    );
  }

  const data = {
    labels: categoryBreakdown.map(c => c._id),
    datasets: [{
      data: categoryBreakdown.map(c => c.total),
      backgroundColor: PALETTE.slice(0, categoryBreakdown.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 14,
          font: { family: 'Plus Jakarta Sans', size: 12 },
          color: '#64748b',
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` ₹${ctx.parsed.toLocaleString('en-IN')} (${pct}%)`;
          },
        },
        backgroundColor: '#1e293b',
        titleColor: '#f8fafc',
        bodyColor: '#94a3b8',
        padding: 12,
        cornerRadius: 10,
        titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '600' },
        bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
      },
    },
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', margin: '0 0 20px' }}>Expense Breakdown</p>
      <Doughnut data={data} options={options} />
    </div>
  );
}
