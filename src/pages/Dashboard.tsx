import { useStore } from '../store/useStore';
import { RevenueIcon, ServerIcon, StockIcon, ClipboardIcon } from '../components/Icons';

const STATUS_LABEL: Record<string, string> = {
  operational: 'Operational',
  offline: 'Offline',
  needs_service: 'Needs Service',
  broken: 'Broken',
  maintenance: 'Maintenance',
  servicing: 'Servicing',
};

const STATUS_STYLE: Record<string, string> = {
  operational: 'bg-green-100 text-green-700',
  offline: 'bg-slate-100 text-slate-500',
  needs_service: 'bg-yellow-100 text-yellow-700',
  broken: 'bg-red-100 text-red-700',
  maintenance: 'bg-blue-100 text-blue-700',
  servicing: 'bg-purple-100 text-purple-700',
};

const STATUS_DOT: Record<string, string> = {
  operational: 'bg-green-500',
  offline: 'bg-slate-400',
  needs_service: 'bg-yellow-500',
  broken: 'bg-red-500',
  maintenance: 'bg-blue-500',
  servicing: 'bg-purple-500',
};

// Ribinė klasė: PagrindinisLangas (Boundary) — paketas: Main
export default function PagrindinisLangas() {
  const { machines, machineProducts, tasks } = useStore();

  const totalRevenue = machines.reduce((s, m) => s + m.revenue_today, 0);
  const active = machines.filter(m => m.status === 'operational').length;
  const needsService = machines.filter(m => m.status === 'needs_service' || m.status === 'broken').length;
  const offline = machines.filter(m => m.status === 'offline').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;

  const avgStock = (() => {
    if (!machineProducts.length) return 0;
    const pct = machineProducts.reduce((s, mp) => s + mp.quantity / mp.max_quantity, 0) / machineProducts.length;
    return Math.round(pct * 100);
  })();

  const getStockPct = (machineId: string) => {
    const mps = machineProducts.filter(mp => mp.machine_id === machineId);
    if (!mps.length) return 0;
    return Math.round(mps.reduce((s, mp) => s + mp.quantity / mp.max_quantity, 0) / mps.length * 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Real-time overview of your vending machine network</p>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Revenue"
          sublabel="Today"
          value={`$${totalRevenue.toLocaleString()}`}
          badge="+12.5% from yesterday"
          badgeColor="text-green-600"
          icon={<RevenueIcon className="w-5 h-5" />}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Active Machines"
          value={`${active}/${machines.length}`}
          sublabel={`${needsService} need service, ${offline} offline`}
          icon={<ServerIcon className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
        />
        <StatCard
          label="Avg Stock Level"
          value={`${avgStock}%`}
          sublabel={
            <div className="mt-1 h-1.5 bg-slate-200 rounded-full overflow-hidden w-full">
              <div className={`h-full rounded-full ${avgStock < 40 ? 'bg-red-400' : avgStock < 65 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${avgStock}%` }} />
            </div>
          }
          icon={<StockIcon className="w-5 h-5" />}
          iconBg="bg-violet-50 text-violet-600"
        />
        <StatCard
          label="Pending Tasks"
          value={pendingTasks}
          sublabel={`${tasks.length} total tasks`}
          icon={<ClipboardIcon className="w-5 h-5" />}
          iconBg="bg-orange-50 text-orange-600"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Machine Status Overview</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {machines.map(m => {
            const stock = getStockPct(m.id);
            return (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-800 text-sm">{m.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{m.address}</div>
                </div>
                <div className="text-xs text-slate-500 w-20 text-right">Stock Level</div>
                <div className="flex items-center gap-2 w-32">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${stock < 30 ? 'bg-red-400' : stock < 60 ? 'bg-yellow-400' : 'bg-green-400'}`}
                      style={{ width: `${stock}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-600 font-medium w-8 text-right">{stock}%</span>
                </div>
                <div className="text-sm font-medium text-slate-700 w-16 text-right">
                  {m.revenue_today > 0 ? `$${m.revenue_today.toLocaleString()}` : '—'}
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[m.status]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[m.status]}`} />
                  {STATUS_LABEL[m.status]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, sublabel, value, badge, badgeColor, icon, iconBg,
}: {
  label: string;
  sublabel?: React.ReactNode;
  value: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
        {badge && <span className={`text-xs font-medium ${badgeColor}`}>{badge}</span>}
      </div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
      {sublabel && <div className="text-xs text-slate-400 mt-1">{sublabel}</div>}
    </div>
  );
}
