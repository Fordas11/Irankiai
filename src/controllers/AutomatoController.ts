// AutomatoController — kontroleris, atsakingas už automatų valdymą (<<control>>)
// Sekų diagramos: 4.2.10 Pakeisti būseną, 4.2.14 Peržiūrėti automatų sąrašą, 4.2.15 Sukurti automatą
import { useStore } from '../store/useStore';
import type { Automatas, AutomatoPrekė, AutomatoBūsena, AutomatoPrekėsBūsena } from '../types';

type AutomatoFormDuomenys = Omit<Automatas, 'id' | 'created_at' | 'revenue_today'>;
const today = () => new Date().toISOString().split('T')[0];

const uzbaigtiAktyviasUzduotis = (automatoId: string, tipai: Array<'refill' | 'maintenance' | 'repair'>) => {
  const store = useStore.getState();
  store.tasks
    .filter(t => t.machine_id === automatoId && t.status !== 'completed' && tipai.includes(t.type))
    .forEach(t => store.atnaujintiUžduotį(t.id, { status: 'completed' }));
};

export const AutomatoController = {

  gautiVisusAutomatus: (): Automatas[] => {
    return useStore.getState().rastiVisusAutomatus();
  },
    /* Use case: Perziureti automatu sarasa. Sequence: step 4, step 5 (gautiVisusAutomatus(), automatu sarasas)
        AutomatoController ---> Automatas (entity)
        AutomatoController <- - - Automatas
     Use case: Perziureti automatu sarasa. Sequence: step 11, step 12 
     (rastiAutomatusPagalFiltra(filtras), filtruotas automatu sarasas)
        AutomatoController ---> Automatas (entity)
        Automatas <- - - AutomatoController*/
  filtruotiAutomatus: (filtras: { search?: string; status?: string }): Automatas[] => {
    return useStore.getState().rastiAutomatusPagalFiltra(filtras);
  },

  // 4.2.15 Sukurti automatą — Step 2: AutomatoKurimoLangas → AutomatoController
  //Default reiksmes kai yra atidaromas langas
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

/*  Use case: Sukurti automata. Sequence step step 5, step 6, step 7 
    (Patikrinti duomenis, IssaugotiAutomata(duomenys), automatas issaugotas)
        AutomatoController ---> AutomatoController
        AutomatoController ---> Automatas
        AutomatoController <- - - Automatas
         */ 
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
    const store = useStore.getState();
    const prekes = store.machineProducts.filter(mp => mp.machine_id === automatoId);
    prekes.forEach(mp => {
      store.atnaujintiPrekęAutomatui(mp.id, {
        quantity: mp.max_quantity,
        refill_date: today(),
        status: 'good',
      });
    });
    store.atnaujintiAutomatą(automatoId, { status: 'operational', last_serviced: today() });
    uzbaigtiAktyviasUzduotis(automatoId, ['refill']);
    sekmesZinute();
    return useStore.getState().machineProducts.filter(mp => mp.machine_id === automatoId);
  },

  // 4.2.7 Step 15: Automato informacija → AutomatoController (pildytiGraza)
  pildytiGraza: (
    automatoId: string,
    sekmesZinute: () => void
  ): void => {
    useStore.getState().atnaujintiAutomatą(automatoId, { status: 'operational', last_serviced: today() });
    uzbaigtiAktyviasUzduotis(automatoId, ['refill']);
    sekmesZinute();
  },

  // 4.2.7 Step 19: Automato informacija → AutomatoController (tvarkytiAutomata)
  tvarkytiAutomata: (
    automatoId: string,
    sekmesZinute: () => void
  ): void => {
    useStore.getState().atnaujintiAutomatą(automatoId, { status: 'operational', last_serviced: today() });
    uzbaigtiAktyviasUzduotis(automatoId, ['repair', 'maintenance']);
    sekmesZinute();
  },
};
