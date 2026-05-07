// PrekėsController — kontroleris, atsakingas už prekių valdymą (<<control>>)
// Sekų diagramos: 4.2.12 Papildyti prekes, 4.2.16 Tikrinti prekių galiojimo laikus
import { useStore } from '../store/useStore';
import type { AutomatoPrekė, Prekė } from '../types';

export const PrekėsController = {
  // 4.2.12 Step 12: AutomatoController → PrekėsController → Prekė(entity) — išimtiPrekes
  isimtiPrekes: (
    prekiuId: string[],
    sekmesZinute: () => void
  ): void => {
    prekiuId.forEach(id => useStore.getState().pašalintiPrekęAutomatui(id));
    sekmesZinute();
  },

  // 4.2.12 Step 14: PrekėsController → boundary — atnaujintiPrekiuSarasas
  atnaujintiPrekiuSarasas: (id: string, duomenys: Partial<AutomatoPrekė>): void => {
    useStore.getState().atnaujintiPrekęAutomatui(id, duomenys);
  },

  // 4.2.12 Step 20: AutomatoController → PrekėsController → Automato_preke — gautiPapildytasPrekes
  gautiPapildytasPrekes: (automatoId: string): AutomatoPrekė[] => {
    return useStore.getState().machineProducts.filter(mp => mp.machine_id === automatoId);
  },

  // 4.2.12 Step 22: PrekėsController → entity — pridetiPapildytasPrekes
  pridetiPapildytasPrekes: (
    duomenys: Omit<AutomatoPrekė, 'id'>,
    sekmesZinute: () => void
  ): void => {
    useStore.getState().pridėtiPrekęAutomatui(duomenys);
    sekmesZinute();
  },

  // 4.2.12 Step 18/19: trauktiPrekes (boundary → AutomatoController → PrekėsController)
  trauktiPrekes: (duomenys: Omit<AutomatoPrekė, 'id'>): void => {
    useStore.getState().pridėtiPrekęAutomatui(duomenys);
  },

  pašalintiPrekęAutomatui: (id: string): void => {
    useStore.getState().pašalintiPrekęAutomatui(id);
  },

  // 4.2.12 Step 1/2: gautiPrekes (boundary → AutomatoController → entity)
  gautiPrekes: (automatoId: string): AutomatoPrekė[] => {
    return useStore.getState().machineProducts.filter(mp => mp.machine_id === automatoId);
  },

  gautiVisasPrekes: (): Prekė[] => {
    return useStore.getState().products;
  },

  // 4.2.16 Tikrinti prekių galiojimo laikus — laikoIvykis
  laikoIvykis: (): void => {
    useStore.getState().tikrintiPrekiųGaliojimą();
  },
};
