import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import { AdminoController } from '../controllers/AdminoController';
import { NaudotojoController } from '../controllers/NaudotojoController';
import type { Naudotojas, NaudotojoRolė, NaudotojoBūsena } from '../types';

const ROLE_LABEL: Record<NaudotojoRolė, string> = {
  administrator: 'Administrator',
  attendant: 'Attendant',
  technician: 'Technician',
};

const STATUS_LABEL: Record<NaudotojoBūsena, string> = {
  active: 'Active',
  vacation: 'Vacation',
  sick: 'Sick Leave',
  inactive: 'Inactive',
  terminated: 'Terminated',
};

const STATUS_STYLE: Record<NaudotojoBūsena, string> = {
  active: 'bg-green-100 text-green-700',
  vacation: 'bg-blue-100 text-blue-700',
  sick: 'bg-orange-100 text-orange-700',
  inactive: 'bg-slate-100 text-slate-600',
  terminated: 'bg-red-100 text-red-700',
};

type UserForm = Omit<Naudotojas, 'id' | 'created_at'>;

const EMPTY: UserForm = {
  first_name: '',
  last_name: '',
  email: '',
  password: '',
  role: 'attendant',
  status: 'active',
};

const INPUT = 'w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// Ribinės klasės: NaudotojuSarasas + Naudotojo nustatymai + Registruoti (Boundary) — paketas: Administracijos
// Sekų diagramos: 4.2.1 Pakeisti naudotojo būseną, 4.2.2 Priskirti naudotojui teises/rolę, 4.2.3 Registruoti
export default function NaudotojuSarasas() {
  const { currentUser } = useStore();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<Naudotojas | null>(null);
  const [form, setForm] = useState<UserForm>(EMPTY);
  const [klaida, setKlaida] = useState<string | null>(null);

  // 4.2.1 Step 2: NaudotojuSarasas → AdminoController
  const ns = AdminoController.gautiNaudotojuSarasa();

  // 4.2.1 Step 5/6: atvaizduoti ns
  const filtered = ns.filter(u =>
    `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  // 4.2.3 Registruoti — Step 1: Admin → Registruoti(boundary)
  const naudotojoKurimas = () => {
    setForm(EMPTY);
    setKlaida(null);
    setModal('add');
  };

  // 4.2.1 Step 7/8: pasirinktiNaudotoja → atidarytiNaudotoja
  const pasirinktiNaudotoja = (u: Naudotojas) => {
    const n = AdminoController.atidarytiNaudotoja(u.id);
    if (!n) return;
    atidarytin(n);
  };

  // 4.2.1 Step 10/11: atidarytin → atvaizduoti n (Naudotojo nustatymai boundary)
  const atidarytin = (n: Naudotojas) => {
    setSelected(n);
    setForm({
      first_name: n.first_name,
      last_name: n.last_name,
      email: n.email,
      password: n.password,
      role: n.role,
      status: n.status,
    });
    setKlaida(null);
    setModal('edit');
  };

  const patvirtintiNaudotojoŠalinimą = (u: Naudotojas) => {
    setSelected(u);
    setModal('delete');
  };

  const uždarytiModalą = () => {
    setModal(null);
    setSelected(null);
    setKlaida(null);
  };

  // 4.2.3 Step 6: Siusti pranesima, kad blogi duomenys (NaudotojoController → boundary)
  const siustiPranesima = (žinute: string) => {
    setKlaida(žinute);
  };

  // 4.2.3 Step 11/12: Sekmingai sukurtas naudotojas/vartotojas (NaudotojoController → boundary)
  const naudotojasSukurtas = () => {
    uždarytiModalą();
  };

  // 4.2.1 Step 19/20: issaugotiBusena (Naudotojo nustatymai → NaudotojoController)
  // 4.2.2 Step 19/20: pasirinktiRole / IssaugotiRole
  // 4.2.3 Step 3: naudotojoIvedimas (Admin → Registruoti boundary)
  const naudotojoIvedimas = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (modal === 'edit' && selected) {
      // 4.2.1: issaugotiBusena, 4.2.2: IssaugotiRole — pakeitimai išsaugojami
      NaudotojoController.issaugotiNaudotoja(selected.id, form);
      uždarytiModalą();
      return;
    }
    // 4.2.3 Step 4: PatikrintiNaudotojoDuomenis (boundary → AdminoController/NaudotojoController)
    AdminoController.PatikrintiNaudotojoDuomenis(form, siustiPranesima, () => {
      // Step 7: pasirinktiRole — rolė jau pasirinkta formoje (ref Priskirti naudotojui teises/role)
      // Step 8/9: issaugotiSukurtaNaudotoja
      AdminoController.issaugotiSukurtaNaudotoja(form, naudotojasSukurtas);
    });
  };

  // 4.2.1 Step 13: gautiNaudotojuBusenas (Naudotojo nustatymai → NaudotojoController)
  const busenos = NaudotojoController.gautiNaudotojuBusenas();
  // 4.2.2 Step 13: rolesMenu
  const roles = NaudotojoController.rolesMenu();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system users and permissions</p>
        </div>
        <button onClick={naudotojoKurimas} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + New User
        </button>
      </div>

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full mb-4 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Name</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Email</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Role</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Created</th>
              <th className="text-left px-5 py-4 font-medium text-slate-500 text-xs uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-medium text-xs shrink-0">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <div>
                      <div className="font-medium text-slate-800">{u.first_name} {u.last_name}</div>
                      {u.id === currentUser?.id && <div className="text-xs text-blue-500">You</div>}
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-slate-600">{u.email}</td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-medium">{ROLE_LABEL[u.role]}</span>
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[u.status]}`}>{STATUS_LABEL[u.status]}</span>
                </td>
                <td className="px-5 py-4 text-slate-500">{u.created_at}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => pasirinktiNaudotoja(u)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                    {u.id !== currentUser?.id && (
                      <button onClick={() => patvirtintiNaudotojoŠalinimą(u)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-400">No users found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Naujas naudotojas (Registruoti)' : 'Naudotojo nustatymai'} onClose={uždarytiModalą}>
          <form onSubmit={naudotojoIvedimas} className="space-y-5">
            {klaida && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{klaida}</p>}
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className={INPUT} />
              </Field>
              <Field label="Last Name" required>
                <input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className={INPUT} />
              </Field>
            </div>
            <Field label="Email" required>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={INPUT} />
            </Field>
            <Field label="Password" required={modal === 'add'}>
              <input
                type="password"
                required={modal === 'add'}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder={modal === 'edit' ? 'Leave blank to keep unchanged' : ''}
                className={INPUT}
              />
            </Field>
            {/* 4.2.2 Priskirti naudotojui teises/rolę — pasirinktiRole */}
            <Field label="Role">
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as NaudotojoRolė }))} className={INPUT}>
                {roles.map(r => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
              </select>
            </Field>
            {/* 4.2.1 Pakeisti naudotojo būseną — paspaustiBusena → atvaizduotiDropdown b */}
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as NaudotojoBūsena }))} className={INPUT}>
                {busenos.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
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
        <Modal title="Confirm Deletion" onClose={uždarytiModalą}>
          <p className="text-slate-600 mb-6">Delete user <strong>{selected.first_name} {selected.last_name}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={uždarytiModalą} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => { AdminoController.pašalintiNaudotoja(selected.id); uždarytiModalą(); }} className="px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
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
