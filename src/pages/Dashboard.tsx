import { RevenueIcon, ServerIcon, StockIcon, ClipboardIcon } from '../components/Icons';
import { useMachinesViewModel } from "../viewmodels/MachinesViewModel";
import type { AutomatoBūsena } from "../types";
import { StatCard } from '../components/Statcard';


// Ribinė klasė: PagrindinisLangas (Boundary) — paketas: Main
export default function PagrindinisLangas() {

  const {
        search,
        setSearch,
        filterStatus,
        setFilterStatus,
        filtered,
        STATUSES,
        STATUS_LABEL,
        STATUS_STYLE,
        STATUS_DOT,
        totalRevenue,
        active,
        needsService,
        offline,
        pendingTasks,
        avgStock,
        machines,
        tasks,
        getStockPct,
      } = useMachinesViewModel();

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
      <div className="flex gap-3 my-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or address..."
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s as AutomatoBūsena]}</option>)}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Machine Status Overview</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {filtered.map(m => {
            const stock = getStockPct(m.id);
            return (
              <div key={m.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0 max-w-240">
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
          {filtered.length === 0 && (
                   <p className="px-5 py-10 text-center text-slate-400">No machines found</p>
          )}
        </div>
      </div>
    </div>
  );
}


