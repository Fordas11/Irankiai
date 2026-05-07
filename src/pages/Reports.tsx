import { useState } from 'react';
import { useStore } from '../store/useStore';
import { RevenueIcon, ClipboardIcon, ArrowTrendUpIcon, ServerIcon } from '../components/Icons';

type ReportTab = 'revenue' | 'products' | 'machines';

const WEEKLY = [
  { date: 'Apr 15', revenue: 4200, transactions: 168 },
  { date: 'Apr 16', revenue: 3800, transactions: 152 },
  { date: 'Apr 17', revenue: 4500, transactions: 180 },
  { date: 'Apr 18', revenue: 5100, transactions: 204 },
  { date: 'Apr 19', revenue: 4800, transactions: 192 },
  { date: 'Apr 20', revenue: 4600, transactions: 184 },
  { date: 'Apr 21', revenue: 3250, transactions: 130 },
];

const PRODUCT_SALES = [
  { name: 'Coca Cola', sales: 412, revenue: 618 },
  { name: 'Energy Drink', sales: 298, revenue: 596 },
  { name: 'Chocolate Bar', sales: 276, revenue: 497 },
  { name: 'Chips', sales: 241, revenue: 289 },
  { name: 'Pepsi', sales: 198, revenue: 277 },
  { name: 'Water', sales: 187, revenue: 150 },
  { name: 'Juice', sales: 154, revenue: 246 },
  { name: 'Sandwich', sales: 82, revenue: 287 },
];

function LineChart({ data }: { data: typeof WEEKLY }) {
  const W = 600, H = 180, PX = 48, PY = 20;
  const maxRev = Math.max(...data.map(d => d.revenue));
  const maxTx = Math.max(...data.map(d => d.transactions));

  const revPoints = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * (W - PX * 2),
    y: PY + (1 - d.revenue / maxRev) * (H - PY * 2),
  }));
  const txPoints = data.map((d, i) => ({
    x: PX + (i / (data.length - 1)) * (W - PX * 2),
    y: PY + (1 - d.transactions / maxTx) * (H - PY * 2),
  }));

  const polyline = (pts: { x: number; y: number }[]) =>
    pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(v => ({
    y: PY + v * (H - PY * 2),
    label: `$${Math.round(maxRev * (1 - v)).toLocaleString()}`,
  }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 180 }}>
      {gridLines.map(g => (
        <g key={g.y}>
          <line x1={PX} y1={g.y} x2={W - PX} y2={g.y} stroke="#f1f5f9" strokeWidth="1" />
          <text x={PX - 6} y={g.y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">{g.label}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={revPoints[i].x} y={H - 4} textAnchor="middle" fontSize="9" fill="#94a3b8">{d.date}</text>
      ))}
      <polyline points={polyline(revPoints)} fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round" />
      <polyline points={polyline(txPoints)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinejoin="round" strokeDasharray="4 2" />
      {revPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3b82f6" />
      ))}
      {txPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#10b981" />
      ))}
    </svg>
  );
}

// Ribinė klasė: AtaskaitosLangas (Boundary) — paketas: Main
export default function AtaskaitosLangas() {
  const { machines, machineProducts } = useStore();
  const [tab, setTab] = useState<ReportTab>('revenue');

  const totalRevenue = WEEKLY.reduce((s, d) => s + d.revenue, 0);
  const totalTransactions = WEEKLY.reduce((s, d) => s + d.transactions, 0);
  const avgTransaction = totalRevenue / totalTransactions;
  const topMachine = [...machines].sort((a, b) => b.revenue_today - a.revenue_today)[0];

  const machineRevenue = machines.map(m => ({
    machine: m,
    revenue: m.revenue_today,
    items: machineProducts.filter(mp => mp.machine_id === m.id).reduce((s, mp) => s + mp.quantity, 0),
  })).sort((a, b) => b.revenue - a.revenue);

  const maxMachineRev = Math.max(...machineRevenue.map(m => m.revenue), 1);
  const maxProductRev = Math.max(...PRODUCT_SALES.map(p => p.revenue), 1);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Sales Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Analytics and performance metrics</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <RevenueIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-slate-800">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Revenue</div>
          <div className="text-xs text-green-600 font-medium mt-1">+18.2% from last week</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <ArrowTrendUpIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{totalTransactions.toLocaleString()}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Total Transactions</div>
          <div className="text-xs text-green-600 font-medium mt-1">+12.5% from last week</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center mb-3">
            <ClipboardIcon className="w-5 h-5" />
          </div>
          <div className="text-2xl font-bold text-slate-800">${avgTransaction.toFixed(2)}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Avg Transaction</div>
          <div className="text-xs text-slate-400 mt-1">Per sale</div>
        </div>
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center mb-3">
            <ServerIcon className="w-5 h-5" />
          </div>
          <div className="text-lg font-bold text-slate-800 leading-tight">{topMachine?.name}</div>
          <div className="text-xs text-slate-500 font-medium mt-1">Top Machine</div>
          <div className="text-xs text-slate-400 mt-1">${topMachine?.revenue_today.toLocaleString()} revenue</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            {([['revenue', 'Revenue Trends'], ['products', 'Product Performance'], ['machines', 'Machine Comparison']] as [ReportTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {tab === 'revenue' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-slate-800">Revenue & Transactions (Last 7 Days)</h3>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 bg-blue-500 inline-block rounded" />
                    Revenue
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 inline-block" style={{ borderBottom: '2px dashed #10b981' }} />
                    Transactions
                  </span>
                </div>
              </div>
              <LineChart data={WEEKLY} />
              <div className="mt-4 grid grid-cols-7 gap-2">
                {WEEKLY.map(d => (
                  <div key={d.date} className="text-center p-2 bg-slate-50 rounded-lg">
                    <div className="text-xs font-medium text-slate-600">{d.date.split(' ')[1]}</div>
                    <div className="text-xs text-slate-800 font-semibold mt-1">${d.revenue.toLocaleString()}</div>
                    <div className="text-xs text-slate-400">{d.transactions} sales</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'products' && (
            <div>
              <h3 className="font-medium text-slate-800 mb-4">Top Products by Revenue</h3>
              <div className="space-y-3">
                {PRODUCT_SALES.map(p => (
                  <div key={p.name} className="flex items-center gap-4">
                    <div className="w-28 text-sm text-slate-700 shrink-0">{p.name}</div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
                      <div className="h-full bg-blue-500 rounded-md transition-all" style={{ width: `${(p.revenue / maxProductRev) * 100}%` }} />
                      <span className="absolute inset-0 flex items-center px-2 text-xs font-medium text-white mix-blend-difference">{p.sales} sales</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700 w-16 text-right">${p.revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'machines' && (
            <div>
              <h3 className="font-medium text-slate-800 mb-4">Revenue by Machine (Today)</h3>
              <div className="space-y-3">
                {machineRevenue.map(({ machine, revenue, items }) => (
                  <div key={machine.id} className="flex items-center gap-4">
                    <div className="w-36 text-sm text-slate-700 shrink-0 truncate">{machine.name}</div>
                    <div className="flex-1 h-6 bg-slate-100 rounded-md overflow-hidden relative">
                      <div className={`h-full rounded-md transition-all ${revenue > 0 ? 'bg-emerald-500' : 'bg-slate-300'}`} style={{ width: `${(revenue / maxMachineRev) * 100}%` }} />
                    </div>
                    <div className="text-sm font-semibold text-slate-700 w-16 text-right">${revenue.toLocaleString()}</div>
                    <div className="text-xs text-slate-400 w-16 text-right">{items} items</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
