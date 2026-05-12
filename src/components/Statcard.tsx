export function StatCard({
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