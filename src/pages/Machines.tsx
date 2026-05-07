import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import { AutomatoController } from '../controllers/AutomatoController';
import type { Automatas, AutomatoBūsena } from '../types';

const STATUS_LABEL: Record<AutomatoBūsena, string> = {
  operational: 'Operational',
  offline: 'Offline',
  needs_service: 'Needs Service',
  broken: 'Broken',
  maintenance: 'Maintenance',
  servicing: 'Servicing',
};

const STATUS_STYLE: Record<AutomatoBūsena, string> = {
  operational: 'bg-green-100 text-green-700',
  offline: 'bg-slate-100 text-slate-600',
  needs_service: 'bg-yellow-100 text-yellow-700',
  broken: 'bg-red-100 text-red-700',
  maintenance: 'bg-blue-100 text-blue-700',
  servicing: 'bg-purple-100 text-purple-700',
};

const STATUSES: AutomatoBūsena[] = ['operational', 'offline', 'needs_service', 'broken', 'maintenance', 'servicing'];

type FormData = Omit<Automatas, 'id' | 'created_at' | 'revenue_today'>;

const INPUT = 'w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// Ribinės klasės: AutomatuSarasoLangas + AutomatoKurimoLangas (Boundary) — paketas: Administracijos
// Sekų diagramos: 4.2.10 Pakeisti būseną, 4.2.14 Peržiūrėti automatų sąrašą, 4.2.15 Sukurti automatą
export default function AutomatuSarasoLangas() {
  // useStore subscription needed so component re-renders when machines change
  useStore(s => s.machines);
  const { currentUser } = useStore();
  const isAdmin = currentUser?.role === 'administrator';

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Automatas | null>(null);
  const [form, setForm] = useState<FormData>(AutomatoController.atidarytiKūrimoFormą());
  const [klaida, setKlaida] = useState<string | null>(null);

  // 4.2.14 Step 1: atidarytiAutomatuSarasoLanga (technikas → boundary)
  // Step 2/3/4: gautiVisusAutomatus → rastiVisusAutomatus → sąrašas
  // Step 8/9/10: filtruotiAutomatus → rastiAutomatusPagalFiltra → filtruotas sąrašas
  // Step 5/11: rodyt(Filtruota)AutomatuSarasa
  const filtered = AutomatoController.filtruotiAutomatus({ search, status: filterStatus });

  // Step 3: AutomatoController → AutomatoKūrimoLangas
  const rodytikūrimoFormą = (pradiniai: FormData) => { setForm(pradiniai); setKlaida(null); setModal('add'); };

  // Step 1: Technikas → AutomatoKūrimoLangas
  const pasirinktiSukurtiNaująAutomatą = () => {
    const pradiniai = AutomatoController.atidarytiKūrimoFormą();
    rodytikūrimoFormą(pradiniai);
  };

  // Step 11: AutomatoController → AutomatoKūrimoLangas (sėkmės atveju)
  const atvaizduotiSukurtąAutomatąSąraše = () => { uždarytiModalą(); };

  // Step 13: AutomatoController → AutomatoKūrimoLangas (klaidos atveju)
  const rodytikKlaidosPranešimą = (klaida: string) => { setKlaida(klaida); };

  const redaguotiAutomatą = (m: Automatas) => {
    setSelected(m);
    setForm({ name: m.name, model: m.model, address: m.address, longitude: m.longitude, latitude: m.latitude, status: m.status, last_serviced: m.last_serviced });
    setModal('edit');
  };
  const patvirtintiAutomatoŠalinimą = (m: Automatas) => { setSelected(m); setModal('delete'); };
  const uždarytiModalą = () => { setModal(null); setSelected(null); setKlaida(null); };

  // Step 5: Technikas → AutomatoKūrimoLangas (pateikia duomenis)
  const pateiktiAutomatoDuomenis = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (modal === 'edit' && selected) {
      AutomatoController.atnaujintiAutomata(selected.id, form);
      uždarytiModalą();
      return;
    }
    // Step 6: AutomatoKūrimoLangas → AutomatoController
    AutomatoController.PatvirtintiAutomatoKūrimą(form, atvaizduotiSukurtąAutomatąSąraše, rodytikKlaidosPranešimą);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Automatai</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vending machines</p>
        </div>
        {isAdmin && (
          <button onClick={pasirinktiSukurtiNaująAutomatą} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            + Naujas automatas
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-4">
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
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Model</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Address</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Revenue Today</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Last Serviced</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                <td className="px-5 py-4 text-slate-600 font-mono text-xs">{m.model}</td>
                <td className="px-5 py-4 text-slate-600 max-w-[200px] truncate">{m.address}</td>
                <td className="px-5 py-4">
                  {/* 4.2.10 Pakeisti būseną — Step 1: keistiAutomatoBusena (boundary) → Step 3: keistiBusena (controller) */}
                  <select
                    value={m.status}
                    onChange={e => AutomatoController.keistiBusena('automatas', m.id, e.target.value as AutomatoBūsena, () => {})}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLE[m.status]}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4 text-slate-700 font-medium">
                  {m.revenue_today > 0 ? `$${m.revenue_today.toLocaleString()}` : '—'}
                </td>
                <td className="px-5 py-4 text-slate-500">{m.last_serviced ?? '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => redaguotiAutomatą(m)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                    {isAdmin && <button onClick={() => patvirtintiAutomatoŠalinimą(m)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400">No machines found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Naujas automatas' : 'Edit Automatas'} onClose={uždarytiModalą}>
          <form onSubmit={pateiktiAutomatoDuomenis} className="space-y-5">
            {klaida && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{klaida}</p>}
            <Field label="Name" required>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} />
            </Field>
            <Field label="Model" required>
              <input required value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} className={INPUT} />
            </Field>
            <Field label="Address" required>
              <input required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={INPUT} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Latitude">
                <input type="number" step="0.0001" value={form.latitude} onChange={e => setForm(f => ({ ...f, latitude: +e.target.value }))} className={INPUT} />
              </Field>
              <Field label="Longitude">
                <input type="number" step="0.0001" value={form.longitude} onChange={e => setForm(f => ({ ...f, longitude: +e.target.value }))} className={INPUT} />
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AutomatoBūsena }))} className={INPUT}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
            </Field>
            <Field label="Last Serviced">
              <input type="date" value={form.last_serviced ?? ''} onChange={e => setForm(f => ({ ...f, last_serviced: e.target.value || null }))} className={INPUT} />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={uždarytiModalą} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </form>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Confirm Deletion" onClose={uždarytiModalą}>
          <p className="text-slate-600 mb-6">Delete machine <strong>{selected.name}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={uždarytiModalą} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => { AutomatoController.pašalintiAutomata(selected.id); uždarytiModalą(); }} className="px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}
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
