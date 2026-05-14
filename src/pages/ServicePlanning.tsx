import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import { DienotvarkėsController } from '../controllers/DienotvarkėsController';
import { AutomatoController } from '../controllers/AutomatoController';
import { ClipboardIcon, CheckCircleIcon, ClockIcon, UserIcon, CalendarIcon } from '../components/Icons';
import type { Dienotvarkė, DienotvarkėsBūsena, DienotvarkėsTipas, DienotvarkėsPrioritetas, Automatas } from '../types';

const PRIORITY_STYLE: Record<DienotvarkėsPrioritetas, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-green-100 text-green-700',
};

const TYPE_STYLE: Record<DienotvarkėsTipas, string> = {
  refill: 'bg-blue-100 text-blue-700',
  maintenance: 'bg-slate-100 text-slate-700',
  repair: 'bg-orange-100 text-orange-700',
};

const STATUS_STYLE: Record<DienotvarkėsBūsena, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
};

const USER_STATUS_STYLE: Record<string, string> = {
  active: 'text-green-600',
  vacation: 'text-orange-500',
  sick: 'text-red-500',
  inactive: 'text-slate-400',
  terminated: 'text-slate-400',
};

type TaskTab = 'pending' | 'in_progress' | 'all';

type TaskForm = Omit<Dienotvarkė, 'id' | 'created_at'>;
const EMPTY_FORM: TaskForm = {
  machine_id: '',
  assigned_to: null,
  type: 'refill',
  priority: 'medium',
  status: 'pending',
  description: '',
  scheduled_date: new Date().toISOString().split('T')[0],
};

const INPUT = 'w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

// Ribinės klasės: PagrindinisLangas + Atvaizduoti dienotvarke + Automato informacija (Boundary) — paketas: Dienotvarkės
// Sekų diagramos: 4.2.7 Aptarnauti/tvarkyti automatą, 4.2.9 Gauti dienotvarkę
export default function AtvaizduotiDienotvarke() {
  const { machines, users, tasks, currentUser } = useStore();
  const [tab, setTab] = useState<TaskTab>('pending');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | 'info' | null>(null);
  const [selected, setSelected] = useState<Dienotvarkė | null>(null);
  const [form, setForm] = useState<TaskForm>({ ...EMPTY_FORM, machine_id: machines[0]?.id ?? '' });
  const [automatoInformacija, setAutomatoInformacija] = useState<Automatas | null>(null);
  const [zinute, setZinute] = useState<string | null>(null);

  const staff = users.filter(u => u.role === 'attendant' || u.role === 'technician');
  const availableStaff = staff.filter(u => u.status === 'active').length;

  const pending = tasks.filter(t => t.status === 'pending');
  const inProgress = tasks.filter(t => t.status === 'in_progress');
  const completed = tasks.filter(t => t.status === 'completed');

  const visibleTasks = tab === 'pending' ? pending : tab === 'in_progress' ? inProgress : tasks;

  const getMachineName = (id: string) => machines.find(m => m.id === id)?.name ?? id;
  const getUserName = (id: string | null) => {
    if (!id) return null;
    const u = users.find(u => u.id === id);
    return u ? `${u.first_name} ${u.last_name}` : null;
  };

  // 4.2.7 Step 13/16/20: sekmesZinute
  const sekmesZinute = () => { setZinute('Sėkmės žinutė'); setTimeout(() => setZinute(null), 2000); };

  // 4.2.7 Step 4: atvaizduotiDienotvarke (DienotvarkėsController → boundary)
  const atvaizduotiDienotvarke = (dt: Dienotvarkė[]) => {
    setTab('pending');
    setZinute(dt.length > 0 ? `Sugeneruota dienotvarkė: ${dt.length} užduotys` : 'Dienotvarkei tinkamų automatų nerasta');
    setTimeout(() => setZinute(null), 2500);
  };

  // 4.2.7 Step 1/2: generuotiDienotvarke (PagrindinisLangas → DienotvarkėsController)
  const generuotiDienotvarke = () => {
    const role = currentUser?.role ?? 'attendant';
    DienotvarkėsController.generuotiDienotvarke(role, atvaizduotiDienotvarke);
  };

  // 4.2.7 Step 9: grazintiAutomatoInformacija (AutomatoController → boundary)
  const grazintiAutomatoInformacija = (a: Automatas) => {
    setAutomatoInformacija(a);
    setModal('info');
  };

  // 4.2.7 Step 5/6: atidarytAutomatoInformacija (boundary → AutomatoController)
  const atidarytAutomatoInformacija = (machineId: string) => {
    const a = AutomatoController.atidarytAutomatoInformacija(machineId);
    if (a) grazintiAutomatoInformacija(a);
  };

  // 4.2.7 Step 10/11: pildytiPrekes (boundary → AutomatoController) → ref Papildyti prekes → sekmesZinute
  const pildytiPrekes = () => {
    if (!automatoInformacija) return;
    AutomatoController.pildytiPrekes(automatoInformacija.id, sekmesZinute);
    setAutomatoInformacija(AutomatoController.gautiAutomata(automatoInformacija.id) ?? null);
  };

  // 4.2.7 Step 14/15: pildytiGraza (boundary → AutomatoController) → ref Papildyti grąžą → sekmesZinute
  const pildytiGraza = () => {
    if (!automatoInformacija) return;
    AutomatoController.pildytiGraza(automatoInformacija.id, sekmesZinute);
    setAutomatoInformacija(AutomatoController.gautiAutomata(automatoInformacija.id) ?? null);
  };

  // 4.2.7 Step 18/19: tvarkytiAutomata (boundary → AutomatoController) → ref Tvarkyti automatą → sekmesZinute
  const tvarkytiAutomata = () => {
    if (!automatoInformacija) return;
    AutomatoController.tvarkytiAutomata(automatoInformacija.id, sekmesZinute);
    setAutomatoInformacija(AutomatoController.gautiAutomata(automatoInformacija.id) ?? null);
  };

  // redaguoti užduotį
  const redaguotiUžduotį = (t: Dienotvarkė) => { setSelected(t); setForm({ machine_id: t.machine_id, assigned_to: t.assigned_to, type: t.type, priority: t.priority, status: t.status, description: t.description, scheduled_date: t.scheduled_date }); setModal('edit'); };
  const patvirtintiUžduotiesŠalinimą = (t: Dienotvarkė) => { setSelected(t); setModal('delete'); };
  const uždarytiModalą = () => { setModal(null); setSelected(null); setAutomatoInformacija(null); };

  // 4.2.7/4.2.17 — išsaugotiUžduotį (CRUD operacija)
  const išsaugotiUžduotį = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (modal === 'add') DienotvarkėsController.sukurtiUžduotį(form);
    else if (modal === 'edit' && selected) DienotvarkėsController.atnaujintiUžduotį(selected.id, form);
    uždarytiModalą();
  };

  const getStaffTaskCount = (userId: string) => tasks.filter(t => t.assigned_to === userId && t.status !== 'completed').length;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Service Planning</h1>
          <p className="text-sm text-slate-500 mt-1">Manage service schedules and task assignments</p>
        </div>
        <button onClick={generuotiDienotvarke} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          + Generuoti dienotvarkę
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending Tasks', value: pending.length, Icon: ClipboardIcon, bg: 'bg-yellow-50 text-yellow-600' },
          { label: 'In Progress', value: inProgress.length, Icon: ClockIcon, bg: 'bg-blue-50 text-blue-600' },
          { label: 'Completed', value: completed.length, Icon: CheckCircleIcon, bg: 'bg-green-50 text-green-600' },
          { label: 'Available Staff', value: `${availableStaff}/${staff.length}`, Icon: UserIcon, bg: 'bg-slate-50 text-slate-600' },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.bg}`}>
              <c.Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-800">{c.value}</div>
            <div className="text-sm text-slate-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
            {([['pending', 'Pending'], ['in_progress', 'In Progress'], ['all', 'All Tasks']] as [TaskTab, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {tab === 'pending' && pending.length > 0 && (
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1 mb-2">Pending Service Tasks</div>
            )}
            {visibleTasks.map(task => (
              <div key={task.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-slate-800 text-sm">{getMachineName(task.machine_id)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_STYLE[task.type]}`}>{task.type}</span>
                      {tab === 'all' && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLE[task.status]}`}>{task.status.replace('_', ' ')}</span>}
                    </div>
                    <p className="text-sm text-slate-600">{task.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {task.scheduled_date}
                      </span>
                      {getUserName(task.assigned_to) && (
                        <span className="flex items-center gap-1">
                          <UserIcon className="w-3.5 h-3.5" />
                          {getUserName(task.assigned_to)}
                        </span>
                      )}
                      {!task.assigned_to && <span className="text-orange-500">Unassigned</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => atidarytAutomatoInformacija(task.machine_id)} className="px-3 py-1.5 text-xs font-medium border border-blue-300 rounded-lg hover:bg-blue-50 text-blue-700">Info</button>
                    <button onClick={() => redaguotiUžduotį(task)} className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700">Edit</button>
                    <button onClick={() => patvirtintiUžduotiesŠalinimą(task)} className="px-3 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg border border-red-200">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {visibleTasks.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-slate-400">No tasks found</div>
            )}
          </div>
        </div>

        <div className="w-64 shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-800 text-sm">Technicians</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {staff.map(u => {
                const taskCount = getStaffTaskCount(u.id);
                const isAvailable = u.status === 'active';
                return (
                  <div key={u.id} className="px-5 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-medium text-slate-600 shrink-0">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800">{u.first_name} {u.last_name}</div>
                      <div className="text-xs text-slate-400">Tasks today: {taskCount}</div>
                    </div>
                    <span className={`text-xs font-medium ${USER_STATUS_STYLE[u.status]}`}>
                      {isAvailable ? 'available' : u.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'New Service Task' : 'Edit Task'} onClose={uždarytiModalą}>
          <form onSubmit={išsaugotiUžduotį} className="space-y-5">
            <Field label="Machine" required>
              <select required value={form.machine_id} onChange={e => setForm(f => ({ ...f, machine_id: e.target.value }))} className={INPUT}>
                {machines.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Type">
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DienotvarkėsTipas }))} className={INPUT}>
                  <option value="refill">Refill</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                </select>
              </Field>
              <Field label="Priority">
                <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as DienotvarkėsPrioritetas }))} className={INPUT}>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Field>
            </div>
            <Field label="Status">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as DienotvarkėsBūsena }))} className={INPUT}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </Field>
            <Field label="Assign To">
              <select value={form.assigned_to ?? ''} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value || null }))} className={INPUT}>
                <option value="">Unassigned</option>
                {staff.filter(u => u.status === 'active').map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}
              </select>
            </Field>
            <Field label="Scheduled Date" required>
              <input required type="date" value={form.scheduled_date} onChange={e => setForm(f => ({ ...f, scheduled_date: e.target.value }))} className={INPUT} />
            </Field>
            <Field label="Description">
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className={INPUT + ' resize-none'} />
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
          <p className="text-slate-600 mb-6">Delete this service task for <strong>{getMachineName(selected.machine_id)}</strong>?</p>
          <div className="flex justify-end gap-3">
            <button onClick={uždarytiModalą} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => { DienotvarkėsController.pašalintiUžduotį(selected.id); uždarytiModalą(); }} className="px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
          </div>
        </Modal>
      )}

      {/* 4.2.7 Automato informacija boundary */}
      {modal === 'info' && automatoInformacija && (
        <Modal title="Automato informacija" onClose={uždarytiModalą}>
          <div className="space-y-3 mb-6">
            <div><span className="text-slate-500 text-sm">Pavadinimas:</span> <strong>{automatoInformacija.name}</strong></div>
            <div><span className="text-slate-500 text-sm">Modelis:</span> {automatoInformacija.model}</div>
            <div><span className="text-slate-500 text-sm">Adresas:</span> {automatoInformacija.address}</div>
            <div><span className="text-slate-500 text-sm">Būsena:</span> {automatoInformacija.status}</div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* 4.2.7 Step 10: pildytiPrekes */}
            <button onClick={pildytiPrekes} className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Pildyti prekes</button>
            {/* 4.2.7 Step 14: pildytiGraza */}
            <button onClick={pildytiGraza} className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">Pildyti grąžą</button>
            {/* 4.2.7 Step 18: tvarkytiAutomata */}
            <button onClick={tvarkytiAutomata} className="px-3 py-2 text-sm bg-orange-600 text-white rounded-lg hover:bg-orange-700">Tvarkyti automatą</button>
            <button onClick={uždarytiModalą} className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg ml-auto">Uždaryti</button>
          </div>
        </Modal>
      )}

      {zinute && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm z-50">{zinute}</div>
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
