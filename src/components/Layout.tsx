import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { NaudotojoController } from '../controllers/NaudotojoController';
import {
  DashboardIcon, InventoryIcon, ServiceIcon, ReportsIcon,
  MapIcon, MachinesIcon, UsersIcon, SignOutIcon, UserIcon,
} from './Icons';

type NavItem = { to: string; label: string; Icon: React.ComponentType<{ className?: string }> };

const MAIN_NAV: NavItem[] = [
  { to: '/', label: 'Dashboard', Icon: DashboardIcon },
  { to: '/inventory', label: 'Inventory', Icon: InventoryIcon },
  { to: '/service', label: 'Service Planning', Icon: ServiceIcon },
  { to: '/reports', label: 'Reports', Icon: ReportsIcon },
  { to: '/map', label: 'Map View', Icon: MapIcon },
];

const ADMIN_NAV: NavItem[] = [
  { to: '/machines', label: 'Machines', Icon: MachinesIcon },
  { to: '/users', label: 'Users', Icon: UsersIcon },
];

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Administrator',
  attendant: 'Attendant',
  technician: 'Technician',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'administrator';

  // 4.2.18 Atsijungti — Step 3: NaudotojoController → boundary (grąžina į prisijungimo langą)
  const grazintiVartotoja = () => {
    navigate('/login');
  };

  // 4.2.18 Atsijungti — Step 1: Naudotojas → Prisijungti(boundary)
  const atsijungti = () => {
    // Step 2: boundary → NaudotojoController
    NaudotojoController.atsijungti(grazintiVartotoja);
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-blue-50 text-blue-700'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
    }`;

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-60 bg-white border-r border-slate-200 flex flex-col shadow-sm shrink-0">
        <div className="px-5 py-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">V</div>
            <div>
              <div className="font-bold text-slate-800 text-sm">VendingOS</div>
              <div className="text-xs text-slate-500">Management System</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
          {MAIN_NAV.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={linkClass}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-1">
                <div className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin</div>
              </div>
              {ADMIN_NAV.map(({ to, label, Icon }) => (
                <NavLink key={to} to={to} className={linkClass}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="px-4 py-5 border-t border-slate-200">
          <NavLink to="/profilis" className="block px-4 py-3 mb-2 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-800">{currentUser?.first_name} {currentUser?.last_name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{ROLE_LABELS[currentUser?.role ?? '']}</div>
              </div>
            </div>
          </NavLink>
          <button
            onClick={atsijungti}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <SignOutIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
