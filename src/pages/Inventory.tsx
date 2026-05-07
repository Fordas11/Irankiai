import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import { PrekėsController } from '../controllers/PrekėsController';
import { AutomatoController } from '../controllers/AutomatoController';
import { InventoryIcon, ExclamationIcon, ClockIcon } from '../components/Icons';
import type { AutomatoPrekė, AutomatoPrekėsBūsena } from '../types';

const STATUS_LABEL: Record<AutomatoPrekėsBūsena, string> = {
  good: 'Good',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

const STATUS_STYLE: Record<AutomatoPrekėsBūsena, string> = {
  good: 'bg-green-100 text-green-700',
  expiring_soon: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
};

type Tab = 'all' | 'low_stock' | 'expiring';
type MPForm = Omit<AutomatoPrekė, 'id'>;

const INPUT = 'w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// Ribinė klasė: Pildyti prekes (Boundary) — paketas: Aptarnavimo
// Sekų diagrama: 4.2.12 Papildyti prekes
export default function PildytiPrekes() {
  const { machines, products, machineProducts } = useStore();
  const [tab, setTab] = useState<Tab>('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<AutomatoPrekė | null>(null);
  const [zinute, setZinute] = useState<string | null>(null);
  const [form, setForm] = useState<MPForm>({
    machine_id: machines[0]?.id ?? '',
    product_id: '',
    quantity: 10,
    max_quantity: 20,
    price: 1.0,
    refill_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    status: 'good',
  });

  const totalProducts = machineProducts.reduce((s, mp) => s + mp.quantity, 0);
  const lowStockItems = machineProducts.filter(mp => mp.quantity / mp.max_quantity < 0.3);
  const expiringSoon = machineProducts.filter(mp => mp.status === 'expiring_soon' || mp.status === 'expired');

  const filteredItems = (() => {
    if (tab === 'low_stock') return lowStockItems;
    if (tab === 'expiring') return expiringSoon;
    return machineProducts;
  })();

  const itemsByMachine = machines.map(m => ({
    machine: m,
    items: filteredItems.filter(mp => mp.machine_id === m.id),
  })).filter(g => g.items.length > 0);

  const getProductName = (id: string) => products.find(p => p.id === id)?.name ?? id;
  const getMachineName = (id: string) => machines.find(m => m.id === id)?.name ?? id;

  // 4.2.12 Step 13/16: sekmesZinute — atnaujinti boundary
  const sekmesZinute = () => { setZinute('Sėkmės žinutė'); setTimeout(() => setZinute(null), 2000); };

  // 4.2.12 Step 4: atidarytiPrekiuPildymoLange — boundary atvaizduoja pildymo formą
  const atidarytiPrekiuPildymoLange = () => {
    setForm({ machine_id: machines[0]?.id ?? '', product_id: '', quantity: 10, max_quantity: 20, price: 1.0, refill_date: new Date().toISOString().split('T')[0], expiry_date: '', status: 'good' });
    setModal('add');
  };

  // 4.2.12 Step 1: gautiPrekes — boundary → AutomatoController
  const pildytiPrekes = () => {
    if (machines[0]) AutomatoController.pildytiPrekes(machines[0].id, atidarytiPrekiuPildymoLange);
    else atidarytiPrekiuPildymoLange();
  };

  // pridetiPrekę — redaguotiPrekęAutomatui
  const redaguotiPrekęAutomatui = (mp: AutomatoPrekė) => { setSelected(mp); setForm({ ...mp }); setModal('edit'); };
  const patvirtintiPrekėsŠalinimą = (mp: AutomatoPrekė) => { setSelected(mp); setModal('delete'); };
  const uždarytiModalą = () => { setModal(null); setSelected(null); };

  // 4.2.12 Step 18: trauktiPrekes (boundary → AutomatoController → PrekėsController)
  // Step 22: pridetiPapildytasPrekes (PrekėsController → entity)
  const trauktiPrekes = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (modal === 'edit' && selected) {
      // Step 14: atnaujintiPrekiuSarasas
      PrekėsController.atnaujintiPrekiuSarasas(selected.id, form);
      sekmesZinute();
    } else {
      PrekėsController.pridetiPapildytasPrekes(form, sekmesZinute);
    }
    uždarytiModalą();
  };

  // 4.2.12 Step 10/11/12: isimtiPrekes (boundary → AutomatoController → PrekėsController → Preke)
  const isimtiPrekes = (mp: AutomatoPrekė) => {
    PrekėsController.isimtiPrekes([mp.id], sekmesZinute);
    uždarytiModalą();
  };

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'all', label: 'All Inventory', count: machineProducts.length },
    { key: 'low_stock', label: 'Low Stock', count: lowStockItems.length },
    { key: 'expiring', label: 'Expiring Soon', count: expiringSoon.length },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Inventory Management</h1>
          <p className="text-sm text-slate-500 mt-1">Track stock levels and product expiration dates</p>
        </div>
        <button onClick={pildytiPrekes} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Add Product
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard
          icon={<InventoryIcon className="w-5 h-5" />}
          iconBg="bg-blue-50 text-blue-600"
          value={totalProducts}
          label="Total Products"
          sub={`Across ${machines.length} machines`}
        />
        <StatCard
          icon={<ExclamationIcon className="w-5 h-5" />}
          iconBg="bg-red-50 text-red-600"
          value={lowStockItems.length}
          label="Low Stock Items"
          sub="Need immediate refill"
        />
        <StatCard
          icon={<ClockIcon className="w-5 h-5" />}
          iconBg="bg-orange-50 text-orange-600"
          value={expiringSoon.length}
          label="Expiring Soon"
          sub="Within 7 days"
        />
      </div>

      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
          >
            {t.label}
            {t.count > 0 && tab !== t.key && <span className="ml-1.5 text-xs bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-full">{t.count}</span>}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {itemsByMachine.map(({ machine, items }) => (
          <div key={machine.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-800 text-sm">{machine.name}</span>
                <span className="text-xs text-slate-500 ml-2">{machine.address}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{machine.model}</span>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Stock</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Price</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Expires</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 font-medium text-slate-500 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const pct = item.quantity / item.max_quantity;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-800">{getProductName(item.product_id)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${pct < 0.3 ? 'bg-red-400' : pct < 0.6 ? 'bg-yellow-400' : 'bg-green-400'}`} style={{ width: `${pct * 100}%` }} />
                          </div>
                          <span className="text-xs text-slate-600 w-12">{item.quantity} / {item.max_quantity}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">${item.price.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">{item.expiry_date}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[item.status]}`}>{STATUS_LABEL[item.status]}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-3">
                          <button onClick={() => redaguotiPrekęAutomatui(item)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                          <button onClick={() => patvirtintiPrekėsŠalinimą(item)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
        {itemsByMachine.length === 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">No items found</div>
        )}
      </div>

      {zinute && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm z-50">{zinute}</div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Papildyti prekes' : 'Edit Inventory Item'} onClose={uždarytiModalą}>
          <form onSubmit={trauktiPrekes} className="space-y-5">
            <Field label="Machine" required>
              <select required value={form.machine_id} onChange={e => setForm(f => ({ ...f, machine_id: e.target.value }))} className={INPUT}>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <Field label="Product" required>
              <select required value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))} className={INPUT}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.category})</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Quantity" required>
                <input required type="number" min={0} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: +e.target.value }))} className={INPUT} />
              </Field>
              <Field label="Max Quantity" required>
                <input required type="number" min={1} value={form.max_quantity} onChange={e => setForm(f => ({ ...f, max_quantity: +e.target.value }))} className={INPUT} />
              </Field>
            </div>
            <Field label="Price ($)" required>
              <input required type="number" step="0.01" min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: +e.target.value }))} className={INPUT} />
            </Field>
            <Field label="Expiry Date" required>
              <input required type="date" value={form.expiry_date} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value }))} className={INPUT} />
            </Field>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AutomatoPrekėsBūsena }))} className={INPUT}>
                <option value="good">Good</option>
                <option value="expiring_soon">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={uždarytiModalą} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Išimti prekes" onClose={uždarytiModalą}>
          <p className="text-slate-600 mb-6">Remove <strong>{getProductName(selected.product_id)}</strong> from <strong>{getMachineName(selected.machine_id)}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={uždarytiModalą} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => isimtiPrekes(selected)} className="px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Išimti</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ icon, iconBg, value, label, sub }: { icon: React.ReactNode; iconBg: string; value: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${iconBg}`}>{icon}</div>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className="text-sm text-slate-600 mt-1">{label}</div>
      <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      {children}
    </div>
  );
}
