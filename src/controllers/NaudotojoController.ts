// NaudotojoController — kontroleris, atsakingas už naudotojo autentifikaciją ir profilį (<<control>>)
// Sekų diagramos: 4.2.18 Atsijungti, 4.2.19 Pakeisti darbo būseną, 4.2.21 Prisijungti, 4.2.22 Redaguoti paskyros duomenis
import { useStore } from '../store/useStore';
import type { Naudotojas, NaudotojoBūsena } from '../types';

export const NaudotojoController = {
  // 4.2.21 Prisijungti — Step 4: Prisijungti(boundary) → NaudotojoController
  // Calls tikrintiPrisijungima on entity (step 5); on success calls AtidarytiPagrindiniLanga (step 7),
  // on failure calls rodytKlaidosPranesima (step 10)
  perduotiPrisijungimoDuomenis: (
    gmail: string,
    slaptažodis: string,
    AtidarytiPagrindiniLanga: () => void,
    rodytKlaidosPranesima: (klaida: string) => void
  ): void => {
    const teisingi = useStore.getState().tikrintiPrisijungima(gmail, slaptažodis);
    if (teisingi) AtidarytiPagrindiniLanga();
    else rodytKlaidosPranesima('Klaida / duomenys neteisingi');
  },

  // 4.2.21 Prisijungti — entity self-call
  tikrintiPrisijungima: (gmail: string, slaptažodis: string): boolean => {
    return useStore.getState().tikrintiPrisijungima(gmail, slaptažodis);
  },

  // 4.2.18 Atsijungti — Step 2: Prisijungti(boundary) → NaudotojoController
  // grazintiVartotoja callback (step 3) → boundary grąžina vartotoją į prisijungimo langą
  atsijungti: (grazintiVartotoja: () => void): void => {
    useStore.getState().atsijungti();
    grazintiVartotoja();
  },

  // 4.2.19 Pakeisti darbo būseną — Step 7: Profilis → NaudotojoController
  // Calls issaugotiNaudotojoBusena on entity (step 8)
  issaugotiNaudotojoBusena: (id: string, busena: NaudotojoBūsena): void => {
    useStore.getState().issaugotiNaudotojoBusena(id, busena);
  },

  // 4.2.22 Redaguoti paskyros duomenis — issaugotiNaudotoja
  issaugotiNaudotoja: (id: string, duomenys: Partial<Naudotojas>): void => {
    useStore.getState().atnaujintiNaudotoją(id, duomenys);
  },

  // gautiNaudotoja — entity helper
  gautiNaudotoja: (id: string): Naudotojas | undefined => {
    return useStore.getState().users.find(u => u.id === id);
  },

  // 4.2.1 Pakeisti naudotojo būseną — Step 13: Naudotojo nustatymai → NaudotojoController
  gautiNaudotojuBusenas: (): NaudotojoBūsena[] => {
    return ['active', 'vacation', 'sick', 'inactive', 'terminated'];
  },

  // 4.2.1 Step 19/20: issaugotiBusena
  issaugotiBusena: (naudotojas: Naudotojas, busena: NaudotojoBūsena): void => {
    useStore.getState().issaugotiNaudotojoBusena(naudotojas.id, busena);
  },

  // 4.2.2 Priskirti naudotojui teises/rolę — Step 13: rolesMenu
  rolesMenu: (): Naudotojas['role'][] => {
    return ['administrator', 'attendant', 'technician'];
  },

  // 4.2.2 Step 20/21: IssaugotiRole
  IssaugotiRole: (id: string, role: Naudotojas['role']): void => {
    useStore.getState().IssaugotiRole(id, role);
  },
};
