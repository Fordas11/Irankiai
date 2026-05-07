import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Automatas, Prekė, AutomatoPrekė, Naudotojas, Dienotvarkė } from '../types';

const MACHINES: Automatas[] = [
  { id: '1', name: 'Downtown Mall', model: 'VM-2000', address: '123 Main Street, Building A', longitude: 23.8813, latitude: 54.9027, status: 'operational', revenue_today: 1250, created_at: '2025-01-10', last_serviced: '2026-04-01' },
  { id: '2', name: 'Central Station', model: 'VM-1500', address: '456 Railroad Ave', longitude: 23.9136, latitude: 54.8985, status: 'needs_service', revenue_today: 980, created_at: '2025-02-15', last_serviced: '2026-03-15' },
  { id: '3', name: 'University Campus', model: 'VM-2000', address: '789 College Drive', longitude: 23.9254, latitude: 54.9102, status: 'operational', revenue_today: 1580, created_at: '2025-03-01', last_serviced: '2026-04-10' },
  { id: '4', name: 'Office Park', model: 'VM-1000', address: '321 Business Blvd', longitude: 23.8975, latitude: 54.8891, status: 'offline', revenue_today: 0, created_at: '2024-11-20', last_serviced: '2026-02-28' },
  { id: '5', name: 'Shopping Center', model: 'VM-1500', address: '555 Retail Road', longitude: 23.8654, latitude: 54.9156, status: 'operational', revenue_today: 760, created_at: '2024-09-05', last_serviced: '2026-04-15' },
  { id: '6', name: 'Airport Terminal', model: 'VM-3000', address: 'Gate 12, Terminal B', longitude: 23.8721, latitude: 54.8634, status: 'operational', revenue_today: 2100, created_at: '2024-09-05', last_serviced: '2026-04-18' },
];

const PRODUCTS: Prekė[] = [
  { id: 'p1', name: 'Coca Cola', category: 'Drinks', price: 1.5 },
  { id: 'p2', name: 'Pepsi', category: 'Drinks', price: 1.4 },
  { id: 'p3', name: 'Water', category: 'Drinks', price: 0.8 },
  { id: 'p4', name: 'Chips', category: 'Snacks', price: 1.2 },
  { id: 'p5', name: 'Chocolate Bar', category: 'Sweets', price: 1.8 },
  { id: 'p6', name: 'Energy Drink', category: 'Drinks', price: 2.0 },
  { id: 'p7', name: 'Sandwich', category: 'Food', price: 3.5 },
  { id: 'p8', name: 'Juice', category: 'Drinks', price: 1.6 },
];

const MACHINE_PRODUCTS: AutomatoPrekė[] = [
  { id: 'mp1', machine_id: '1', product_id: 'p1', quantity: 18, max_quantity: 20, price: 1.5, refill_date: '2026-04-01', expiry_date: '2026-06-15', status: 'good' },
  { id: 'mp2', machine_id: '1', product_id: 'p2', quantity: 15, max_quantity: 20, price: 1.4, refill_date: '2026-04-01', expiry_date: '2026-05-20', status: 'good' },
  { id: 'mp3', machine_id: '1', product_id: 'p4', quantity: 8, max_quantity: 10, price: 1.2, refill_date: '2026-04-01', expiry_date: '2026-04-23', status: 'expiring_soon' },
  { id: 'mp4', machine_id: '1', product_id: 'p3', quantity: 12, max_quantity: 15, price: 0.8, refill_date: '2026-04-01', expiry_date: '2027-01-10', status: 'good' },
  { id: 'mp5', machine_id: '2', product_id: 'p1', quantity: 3, max_quantity: 20, price: 1.5, refill_date: '2026-03-15', expiry_date: '2026-09-01', status: 'good' },
  { id: 'mp6', machine_id: '2', product_id: 'p6', quantity: 2, max_quantity: 15, price: 2.0, refill_date: '2026-03-15', expiry_date: '2026-04-22', status: 'expiring_soon' },
  { id: 'mp7', machine_id: '3', product_id: 'p5', quantity: 12, max_quantity: 15, price: 1.8, refill_date: '2026-04-10', expiry_date: '2026-10-01', status: 'good' },
  { id: 'mp8', machine_id: '3', product_id: 'p6', quantity: 10, max_quantity: 10, price: 2.0, refill_date: '2026-04-10', expiry_date: '2026-09-30', status: 'good' },
  { id: 'mp9', machine_id: '3', product_id: 'p7', quantity: 4, max_quantity: 10, price: 3.5, refill_date: '2026-04-10', expiry_date: '2026-04-22', status: 'expiring_soon' },
  { id: 'mp10', machine_id: '5', product_id: 'p1', quantity: 6, max_quantity: 20, price: 1.5, refill_date: '2026-04-15', expiry_date: '2026-12-31', status: 'good' },
  { id: 'mp11', machine_id: '5', product_id: 'p4', quantity: 2, max_quantity: 10, price: 1.2, refill_date: '2026-03-01', expiry_date: '2026-04-10', status: 'expired' },
  { id: 'mp12', machine_id: '6', product_id: 'p1', quantity: 20, max_quantity: 20, price: 1.6, refill_date: '2026-04-18', expiry_date: '2026-12-31', status: 'good' },
  { id: 'mp13', machine_id: '6', product_id: 'p6', quantity: 15, max_quantity: 20, price: 2.2, refill_date: '2026-04-18', expiry_date: '2026-09-30', status: 'good' },
  { id: 'mp14', machine_id: '6', product_id: 'p8', quantity: 18, max_quantity: 20, price: 1.6, refill_date: '2026-04-18', expiry_date: '2026-08-15', status: 'good' },
];

const USERS: Naudotojas[] = [
  { id: 'u1', first_name: 'Admin', last_name: 'User', email: 'admin@vendingos.com', password: 'admin123', role: 'administrator', status: 'active', created_at: '2025-01-01' },
  { id: 'u2', first_name: 'John', last_name: 'Smith', email: 'john@vendingos.com', password: 'john123', role: 'attendant', status: 'active', created_at: '2025-02-01' },
  { id: 'u3', first_name: 'Sarah', last_name: 'Johnson', email: 'sarah@vendingos.com', password: 'sarah123', role: 'technician', status: 'active', created_at: '2025-03-01' },
  { id: 'u4', first_name: 'Mike', last_name: 'Davis', email: 'mike@vendingos.com', password: 'mike123', role: 'attendant', status: 'active', created_at: '2025-04-01' },
  { id: 'u5', first_name: 'Emily', last_name: 'Brown', email: 'emily@vendingos.com', password: 'emily123', role: 'technician', status: 'vacation', created_at: '2025-04-15' },
];

const TASKS: Dienotvarkė[] = [
  { id: 't1', machine_id: '2', assigned_to: 'u2', type: 'refill', priority: 'high', status: 'pending', description: 'Stock level critically low — needs immediate refill', scheduled_date: '2026-04-22', created_at: '2026-04-20' },
  { id: 't2', machine_id: '1', assigned_to: 'u3', type: 'maintenance', priority: 'low', status: 'in_progress', description: 'Routine maintenance check scheduled', scheduled_date: '2026-04-22', created_at: '2026-04-20' },
  { id: 't3', machine_id: '4', assigned_to: null, type: 'repair', priority: 'medium', status: 'pending', description: 'Machine offline — needs full inspection', scheduled_date: '2026-04-23', created_at: '2026-04-21' },
  { id: 't4', machine_id: '5', assigned_to: null, type: 'refill', priority: 'medium', status: 'pending', description: 'Low stock on popular items', scheduled_date: '2026-04-24', created_at: '2026-04-21' },
];

interface StoreState {
  currentUser: Naudotojas | null;
  machines: Automatas[];
  products: Prekė[];
  machineProducts: AutomatoPrekė[];
  users: Naudotojas[];
  tasks: Dienotvarkė[];

  // 4.2.21 Prisijungti — tikrintiPrisijungima (entity self-call)
  prisijungti: (el_pastas: string, slaptazodis: string) => boolean;
  tikrintiPrisijungima: (el_pastas: string, slaptazodis: string) => boolean;
  atsijungti: () => void;

  // 4.2.14 Peržiūrėti automatų sąrašą — entity self-calls: rastiVisusAutomatus, rastiAutomatusPagalFiltra
  gautiVisusAutomatus: () => Automatas[];
  rastiVisusAutomatus: () => Automatas[];
  rastiAutomatusPagalFiltra: (filtras: { search?: string; status?: string }) => Automatas[];
  gautiAutomata: (id: string) => Automatas | undefined;
  // 4.2.15 Sukurti automatą — entity self-calls: PatikrintiDuomenis, IšsaugotiAutomatą
  patikrintiDuomenis: (m: Omit<Automatas, 'id' | 'created_at'>) => boolean;
  išsaugotiAutomatą: (m: Omit<Automatas, 'id' | 'created_at'>) => void;
  sukurtiAutomatą: (m: Omit<Automatas, 'id' | 'created_at'>) => boolean;
  atnaujintiAutomatą: (id: string, m: Partial<Automatas>) => void;
  pašalintiAutomatą: (id: string) => void;
  // 4.2.10 Pakeisti būseną — entity self-calls: issaugotiAutomatoBusena, issaugotiAutomatoPrekesBusena
  issaugotiAutomatoBusena: (id: string, būsena: Automatas['status']) => void;
  issaugotiAutomatoPrekesBusena: (id: string, būsena: AutomatoPrekė['status']) => void;
  keistiAutomatoBūseną: (id: string, būsena: Automatas['status']) => void;

  // Products (internal use)
  sukurtiPrekę: (p: Omit<Prekė, 'id'>) => void;
  atnaujintiPrekę: (id: string, p: Partial<Prekė>) => void;
  pašalintiPrekę: (id: string) => void;

  // 4.2.12 Papildyti prekes / 4.2.16 Tikrinti prekių galiojimo laikus
  pridėtiPrekęAutomatui: (mp: Omit<AutomatoPrekė, 'id'>) => void;
  atnaujintiPrekęAutomatui: (id: string, mp: Partial<AutomatoPrekė>) => void;
  pašalintiPrekęAutomatui: (id: string) => void;
  tikrintiPrekiųGaliojimą: () => void;

  // 4.2.3 Registruoti — entity self-calls: PatikrintiNaudotojoDuomenis, issaugotiSukurtaNaudotoja
  PatikrintiNaudotojoDuomenis: (u: Omit<Naudotojas, 'id' | 'created_at'>) => boolean;
  issaugotiSukurtaNaudotoja: (u: Omit<Naudotojas, 'id' | 'created_at'>) => void;
  registruotiNaudotoją: (u: Omit<Naudotojas, 'id' | 'created_at'>) => boolean;
  atnaujintiNaudotoją: (id: string, u: Partial<Naudotojas>) => void;
  pašalintiNaudotoją: (id: string) => void;
  // 4.2.1 Pakeisti naudotojo būseną — issaugotiNaudotojoBusena (entity self-call)
  issaugotiNaudotojoBusena: (id: string, būsena: Naudotojas['status']) => void;
  keistiNaudotojoBūseną: (id: string, būsena: Naudotojas['status']) => void;
  // 4.2.2 Priskirti naudotojui teises/rolę — IssaugotiRole (entity self-call)
  IssaugotiRole: (id: string, rolė: Naudotojas['role']) => void;
  priskirtiNaudotojuiRolę: (id: string, rolė: Naudotojas['role']) => void;

  // 4.2.7 Aptarnauti automatą / 4.2.17 Tvarkyti automatą
  sukurtiUžduotį: (t: Omit<Dienotvarkė, 'id' | 'created_at'>) => void;
  atnaujintiUžduotį: (id: string, t: Partial<Dienotvarkė>) => void;
  pašalintiUžduotį: (id: string) => void;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().split('T')[0];

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      machines: MACHINES,
      products: PRODUCTS,
      machineProducts: MACHINE_PRODUCTS,
      users: USERS,
      tasks: TASKS,

      // 4.2.21 Prisijungti — tikrintiPrisijungima (entity self-call, step 5)
      tikrintiPrisijungima: (el_pastas, slaptazodis) => {
        const naudotojas = get().users.find(u => u.email === el_pastas && u.password === slaptazodis);
        if (naudotojas) { set({ currentUser: naudotojas }); return true; }
        return false;
      },
      prisijungti: (el_pastas, slaptazodis) => get().tikrintiPrisijungima(el_pastas, slaptazodis),
      atsijungti: () => set({ currentUser: null }),

      // 4.2.14 Peržiūrėti automatų sąrašą — rastiVisusAutomatus (entity self-call, step 3)
      rastiVisusAutomatus: () => get().machines,
      gautiVisusAutomatus: () => get().rastiVisusAutomatus(),

      // 4.2.14 Step 9: rastiAutomatusPagalFiltra (entity self-call)
      rastiAutomatusPagalFiltra: (filtras) => {
        const { search, status } = filtras;
        return get().machines.filter(m => {
          const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.address.toLowerCase().includes(search.toLowerCase());
          const matchStatus = !status || status === 'all' || m.status === status;
          return matchSearch && matchStatus;
        });
      },

      // 4.2.7 Aptarnauti automatą — gautiAutomata (entity self-call)
      gautiAutomata: (id) => get().machines.find(m => m.id === id),

      // 4.2.15 Sukurti automatą — PatikrintiDuomenis (entity self-call, step 8)
      patikrintiDuomenis: (m) => !!(m.name?.trim() && m.model?.trim() && m.address?.trim()),

      // 4.2.15 Sukurti automatą — IšsaugotiAutomatą (entity self-call, step 9)
      išsaugotiAutomatą: (m) => set(s => ({ machines: [...s.machines, { ...m, id: uid(), created_at: today() }] })),

      // 4.2.15 Sukurti automatą — sukurtiAutomatą (entity entry point, step 7)
      sukurtiAutomatą: (m) => {
        if (!get().patikrintiDuomenis(m)) return false;
        get().išsaugotiAutomatą(m);
        return true;
      },

      // 4.2.15 edit — atnaujintiAutomatą
      atnaujintiAutomatą: (id, m) => set(s => ({ machines: s.machines.map(x => x.id === id ? { ...x, ...m } : x) })),

      // 4.2.15 delete — pašalintiAutomatą
      pašalintiAutomatą: (id) => set(s => ({ machines: s.machines.filter(x => x.id !== id), machineProducts: s.machineProducts.filter(x => x.machine_id !== id) })),

      // 4.2.10 Pakeisti būseną — issaugotiAutomatoBusena (entity self-call)
      issaugotiAutomatoBusena: (id, būsena) => set(s => ({ machines: s.machines.map(x => x.id === id ? { ...x, status: būsena } : x) })),
      keistiAutomatoBūseną: (id, būsena) => get().issaugotiAutomatoBusena(id, būsena),

      // 4.2.10 Pakeisti būseną — issaugotiAutomatoPrekesBusena (entity self-call)
      issaugotiAutomatoPrekesBusena: (id, būsena) => set(s => ({ machineProducts: s.machineProducts.map(x => x.id === id ? { ...x, status: būsena } : x) })),

      // Products
      sukurtiPrekę: (p) => set(s => ({ products: [...s.products, { ...p, id: uid() }] })),
      atnaujintiPrekę: (id, p) => set(s => ({ products: s.products.map(x => x.id === id ? { ...x, ...p } : x) })),
      pašalintiPrekę: (id) => set(s => ({ products: s.products.filter(x => x.id !== id) })),

      // 4.2.12 Papildyti prekes — pridėtiPrekęAutomatui
      pridėtiPrekęAutomatui: (mp) => set(s => ({ machineProducts: [...s.machineProducts, { ...mp, id: uid() }] })),
      atnaujintiPrekęAutomatui: (id, mp) => set(s => ({ machineProducts: s.machineProducts.map(x => x.id === id ? { ...x, ...mp } : x) })),
      pašalintiPrekęAutomatui: (id) => set(s => ({ machineProducts: s.machineProducts.filter(x => x.id !== id) })),

      // 4.2.16 Tikrinti prekių galiojimo laikus — tikrintiPrekiųGaliojimą
      tikrintiPrekiųGaliojimą: () => {
        const dabar = new Date();
        const per7Dienų = new Date(dabar);
        per7Dienų.setDate(per7Dienų.getDate() + 7);
        set(s => ({
          machineProducts: s.machineProducts.map(mp => {
            if (!mp.expiry_date) return mp;
            const galiojimas = new Date(mp.expiry_date);
            if (galiojimas < dabar) return { ...mp, status: 'expired' as const };
            if (galiojimas <= per7Dienų) return { ...mp, status: 'expiring_soon' as const };
            return { ...mp, status: 'good' as const };
          }),
        }));
      },

      // 4.2.3 Registruoti — PatikrintiNaudotojoDuomenis (entity self-call, step 4)
      PatikrintiNaudotojoDuomenis: (u) => !!(u.first_name?.trim() && u.last_name?.trim() && u.email?.trim() && u.password?.trim()),

      // 4.2.3 Registruoti — issaugotiSukurtaNaudotoja (entity self-call, step 9)
      issaugotiSukurtaNaudotoja: (u) => set(s => ({ users: [...s.users, { ...u, id: uid(), created_at: today() }] })),

      // 4.2.3 Registruoti — registruotiNaudotoją (entity entry point)
      registruotiNaudotoją: (u) => {
        if (!get().PatikrintiNaudotojoDuomenis(u)) return false;
        get().issaugotiSukurtaNaudotoja(u);
        return true;
      },

      // 4.2.22 Redaguoti paskyros duomenis — atnaujintiNaudotoją
      atnaujintiNaudotoją: (id, u) => set(s => ({ users: s.users.map(x => x.id === id ? { ...x, ...u } : x) })),

      pašalintiNaudotoją: (id) => set(s => ({ users: s.users.filter(x => x.id !== id) })),

      // 4.2.1 Pakeisti naudotojo būseną — issaugotiNaudotojoBusena (entity self-call, step 21)
      issaugotiNaudotojoBusena: (id, būsena) => set(s => ({ users: s.users.map(x => x.id === id ? { ...x, status: būsena } : x) })),
      keistiNaudotojoBūseną: (id, būsena) => get().issaugotiNaudotojoBusena(id, būsena),

      // 4.2.2 Priskirti naudotojui teises/rolę — IssaugotiRole (entity self-call, step 21)
      IssaugotiRole: (id, rolė) => set(s => ({ users: s.users.map(x => x.id === id ? { ...x, role: rolė } : x) })),
      priskirtiNaudotojuiRolę: (id, rolė) => get().IssaugotiRole(id, rolė),

      // 4.2.7 Aptarnauti automatą / 4.2.17 Tvarkyti automatą — sukurtiUžduotį
      sukurtiUžduotį: (t) => set(s => ({ tasks: [...s.tasks, { ...t, id: uid(), created_at: today() }] })),
      atnaujintiUžduotį: (id, t) => set(s => ({ tasks: s.tasks.map(x => x.id === id ? { ...x, ...t } : x) })),
      pašalintiUžduotį: (id) => set(s => ({ tasks: s.tasks.filter(x => x.id !== id) })),
    }),
    { name: 'vendingos-store-v2' }
  )
);
