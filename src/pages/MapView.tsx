import { useStore } from '../store/useStore';
import { RouteIcon, NavigationIcon } from '../components/Icons';
import type { AutomatoBūsena } from '../types';

const STATUS_COLOR: Record<AutomatoBūsena, string> = {
  operational: '#22c55e',
  offline: '#ef4444',
  needs_service: '#f59e0b',
  broken: '#ef4444',
  maintenance: '#3b82f6',
  servicing: '#a855f7',
};

const LEGEND: { status: AutomatoBūsena; label: string }[] = [
  { status: 'operational', label: 'Operational' },
  { status: 'needs_service', label: 'Needs Service' },
  { status: 'offline', label: 'Offline' },
];

// Ribinė klasė: ŽemėlapioLangas (Boundary) — paketas: Main
export default function ŽemėlapioLangas() {
  const { machines, machineProducts, tasks } = useStore();

  const lats = machines.map(m => m.latitude);
  const lngs = machines.map(m => m.longitude);
  const minLat = Math.min(...lats), maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs);

  const PAD = 48;
  const MAP_W = 480, MAP_H = 320;

  const toX = (lng: number) => PAD + ((lng - minLng) / (maxLng - minLng || 1)) * (MAP_W - PAD * 2);
  const toY = (lat: number) => PAD + ((maxLat - lat) / (maxLat - minLat || 1)) * (MAP_H - PAD * 2);

  const getStockPct = (machineId: string) => {
    const mps = machineProducts.filter(mp => mp.machine_id === machineId);
    if (!mps.length) return 0;
    return Math.round(mps.reduce((s, mp) => s + mp.quantity / mp.max_quantity, 0) / mps.length * 100);
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const machinesToVisit = machines.filter(m => m.status === 'needs_service' || m.status === 'offline').length;

  const estimatedDist = (machines.length * 7.2).toFixed(1);
  const estimatedTime = `${Math.floor(machines.length * 0.55)}h ${Math.round((machines.length * 0.55 % 1) * 60)}m`;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Map View</h1>
        <p className="text-sm text-slate-500 mt-1">Vending machine locations and service routes</p>
      </div>

      <div className="flex gap-5">
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Machine Locations</h3>
              <button className="flex items-center gap-1.5 text-xs font-medium text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                <RouteIcon className="w-3.5 h-3.5" />
                Optimize Route
              </button>
            </div>

            <div className="relative bg-slate-100 overflow-hidden" style={{ height: MAP_H }}>
              <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="none">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <line x1="80" y1="0" x2="80" y2={MAP_H} stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                <line x1="260" y1="0" x2="280" y2={MAP_H} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                <line x1="0" y1="140" x2={MAP_W} y2="120" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
                <line x1="0" y1="200" x2={MAP_W} y2="220" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                <line x1="160" y1="0" x2="140" y2={MAP_H} stroke="#e2e8f0" strokeWidth="2" />
                <line x1="380" y1="0" x2="360" y2={MAP_H} stroke="#e2e8f0" strokeWidth="2" />
                <text x="10" y={MAP_H - 12} fontSize="10" fill="#94a3b8">Business District</text>
                <text x="300" y="20" fontSize="10" fill="#94a3b8">Main Street</text>
              </svg>

              <svg className="absolute inset-0" viewBox={`0 0 ${MAP_W} ${MAP_H}`} style={{ width: MAP_W, height: MAP_H }}>
                {machines.map(m => {
                  const x = toX(m.longitude);
                  const y = toY(m.latitude);
                  const color = STATUS_COLOR[m.status];
                  return (
                    <g key={m.id}>
                      <circle cx={x} cy={y} r={14} fill="white" stroke={color} strokeWidth="2.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />
                      <circle cx={x} cy={y} r={7} fill={color} />
                      <text x={x} y={y + 24} textAnchor="middle" fontSize="9" fontWeight="600" fill="#475569">{m.name.split(' ')[0]}</text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-5">
              <div className="text-xs font-medium text-slate-500">Status:</div>
              {LEGEND.map(l => (
                <div key={l.status} className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[l.status] }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-64 shrink-0 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">All Machines</h3>
            </div>
            <div className="divide-y divide-slate-100 overflow-y-auto" style={{ maxHeight: 260 }}>
              {machines.map(m => {
                const stock = getStockPct(m.id);
                return (
                  <div key={m.id} className="px-5 py-3.5 flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLOR[m.status] }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 truncate">{m.name}</div>
                      <div className="text-xs text-slate-400 truncate">{m.address}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Stock: {stock}% · ${m.revenue_today.toLocaleString()}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Route Summary</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Total Distance', value: `${estimatedDist} km` },
                { label: 'Estimated Time', value: estimatedTime },
                { label: 'Machines to Visit', value: machinesToVisit },
                { label: 'Priority Tasks', value: pendingTasks },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{r.label}</span>
                  <span className="text-sm font-semibold text-slate-800">{r.value}</span>
                </div>
              ))}
            </div>
            <div className="px-5 pb-5">
              <button className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <NavigationIcon className="w-4 h-4" />
                Start Navigation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
