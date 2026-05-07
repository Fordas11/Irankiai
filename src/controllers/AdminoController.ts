// AdminoController — kontroleris, atsakingas už administratoriaus operacijas (<<control>>)
// Sekų diagramos: 4.2.1 Pakeisti naudotojo būseną, 4.2.2 Priskirti naudotojui teises/rolę, 4.2.3 Registruoti
import { useStore } from '../store/useStore';
import type { Naudotojas } from '../types';

type NaudotojoFormDuomenys = Omit<Naudotojas, 'id' | 'created_at'>;

export const AdminoController = {
  // 4.2.1 Pakeisti naudotojo būseną — Step 2: NaudotojuSarasas → AdminoController
  // Calls Naudotojas entity (step 3) and returns sąrašas (step 4)
  gautiNaudotojuSarasa: (): Naudotojas[] => {
    return useStore.getState().users;
  },

  // 4.2.1 Step 8: NaudotojuSarasas → Naudotojo nustatymai (open user)
  atidarytiNaudotoja: (id: string): Naudotojas | undefined => {
    return useStore.getState().users.find(u => u.id === id);
  },

  // 4.2.3 Registruoti — Step 4: Registruoti(boundary) → NaudotojoController
  // Validates duomenys (entity self-call), if invalid → siusti pranesima, if valid → pasirinktiRole
  PatikrintiNaudotojoDuomenis: (
    duomenys: NaudotojoFormDuomenys,
    siustiPranesima: (žinute: string) => void,
    duomenysTeisingi: () => void
  ): void => {
    const teisingi = useStore.getState().PatikrintiNaudotojoDuomenis(duomenys);
    if (!teisingi) siustiPranesima('Blogi duomenys');
    else duomenysTeisingi();
  },

  // 4.2.3 Registruoti — Step 9: Registruoti(boundary) → NaudotojoController
  issaugotiSukurtaNaudotoja: (
    duomenys: NaudotojoFormDuomenys,
    naudotojasSukurtas: () => void
  ): void => {
    useStore.getState().issaugotiSukurtaNaudotoja(duomenys);
    naudotojasSukurtas();
  },

  atnaujintiNaudotoja: (id: string, duomenys: Partial<Naudotojas>): void => {
    useStore.getState().atnaujintiNaudotoją(id, duomenys);
  },

  pašalintiNaudotoja: (id: string): void => {
    useStore.getState().pašalintiNaudotoją(id);
  },
};
