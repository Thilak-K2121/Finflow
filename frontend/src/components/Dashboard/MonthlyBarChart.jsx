import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const ChartSkeleton = () => (
  <div className="card" style={{ padding: '24px' }}>
    <div style={{ height: '18px', width: '200px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '20px', animation: 'pulse 1.5s ease-in-out infinite' }} />
    <div style={{ height: '220px', background: '#f8fafc', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite' }} />
  </div>
);

export default function MonthlyBarChart({ monthly, loading }) {
  if (loading) return <ChartSkeleton />;

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1, label: MONTHS[d.getMonth()] };
  });

  const incomeData = months.map(m =>
    monthly?.find(e => e._id.year === m.year && e._id.month === m.month && e._id.type === 'income')?.total || 0
  );
  const expenseData = months.map(m =>
    monthly?.find(e => e._id.year === m.year && e._id.month === m.month && e._id.type === 'expense')?.total || 0
  );

  const data = {
    labels: months.map(m => m.label),
    datasets: [
      {
        label: 'Income',
        data: incomeData,
        backgroundColor: 'rgba(16, 185, 129, 0.85)',
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: expenseData,
        backgroundColor: 'rgba(239, 68, 68, 0.75)',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          font: { family: 'Plus Jakarta Sans', size: 12 },
          color: '#64748b',
          boxWidth: 9,
          boxHeight: 9,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ₹${ctx.parsed.y.toLocaleString('en-IN')}`,
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
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 12 }, color: '#94a3b8' },
        border: { display: false },
      },
      y: {
        grid: { color: '#f1f5f9', drawBorder: false },
        ticks: {
          font: { family: 'Plus Jakarta Sans', size: 11 },
          color: '#94a3b8',
          callback: (v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`,
        },
        border: { display: false },
      },
    },
  };

  return (
    <div className="card" style={{ padding: '24px' }}>
      <p style={{ fontWeight: 600, fontSize: '15px', color: '#0f172a', margin: '0 0 20px' }}>Income vs Expenses</p>
      <Bar data={data} options={options} />
    </div>
  );
}
