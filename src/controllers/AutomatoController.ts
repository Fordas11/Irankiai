// AutomatoController — kontroleris, atsakingas už automatų valdymą (<<control>>)
// Sekų diagramos: 4.2.10 Pakeisti būseną, 4.2.14 Peržiūrėti automatų sąrašą, 4.2.15 Sukurti automatą
import { useStore } from '../store/useStore';
import type { Automatas, AutomatoPrekė, AutomatoBūsena, AutomatoPrekėsBūsena } from '../types';

type AutomatoFormDuomenys = Omit<Automatas, 'id' | 'created_at' | 'revenue_today'>;

export const AutomatoController = {
  // 4.2.14 Step 2: AutomatuSarasoLangas → AutomatoController
  // Calls rastiVisusAutomatus on entity (step 3), returns automatu sąrašas (step 4)
  gautiVisusAutomatus: (): Automatas[] => {
    return useStore.getState().rastiVisusAutomatus();
  },

  // 4.2.14 Step 8: AutomatuSarasoLangas → AutomatoController
  // Calls rastiAutomatusPagalFiltra on entity (step 9), returns filtruotas sąrašas (step 10)
  filtruotiAutomatus: (filtras: { search?: string; status?: string }): Automatas[] => {
    return useStore.getState().rastiAutomatusPagalFiltra(filtras);
  },

  // 4.2.15 Sukurti automatą — Step 2: AutomatoKurimoLangas → AutomatoController
  atidarytiKūrimoFormą: (): AutomatoFormDuomenys => {
    return {
      name: '',
      model: '',
      address: '',
      longitude: 23.9,
      latitude: 54.9,
      status: 'operational',
      last_serviced: null,
    };
  },

  // 4.2.15 Step 6: AutomatoKurimoLangas → AutomatoController
  // Calls sukurtiAutomatą on entity (step 7); on success calls atvaizduotiSukurtąAutomatąSąraše (step 11),
  // on failure calls rodytKlaidosPranešimą (step 13)
  PatvirtintiAutomatoKūrimą: (
    duomenys: AutomatoFormDuomenys,
    atvaizduotiSukurtąAutomatąSąraše: () => void,
    rodytikKlaidosPranešimą: (klaida: string) => void
  ): void => {
    const sėkmė = useStore.getState().sukurtiAutomatą({ ...duomenys, revenue_today: 0 });
    if (sėkmė) atvaizduotiSukurtąAutomatąSąraše();
    else rodytikKlaidosPranešimą('Neteisingi automatų duomenys');
  },

  // 4.2.10 Pakeisti būseną — Step 3: Automatas(boundary) → AutomatoController
  // alt: jei automatas → issaugotiAutomatoBusena, jei automato prekė → issaugotiAutomatoPrekesBusena
  keistiBusena: (
    tipas: 'automatas' | 'automato_preke',
    id: string,
    busena: AutomatoBūsena | AutomatoPrekėsBūsena,
    atvaizduoti: () => void
  ): void => {
    if (tipas === 'automatas') {
      useStore.getState().issaugotiAutomatoBusena(id, busena as AutomatoBūsena);
    } else {
      useStore.getState().issaugotiAutomatoPrekesBusena(id, busena as AutomatoPrekėsBūsena);
    }
    atvaizduoti();
  },

  atnaujintiAutomata: (id: string, duomenys: Partial<Automatas>): void => {
    useStore.getState().atnaujintiAutomatą(id, duomenys);
  },

  pašalintiAutomata: (id: string): void => {
    useStore.getState().pašalintiAutomatą(id);
  },

  // 4.2.7 Aptarnauti/tvarkyti automatą — Step 6: Automato informacija → AutomatoController
  // Calls gautiAutomata on entity (step 7), returns automato duomenys (step 8/9)
  atidarytAutomatoInformacija: (id: string): Automatas | undefined => {
    return useStore.getState().gautiAutomata(id);
  },

  gautiAutomata: (id: string): Automatas | undefined => {
    return useStore.getState().gautiAutomata(id);
  },

  // 4.2.7 Step 11: Automato informacija → AutomatoController (pildytiPrekes)
  pildytiPrekes: (
    automatoId: string,
    sekmesZinute: () => void
  ): AutomatoPrekė[] => {
    const prekes = useStore.getState().machineProducts.filter(mp => mp.machine_id === automatoId);
    sekmesZinute();
    return prekes;
  },

  // 4.2.7 Step 15: Automato informacija → AutomatoController (pildytiGraza)
  pildytiGraza: (
    automatoId: string,
    sekmesZinute: () => void
  ): void => {
    void automatoId;
    sekmesZinute();
  },

  // 4.2.7 Step 19: Automato informacija → AutomatoController (tvarkytiAutomata)
  tvarkytiAutomata: (
    automatoId: string,
    sekmesZinute: () => void
  ): void => {
    useStore.getState().issaugotiAutomatoBusena(automatoId, 'maintenance');
    sekmesZinute();
  },
};
