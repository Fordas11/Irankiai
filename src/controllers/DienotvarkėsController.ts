// DienotvarkėsController — kontroleris, atsakingas už dienotvarkių valdymą (<<control>>)
// Sekų diagramos: 4.2.6 Apskaičiuoti aptarnavimo laiką, 4.2.7 Aptarnauti/tvarkyti automatą,
//                 4.2.9 Gauti dienotvarkę, 4.2.11 Papildyti grąžą, 4.2.17 Tvarkyti automatą
import { useStore } from '../store/useStore';
import type { Dienotvarkė, Automatas, NaudotojoRolė, DienotvarkėsPrioritetas, DienotvarkėsTipas } from '../types';

interface AutomatasSuLaiku extends Automatas {
  aptarnavimoLaikas: number;
}

const DIENOS_DARBO_LAIKO_LIMITAS = 8 * 60;
const SANDELIO_KOORDINATES = { latitude: 54.8985, longitude: 23.9036 };
const today = () => new Date().toISOString().split('T')[0];

const atstumasTarpTasku = (a: Pick<Automatas, 'latitude' | 'longitude'>, b = SANDELIO_KOORDINATES): number => {
  const lat = a.latitude - b.latitude;
  const lon = a.longitude - b.longitude;
  return Math.sqrt(lat * lat + lon * lon);
};

const turiTrukstamuArNegaliojanciuPrekiu = (automatoId: string): boolean => {
  const { machineProducts } = useStore.getState();
  return machineProducts.some(mp =>
    mp.machine_id === automatoId &&
    (mp.quantity <= Math.ceil(mp.max_quantity * 0.3) || mp.status === 'expired' || mp.status === 'expiring_soon')
  );
};

const parinktiUzduotiesTipa = (automatas: Automatas): DienotvarkėsTipas => {
  if (automatas.status === 'broken' || automatas.status === 'offline') return 'repair';
  if (turiTrukstamuArNegaliojanciuPrekiu(automatas.id)) return 'refill';
  return 'maintenance';
};

const parinktiPrioriteta = (automatas: Automatas): DienotvarkėsPrioritetas => {
  if (automatas.status === 'broken' || automatas.status === 'offline') return 'high';
  if (turiTrukstamuArNegaliojanciuPrekiu(automatas.id) || automatas.status === 'needs_service') return 'medium';
  return 'low';
};

export const DienotvarkėsController = {
  // 4.2.7 Step 2: PagrindinisLangas → DienotvarkėsController
  // ref Gauti dienotvarkę → atvaizduotiDienotvarke
  generuotiDienotvarke: (
    naudotojoRolė: NaudotojoRolė,
    atvaizduotiDienotvarke: (d: Dienotvarkė[]) => void
  ): void => {
    // 4.2.9 Step 1/2: gautiAutomatuSarasa
    let as = DienotvarkėsController.gautiAutomatuSarasa();

    // 4.2.9 opt: filtruotiPagalGrazairPrekes (jei aptarnautojas)
    if (naudotojoRolė === 'attendant') {
      as = DienotvarkėsController.filtruotiPagalGrazairPrekes(as);
    }
    // 4.2.9 opt: filtruotiPagalTechnikams
    if (naudotojoRolė === 'technician') {
      as = DienotvarkėsController.filtruotiPagalTechnikams(as);
    }

    // 4.2.9 Step 5/6/7: nuskaitytiAdresus, pridetiSandelioAdresa, taikytDjikstra
    DienotvarkėsController.nuskaitytiAdresus(as);
    DienotvarkėsController.pridetiSandelioAdresa();
    const sutvarkyta = DienotvarkėsController.taikytDjikstra(as);

    // ref 4.2.6 Apskaičiuoti automatų aptarnavimo laiką
    const suLaiku = DienotvarkėsController.apskaiciuotiAptarnavimoLaika(sutvarkyta);

    // 4.2.9 loop: PriskirtiAutomataDienotvarkei + PrideitiAptarnavimoLaikaPrieDienotvarkes
    let t = 0;
    const sugeneruota: Dienotvarkė[] = [];
    for (const automatas of suLaiku) {
      if (t + automatas.aptarnavimoLaikas > DIENOS_DARBO_LAIKO_LIMITAS) break;
      const uzduotis = DienotvarkėsController.PriskirtiAutomataDienotvarkei(automatas, naudotojoRolė);
      const uzduotisSuLaiku = DienotvarkėsController.PrideitiAptarnavimoLaikaPrieDienotvarkes(uzduotis, automatas.aptarnavimoLaikas);
      DienotvarkėsController.sukurtiUžduotį(uzduotisSuLaiku);
      sugeneruota.push({ ...uzduotisSuLaiku, id: `preview-${automatas.id}`, created_at: today() });
      t += automatas.aptarnavimoLaikas;
    }

    // 4.2.7 Step 3: atvaizduotiDienotvarke
    atvaizduotiDienotvarke(sugeneruota);
  },

  // 4.2.9 Step 1: gautiAutomatuSarasa
  gautiAutomatuSarasa: (): Automatas[] => {
    return useStore.getState().rastiVisusAutomatus();
  },

  // 4.2.9 Step 3: filtruotiPagalGrazairPrekes — atfiltruoja automatus, kuriems trūksta prekių
  filtruotiPagalGrazairPrekes: (automatai: Automatas[]): Automatas[] => {
    return automatai.filter(a =>
      a.status === 'needs_service' ||
      (a.status === 'operational' && turiTrukstamuArNegaliojanciuPrekiu(a.id))
    );
  },

  // 4.2.9 Step 4: filtruotiPagalTechnikams — atfiltruoja sugedusius automatus
  filtruotiPagalTechnikams: (automatai: Automatas[]): Automatas[] => {
    return automatai.filter(a => a.status === 'broken' || a.status === 'offline' || a.status === 'needs_service');
  },

  // 4.2.9 Step 5: nuskaitytiAdresus
  nuskaitytiAdresus: (automatai: Automatas[]): string[] => {
    return automatai.map(a => a.address);
  },

  // 4.2.9 Step 6: pridetiSandelioAdresa
  pridetiSandelioAdresa: (): string => {
    return 'Sandėlys, Vilnius';
  },

  // 4.2.9 Step 7: taikytDjikstra — paprasta implementacija pagal atstumus
  taikytDjikstra: (automatai: Automatas[]): Automatas[] => {
    const likę = [...automatai];
    const marsrutas: Automatas[] = [];
    let dabartinis = SANDELIO_KOORDINATES;

    while (likę.length > 0) {
      likę.sort((a, b) => atstumasTarpTasku(a, dabartinis) - atstumasTarpTasku(b, dabartinis));
      const artimiausias = likę.shift();
      if (!artimiausias) break;
      marsrutas.push(artimiausias);
      dabartinis = { latitude: artimiausias.latitude, longitude: artimiausias.longitude };
    }

    return marsrutas;
  },

  // 4.2.6 Apskaičiuoti automatų aptarnavimo laiką
  apskaiciuotiAptarnavimoLaika: (automatai: Automatas[]): AutomatasSuLaiku[] => {
    const result: AutomatasSuLaiku[] = [];
    let ankstesnis = SANDELIO_KOORDINATES;

    for (const a of automatai) {
      const kelionesLaikas = Math.max(5, Math.round(atstumasTarpTasku(a, ankstesnis) * 1200));
      const aptarnavimoLaikas = parinktiUzduotiesTipa(a) === 'repair' ? 90 : parinktiUzduotiesTipa(a) === 'maintenance' ? 45 : 35;
      const laikas = kelionesLaikas + aptarnavimoLaikas;
      // Step 5/7: priskirtiLaika, t = t + laikas
      result.push({ ...a, aptarnavimoLaikas: laikas });
      ankstesnis = { latitude: a.latitude, longitude: a.longitude };
    }
    return result;
  },

  // 4.2.9 Step 8: PriskirtiAutomataDienotvarkei
  PriskirtiAutomataDienotvarkei: (automatas: Automatas, rolė: NaudotojoRolė): Omit<Dienotvarkė, 'id' | 'created_at'> => {
    const { users } = useStore.getState();
    const tipas = parinktiUzduotiesTipa(automatas);
    const pageidaujamaRolė = tipas === 'repair' || rolė === 'technician' ? 'technician' : 'attendant';
    const priskirtas = users.find(u => u.role === pageidaujamaRolė && u.status === 'active');

    return {
      machine_id: automatas.id,
      assigned_to: priskirtas?.id ?? null,
      type: tipas,
      priority: parinktiPrioriteta(automatas),
      status: 'pending',
      description: `${automatas.name}: ${tipas === 'repair' ? 'reikia sutvarkyti automatą' : tipas === 'refill' ? 'reikia papildyti prekes ir/arba grąžą' : 'suplanuota profilaktinė patikra'}.`,
      scheduled_date: today(),
    };
  },

  // 4.2.9 Step 9: PrideitiAptarnavimoLaikaPrieDienotvarkes
  PrideitiAptarnavimoLaikaPrieDienotvarkes: (
    dienotvarke: Omit<Dienotvarkė, 'id' | 'created_at'>,
    laikas: number
  ): Omit<Dienotvarkė, 'id' | 'created_at'> => {
    return {
      ...dienotvarke,
      description: `${dienotvarke.description} Numatomas aptarnavimo laikas: ${laikas} min.`,
    };
  },

  gautiDienotvarkę: (): Dienotvarkė[] => {
    return useStore.getState().tasks;
  },

  sukurtiUžduotį: (duomenys: Omit<Dienotvarkė, 'id' | 'created_at'>): void => {
    useStore.getState().sukurtiUžduotį(duomenys);
  },

  atnaujintiUžduotį: (id: string, duomenys: Partial<Dienotvarkė>): void => {
    useStore.getState().atnaujintiUžduotį(id, duomenys);
  },

  pašalintiUžduotį: (id: string): void => {
    useStore.getState().pašalintiUžduotį(id);
  },
};
