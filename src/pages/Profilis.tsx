import { useState } from 'react';
import { useStore } from '../store/useStore';
import Modal from '../components/Modal';
import { NaudotojoController } from '../controllers/NaudotojoController';
import type { NaudotojoBūsena } from '../types';

const STATUS_LABEL: Record<NaudotojoBūsena, string> = {
  active: 'Dirba',
  vacation: 'Atostogauja',
  sick: 'Serga',
  inactive: 'Nedirba',
  terminated: 'Nebedirba',
};

const STATUS_STYLE: Record<NaudotojoBūsena, string> = {
  active: 'bg-green-100 text-green-700',
  vacation: 'bg-blue-100 text-blue-700',
  sick: 'bg-orange-100 text-orange-700',
  inactive: 'bg-slate-100 text-slate-600',
  terminated: 'bg-red-100 text-red-700',
};

const ROLE_LABELS: Record<string, string> = {
  administrator: 'Administrator',
  attendant: 'Attendant',
  technician: 'Technician',
};

// Ribinė klasė: Profilis (Boundary) — paketas: Naudotojas
// Sekų diagrama: 4.2.19 Pakeisti darbo būseną
export default function Profilis() {
  const { currentUser } = useStore();
  const [busenaModal, setBusenaModal] = useState(false);
  const [pasirinktaBusena, setPasirinktaBusena] = useState<NaudotojoBūsena>(currentUser?.status ?? 'active');
  const [zinute, setZinute] = useState<string | null>(null);

  if (!currentUser) return null;

  // 4.2.19 Step 4: Naudotojui parodoma "Pakeisti būseną" forma
  const rodytPakeistiBusenaNaudotojo = () => {
    setPasirinktaBusena(currentUser.status);
    setBusenaModal(true);
  };

  // 4.2.19 Step 11: Sėkmės žinutė (NaudotojoController → Profilis → Naudotojas)
  const sekmesZinute = () => {
    setZinute('Sėkmingai išsaugota būsena');
    setTimeout(() => setZinute(null), 2500);
  };

  // 4.2.19 Step 5: pakeistiBusenaNaudotojo (user pasirenka)
  const pakeistiBusenaNaudotojo = (b: NaudotojoBūsena) => {
    setPasirinktaBusena(b);
  };

  // 4.2.19 Step 6/7: issaugotiNaudotojoBusena (Profilis → NaudotojoController → entity)
  const issaugotiNaudotojoBusena = () => {
    NaudotojoController.issaugotiNaudotojoBusena(currentUser.id, pasirinktaBusena);
    setBusenaModal(false);
    sekmesZinute();
  };

  const busenos: NaudotojoBūsena[] = NaudotojoController.gautiNaudotojuBusenas();

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-xl font-bold text-slate-800 mb-1">Profilis</h1>
      <p className="text-sm text-slate-500 mb-6">Naudotojo nustatymai ir darbo būsena</p>

      {/* 4.2.19 Step 2: "Profilis" forma */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xl">
            {currentUser.first_name[0]}{currentUser.last_name[0]}
          </div>
          <div>
            <div className="text-lg font-semibold text-slate-800">{currentUser.first_name} {currentUser.last_name}</div>
            <div className="text-sm text-slate-500">{ROLE_LABELS[currentUser.role]}</div>
          </div>
        </div>

        <Field label="El. paštas">{currentUser.email}</Field>
        <Field label="Rolė">{ROLE_LABELS[currentUser.role]}</Field>
        <Field label="Sukurta">{currentUser.created_at}</Field>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Darbo būsena</label>
          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[currentUser.status]}`}>
              {STATUS_LABEL[currentUser.status]}
            </span>
            <button
              onClick={rodytPakeistiBusenaNaudotojo}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Pakeisti būseną
            </button>
          </div>
        </div>
      </div>

      {/* 4.2.19 Step 4: "Pakeisti būseną" forma */}
      {busenaModal && (
        <Modal title="Pakeisti darbo būseną" onClose={() => setBusenaModal(false)}>
          <div className="space-y-3 mb-6">
            {busenos.map(b => (
              <label key={b} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="busena"
                  checked={pasirinktaBusena === b}
                  onChange={() => pakeistiBusenaNaudotojo(b)}
                />
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[b]}`}>{STATUS_LABEL[b]}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setBusenaModal(false)} className="px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Atšaukti</button>
            {/* 4.2.19 Step 6: issaugotiNaudotojBusena */}
            <button onClick={issaugotiNaudotojoBusena} className="px-4 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">Išsaugoti</button>
          </div>
        </Modal>
      )}

      {zinute && (
        <div className="fixed top-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-lg text-sm z-50">{zinute}</div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  );
}
