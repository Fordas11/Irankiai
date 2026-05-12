import { useMachinesViewModel } from "../viewmodels/MachinesViewModel";
import Modal from '../components/Modal';
import { AutomatoController } from "../controllers/AutomatoController";
import type { AutomatoBūsena } from "../types";

export default function MachineView() {
  const {
    search,
    setSearch,
    filterStatus,
    setFilterStatus,
    modal,
    setModal,
    selected,
    form,
    setForm,
    klaida,
    filtered,
    isAdmin,
    STATUSES,
    STATUS_LABEL,
    STATUS_STYLE,
    INPUT,
    pasirinktiSukurtiNaujaAutomata,
    redaguotiAutomata,
    patvirtintiAutomatoSalinima,
    uzdarytiModala,
    pateiktiAutomatoDuomenis,
    patvirtintiKurima,
  } = useMachinesViewModel();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Automatai</h1>
          <p className="text-sm text-slate-500 mt-1">Manage vending machines</p>
        </div>
        {/* Use case: Perziureti automatu sarasa. Sequence: step 15 (nuspausti sukurti automata)
                  Technikas ---> AutomatuSarasoLangas (boundary) */}
        {isAdmin && (
          <button onClick={pasirinktiSukurtiNaujaAutomata} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
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
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s as AutomatoBūsena]}</option>)}
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

            {/* Use case: Perziureti automatu sarasa. Sequence: step 2, step 7 
                    (Gauti visus automatus, atvaizduoti automatu sarasa) 
                        AutomatuSarasoLangas ---> AutomatoViewModelController (view model(controller))
                        AutomatuSarasoLangas <- - - AutomatoViewModelController (view model(controller))
                    Use case: Perziureti automatu sarasa. Sequence: step 9, step 14 
                    (filtruoti automatus pagal filtra, atvaizduoti filtruota automatu sarasa)
                        AutomatuSarasoLangas ---> AutomatoViewModelController (view model(controller))
                        AutomatuSarasoLangas <- - - AutomatoViewModelController (view model(controller))*/}
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4 font-medium text-slate-800">{m.name}</td>
                <td className="px-5 py-4 text-slate-600 font-mono text-xs">{m.model}</td>
                <td className="px-5 py-4 text-slate-600 max-w-50 truncate">{m.address}</td>
                <td className="px-5 py-4">
                  <select
                    value={m.status}
                    onChange={e => AutomatoController.keistiBusena('automatas', m.id, e.target.value as AutomatoBūsena, () => { })}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${STATUS_STYLE[m.status]}`}
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s as AutomatoBūsena]}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4 text-slate-700 font-medium">
                  {m.revenue_today > 0 ? `$${m.revenue_today.toLocaleString()}` : '—'}
                </td>
                <td className="px-5 py-4 text-slate-500">{m.last_serviced ?? '—'}</td>
                <td className="px-5 py-4">
                  <div className="flex gap-3">
                    <button onClick={() => redaguotiAutomata(m)} className="text-blue-600 hover:text-blue-800 text-xs font-medium">Edit</button>
                    {isAdmin && <button onClick={() => patvirtintiAutomatoSalinima(m)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>}
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
      {/* Use case: Perziureti automatu sarasa. Sequence: step 16 (atidaryti kurimo forma)
                  AutomatuSarasoLangas ---> AutomatoViewModelController (view model) 
                  
          Use case: Sukurti automata. Sequence: step 1 (pateikti automato duomenis)
                  Technikas ---> AutomatoKurimoLangas
          Use case: Sukurti automata. Sequence: step 9, 11 
          (atvaizduoti automata sarase, atvaizduoti klaida)
                  AutomatoKurimoLangas <- - - AutomatoViewModelController
                  AutomatoKurimoLangas <- - - AutomatoViewModelController*/}
          
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'add' ? 'Naujas automatas' : 'Edit Automatas'} onClose={uzdarytiModala} >
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
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s as AutomatoBūsena]}</option>)}
              </select>
            </Field>
            <Field label="Last Serviced">
              <input type="date" value={form.last_serviced ?? ''} onChange={e => setForm(f => ({ ...f, last_serviced: e.target.value || null }))} className={INPUT} />
            </Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={uzdarytiModala} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </form>
        </Modal>

      )}
      {/* Use case: Sukurti automata. Sequence: step 2, step3 (Patvirtinti automato kurima, inicijuoti automato kurima)
                  Technikas ---> AutomatoKurimoLangas
                  AutomatoKurimoLangas ---> AutomatoViewModelController  */}
      {modal === 'confirmCreate' && (
        <Modal title='Confirm creation' onClose={uzdarytiModala}>
          <p className="text-slate-600 mb-6">
            Create machine <strong>{form.name}</strong>?
          </p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setModal('add')}
              className='px-4 py-2.5 text-sm text-slate-600 hove:bg-slate-100 rounded-lg'>
                Back
            </button>
            <button onClick={patvirtintiKurima}
              className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Confirm
            </button>
          </div>
        </Modal>
      )}

      {modal === 'delete' && selected && (
        <Modal title="Confirm Deletion" onClose={uzdarytiModala}>
          <p className="text-slate-600 mb-6">Delete machine <strong>{selected.name}</strong>? This action cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={uzdarytiModala} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
            <button onClick={() => { AutomatoController.pašalintiAutomata(selected.id); uzdarytiModala(); }} className="px-4 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
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