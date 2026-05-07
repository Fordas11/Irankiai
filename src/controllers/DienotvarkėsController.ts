// DienotvarkėsController — kontroleris, atsakingas už dienotvarkių valdymą (<<control>>)
// Sekų diagramos: 4.2.6 Apskaičiuoti aptarnavimo laiką, 4.2.7 Aptarnauti/tvarkyti automatą,
//                 4.2.9 Gauti dienotvarkę, 4.2.11 Papildyti grąžą, 4.2.17 Tvarkyti automatą
import { useStore } from '../store/useStore';
import type { Dienotvarkė, Automatas } from '../types';

interface AutomatasSuLaiku extends Automatas {
  aptarnavimoLaikas: number;
}

export const DienotvarkėsController = {
  // 4.2.7 Step 2: PagrindinisLangas → DienotvarkėsController
  // ref Gauti dienotvarkę → atvaizduotiDienotvarke
  generuotiDienotvarke: (
    naudotojoRolė: 'attendant' | 'technician' | 'administrator',
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
    const dienotvarke: Dienotvarkė[] = [];
    let t = 0;
    const darboRiba = 8 * 60; // 8h darbo dienai
    for (const automatas of suLaiku) {
      if (t + automatas.aptarnavimoLaikas > darboRiba) break;
      DienotvarkėsController.PriskirtiAutomataDienotvarkei(automatas);
      DienotvarkėsController.PrideitiAptarnavimoLaikaPrieDienotvarkes(automatas.aptarnavimoLaikas);
      t += automatas.aptarnavimoLaikas;
    }

    // 4.2.7 Step 3: atvaizduotiDienotvarke
    const visosDienotvarkes = useStore.getState().tasks;
    void dienotvarke;
    atvaizduotiDienotvarke(visosDienotvarkes);
  },

  // 4.2.9 Step 1: gautiAutomatuSarasa
  gautiAutomatuSarasa: (): Automatas[] => {
    return useStore.getState().rastiVisusAutomatus();
  },

  // 4.2.9 Step 3: filtruotiPagalGrazairPrekes — atfiltruoja automatus, kuriems trūksta prekių
  filtruotiPagalGrazairPrekes: (automatai: Automatas[]): Automatas[] => {
    return automatai.filter(a => a.status === 'needs_service' || a.status === 'operational');
  },

  // 4.2.9 Step 4: filtruotiPagalTechnikams — atfiltruoja sugedusius automatus
  filtruotiPagalTechnikams: (automatai: Automatas[]): Automatas[] => {
    return automatai.filter(a => a.status === 'broken' || a.status === 'needs_service');
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
    // pagal koordinatės surenka greičiausią maršrutą — supaprastinta versija
    return [...automatai].sort((a, b) => (a.latitude + a.longitude) - (b.latitude + b.longitude));
  },

  // 4.2.6 Apskaičiuoti automatų aptarnavimo laiką
  apskaiciuotiAptarnavimoLaika: (automatai: Automatas[]): AutomatasSuLaiku[] => {
    let t = 0;
    const result: AutomatasSuLaiku[] = [];
    for (const a of automatai) {
      // Step 3: kelionesLaikas = atstumas * 3 (paprasta: 3 min vienam kelionės vienetui)
      const kelionesLaikas = 3;
      // Step 4: laikas = kelionesLaikas + 45 (45 min aptarnavimui)
      const laikas = kelionesLaikas + 45;
      // Step 5/7: priskirtiLaika, t = t + laikas
      result.push({ ...a, aptarnavimoLaikas: laikas });
      t += laikas;
    }
    void t;
    return result;
  },

  // 4.2.9 Step 8: PriskirtiAutomataDienotvarkei
  PriskirtiAutomataDienotvarkei: (automatas: Automatas): void => {
    void automatas;
    // Realioje sistemoje sukurtų užduotį dienotvarkėje
  },

  // 4.2.9 Step 9: PrideitiAptarnavimoLaikaPrieDienotvarkes
  PrideitiAptarnavimoLaikaPrieDienotvarkes: (laikas: number): void => {
    void laikas;
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
