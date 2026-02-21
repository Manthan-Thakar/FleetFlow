'use client';

import { useState } from 'react';
import {
  Fuel,
  TrendingUp,
  Activity,
  Download,
  FileText,
  AlertTriangle,
  Truck,
  ChevronDown,
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/firebase/hooks/useAuth';
import { useAnalytics } from '@/firebase/hooks/useAnalytics';

// ─── SVG Line Chart ───────────────────────────────────────────────────────────

function LineChart({ data }: { data: { label: string; kmL: number }[] }) {
  const w = 300, h = 120, pad = 20;
  if (!data || data.length === 0) {
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
        <text x={w / 2} y={h / 2} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.6">
          No data
        </text>
      </svg>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.kmL));
  const minVal = Math.min(...data.map((d) => d.kmL));
  const range = maxVal - minVal || 1;
  const denom = Math.max(1, data.length - 1);
  const pts = data.map((d, i) => {
    const x = pad + (i / denom) * (w - pad * 2);
    const y = pad + ((maxVal - d.kmL) / range) * (h - pad * 2);
    return { x, y, ...d };
  });
  const polyline = pts.map((p) => `${p.x},${p.y}`).join(' ');
  const area = `M${pts[0].x},${h} ` + pts.map((p) => `L${p.x},${p.y}`).join(' ') + ` L${pts[pts.length - 1].x},${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)}
          stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      ))}
      <path d={area} fill="url(#lineGrad)" />
      <polyline points={polyline} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#22c55e" stroke="#fff" strokeWidth="1.5" />
      ))}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={h - 2} textAnchor="middle" fontSize="8" fill="currentColor" opacity="0.5">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

// ─── SVG Bar Chart ────────────────────────────────────────────────────────────

function BarChart({ data }: { data: { id: string; cost: number }[] }) {
  const w = 300, h = 120, pad = 24;
  const maxVal = Math.max(...data.map((d) => d.cost));
  const barW = (w - pad * 2) / data.length - 8;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
      {data.map((d, i) => {
        const barH = ((d.cost / maxVal) * (h - pad * 2));
        const x = pad + i * ((w - pad * 2) / data.length) + 4;
        const y = h - pad - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx="3"
              fill={i === 0 ? '#f59e0b' : i === 1 ? '#ef4444' : '#6366f1'}
              opacity={1 - i * 0.1} />
            <text x={x + barW / 2} y={h - 4} textAnchor="middle" fontSize="7" fill="currentColor" opacity="0.6">
              {d.id}
            </text>
          </g>
        );
      })}
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={pad} x2={w - pad} y1={pad + t * (h - pad * 2)} y2={pad + t * (h - pad * 2)}
          stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" />
      ))}
    </svg>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth();
  const { fleetAnalytics, fuelAnalytics, costAnalytics, loading } = useAnalytics(user?.companyId);
  
  const [selectedMonth, setSelectedMonth] = useState('All');
  const months = ['All', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

  type MonthlyMetric = {
    month: string;
    revenue: number;
    fuelCost: number;
    maintenance: number;
    netProfit: number;
  };
  type FuelTrendPoint = {
    label: string;
    kmL: number;
  };
  type CostlyVehicle = {
    id: string;
    cost: number;
  };
  type DeadStockVehicle = {
    id: string;
    name: string;
    lastUsed: string;
    idleDays: number;
  };

  // Use Firebase analytics data instead of mock data
  const monthlyData: MonthlyMetric[] = [];
  const fuelTrendData: FuelTrendPoint[] = fuelAnalytics?.monthlyTrend ?? [];
  const topCostlyVehicles: CostlyVehicle[] = costAnalytics?.vehicleCosts ?? [];
  const deadStockVehicles: DeadStockVehicle[] = fleetAnalytics?.underutilized ?? [];

  const filtered = selectedMonth === 'All' ? monthlyData : monthlyData.filter((m) => m.month === selectedMonth);

  const totalRevenue = filtered.reduce((s, m) => s + m.revenue, 0);
  const totalFuel = filtered.reduce((s, m) => s + m.fuelCost, 0);
  const totalMaintenance = filtered.reduce((s, m) => s + m.maintenance, 0);
  const totalProfit = filtered.reduce((s, m) => s + m.netProfit, 0);

  if (loading) {
    return (
      <div className="p-6 lg:p-8 min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Analytics</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">Operational analytics & financial reports</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month filter */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none"
            >
              {months.map((m) => <option key={m}>{m}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
          <button className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white text-sm px-4 py-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black text-sm px-4 py-2 rounded-lg hover:opacity-80 transition-opacity">
            <FileText size={14} /> Excel Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Fuel Cost', value: `Rs. ${totalFuel.toFixed(1)}L`, sub: 'Across fleet', icon: <Fuel size={20} />, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/30', trend: '+4%', up: false },
          { label: 'Total Revenue', value: `Rs. ${totalRevenue.toFixed(1)}L`, sub: 'Gross income', icon: <TrendingUp size={20} />, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950/30', trend: '+12.5%', up: true },
          { label: 'Fleet ROI', value: '+12.5%', sub: 'vs last period', icon: <BarChart2 size={20} />, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/30', trend: '+2.1%', up: true },
          { label: 'Utilization Rate', value: '82%', sub: 'Active vehicles', icon: <Activity size={20} />, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', trend: '-3%', up: false },
        ].map((card) => (
          <div key={card.label} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`${card.bg} ${card.color} p-2 rounded-lg`}>{card.icon}</div>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${card.up ? 'text-green-500' : 'text-red-500'}`}>
                {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}{card.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-black dark:text-white">{card.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Fuel Efficiency Trend */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-black dark:text-white">Fuel Efficiency Trend</h2>
              <p className="text-xs text-zinc-500 mt-0.5">km/L across months</p>
            </div>
            <div className="flex items-center gap-1.5 text-green-500 text-sm font-medium">
              <div className="w-3 h-0.5 bg-green-500 rounded" />
              km/L
            </div>
          </div>
          <LineChart data={fuelTrendData} />
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>Avg: 10.1 km/L</span>
            <span className="text-green-500 font-medium">↑ Improving</span>
          </div>
        </div>

        {/* Top 5 Costliest Vehicles */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-black dark:text-white">Top 5 Costliest Vehicles</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Fuel + maintenance spend (Rs. 000s)</p>
            </div>
          </div>
          <BarChart data={topCostlyVehicles} />
          <div className="mt-3 space-y-1">
            {topCostlyVehicles.slice(0, 3).map((v, i) => (
              <div key={v.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-red-400' : 'bg-indigo-400'}`} />
                  <span className="text-zinc-600 dark:text-zinc-400">{v.id}</span>
                </div>
                <span className="font-medium text-black dark:text-white">Rs. {v.cost}K</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Summary Table */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-zinc-500" />
            <h2 className="font-semibold text-black dark:text-white">Financial Summary of Month</h2>
          </div>
          <span className="text-xs text-zinc-500">{filtered.length} month(s) shown</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                {['Month', 'Revenue', 'Fuel Cost', 'Maintenance', 'Net Profit'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((row) => (
                <tr key={row.month} className="hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-black dark:text-white flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />{row.month}
                  </td>
                  <td className="px-6 py-4 text-green-600 dark:text-green-400 font-medium">Rs. {row.revenue}L</td>
                  <td className="px-6 py-4 text-amber-600 dark:text-amber-400">Rs. {row.fuelCost}L</td>
                  <td className="px-6 py-4 text-blue-600 dark:text-blue-400">Rs. {row.maintenance}L</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${row.netProfit > 10 ? 'text-green-600 dark:text-green-400' : 'text-zinc-700 dark:text-zinc-300'}`}>
                      Rs. {row.netProfit}L
                    </span>
                  </td>
                </tr>
              ))}
              {/* Totals Row */}
              <tr className="bg-zinc-100 dark:bg-zinc-800 font-semibold">
                <td className="px-6 py-4 text-black dark:text-white">Total</td>
                <td className="px-6 py-4 text-green-600 dark:text-green-400">Rs. {totalRevenue.toFixed(1)}L</td>
                <td className="px-6 py-4 text-amber-600 dark:text-amber-400">Rs. {totalFuel.toFixed(1)}L</td>
                <td className="px-6 py-4 text-blue-600 dark:text-blue-400">Rs. {totalMaintenance.toFixed(1)}L</td>
                <td className="px-6 py-4 text-green-600 dark:text-green-400">Rs. {totalProfit.toFixed(1)}L</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Dead Stock Alerts */}
      <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-amber-500" />
          <h2 className="font-semibold text-black dark:text-white">Dead Stock Alerts</h2>
          <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">
            {deadStockVehicles.length} idle
          </span>
        </div>
        <p className="text-xs text-zinc-500 mb-4">Vehicles idle for 10+ days — consider reassigning or selling.</p>
        <div className="space-y-3">
          {deadStockVehicles.map((v) => (
            <div key={v.id} className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-amber-100 dark:border-amber-900 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <Truck size={16} className="text-amber-500" />
                </div>
                <div>
                  <p className="font-medium text-black dark:text-white text-sm">{v.name}</p>
                  <p className="text-xs text-zinc-500">{v.id} · Last used: {v.lastUsed}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">{v.idleDays} days</p>
                <p className="text-xs text-zinc-500">idle</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
