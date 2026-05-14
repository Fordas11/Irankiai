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

  // 4.2.16 Tikrinti prekių galiojimo laikus — Step 1: Planuotojas → AutomatoController (laikoIvykis)
  laikoIvykis: (): string => {
    const store = useStore.getState();
    const automatai = store.rastiVisusAutomatus(); // Step 2: rastiVisusAutomatus, Step 3: Automatų sąrašas

    automatai.forEach(automato => {
      const prekes = store.machineProducts.filter(mp => mp.machine_id === automato.id);
      prekes.forEach(p => {
        const preke = store.gautiAutomatoPrekę(p.id); // Step 4: gautiAutomatoPrekę, Step 5: Automato prekė
        if (preke) {
          const naujaBusena = AutomatoController.patikrintiGaliojimoLaiką(preke); // Step 6: patikrintiGaliojimoLaika(preke=preke)
          
          // Laikomės griežtos sekos pagal būsenų diagramą: Galioja -> Galiojimas_netrukus_baigsis -> Nebegalioja
          if (preke.status === 'good' && (naujaBusena === 'expiring_soon' || naujaBusena === 'expired')) {
            // Pirmas perėjimas: Galioja -> Galiojimas_netrukus_baigsis
            AutomatoController.keistiBusena('automatas', automato.id, 'needs_service', () => {});
            AutomatoController.KeistiPrekėsBūseną(preke.id, 'expiring_soon');
            
            // Jei jau nebegalioja, darome antrą perėjimą: Galiojimas_netrukus_baigsis -> Nebegalioja
            if (naujaBusena === 'expired') {
              AutomatoController.KeistiPrekėsBūseną(preke.id, 'expired');
            }
          } else if (preke.status === 'expiring_soon' && naujaBusena === 'expired') {
            // Perėjimas: Galiojimas_netrukus_baigsis -> Nebegalioja
            AutomatoController.KeistiPrekėsBūseną(preke.id, 'expired');
          }
        }
      });
    });

    return 'sėkmės žinutė'; // Step 7: sekmes zinute
  },

  // Step 6 in Tikrinti galiojimo laikus
  patikrintiGaliojimoLaiką: (preke: AutomatoPrekė): AutomatoPrekėsBūsena | 'good' => {
    const dabar = new Date();
    const galiojimas = new Date(preke.expiry_date);
    const skirtumas = galiojimas.getTime() - dabar.getTime();
    const dienos = skirtumas / (1000 * 3600 * 24);

    if (dienos <= 0) return 'expired';
    if (dienos <= 3) return 'expiring_soon';
    return 'good';
  },

  // 4.2.10.2 Pakeisti prekės būseną — Step 1: KeistiPrekėsBūseną(naujaBusena=nauja būsena)
  KeistiPrekėsBūseną: (id: string, naujaBusena: AutomatoPrekėsBūsena): string => {
    const store = useStore.getState();
    const preke = store.gautiAutomatoPrekę(id);
    if (!preke) return 'ErrorPrekėNerasta()';

    // Step: [Jei naujaBusena == galimaSekančiai]
    // Tikriname pagal būsenų diagramą (State Machine)
    let galimaSekanciai = false;
    if (preke.status === 'good' && naujaBusena === 'expiring_soon') galimaSekanciai = true;
    if (preke.status === 'expiring_soon' && naujaBusena === 'expired') galimaSekanciai = true;
    
    if (galimaSekanciai) {
      useStore.getState().issaugotiAutomatoPrekesBusena(id, naujaBusena); // Step 2: issaugotiAutomatoPrekesBusena()
      return 'sekmesŽinutė()'; // Step 3: sekmesZinute()
    } else {
      return 'ErrorNeleistinaNaujaBusena()'; // Step 4: ErrorNeleistinaNaujaBusena()
    }
  },

  // 4.2.10.1 Pakeisti automato būseną — Step 11: keistiBusena()
  keistiBusena: (
    tipas: 'automatas' | 'automato_preke',
    id: string,
    busena: AutomatoBūsena | AutomatoPrekėsBūsena,
    atvaizduoti: () => void
  ): void => {
    if (tipas === 'automatas') {
      useStore.getState().issaugotiAutomatoBusena(id, busena as AutomatoBūsena); // Step 12: issaugotiAutomatoBusena(), Step 13: sekmesŽinutė()
    } else {
      useStore.getState().issaugotiAutomatoPrekesBusena(id, busena as AutomatoPrekėsBūsena);
    }
    atvaizduoti(); // Step 14: atvaizduoti()
  },

  // 4.2.10.1 Pakeisti automato būseną — Step 3: gautiBūsenas()
  gautiBūsenas: (): AutomatoBūsena[] => {
    const galimosBusenos = AutomatoController['Gauti tik galimas būsenas'](); // Step 4: Gauti tik galimas būsenas
    return galimosBusenos;
  },

  // 4.2.10.1 Pakeisti automato būseną — Step 4: Gauti tik galimas būsenas
  'Gauti tik galimas būsenas': (): AutomatoBūsena[] => {
    return useStore.getState().gautiBūsenas(); // Step 5: gautiBūsenas(), Step 6: bs = būsenų sąrašas
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
