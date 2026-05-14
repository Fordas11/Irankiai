import { AutomatoController } from './AutomatoController';
import type { AutomatoBūsena } from '../types';

// 4.2.10.1 Pakeisti automato būseną — AutomatoViewModelController (<<control>>)
export const AutomatoViewModelController = {
  
  // Step 2: gauti būsenas
  'gauti būsenas': (atvaizduotiBūsenųSąrašą: (bs: AutomatoBūsena[]) => void): void => {
    const bs = AutomatoController.gautiBūsenas(); // Step 3: gautiBūsenas()
    atvaizduotiBūsenųSąrašą(bs); // Step 7: atvaizduoti(bs), Step 8: atvaizduoti būsenų sąrašą
  },

  // Step 10: keisti automato būseną
  'keisti automato būseną': (
    id: string,
    naujaBusena: AutomatoBūsena,
    atvaizduotiSėkmėsŽinutę: () => void
  ): void => {
    // Step 11: keistiBusena()
    AutomatoController.keistiBusena(
      'automatas',
      id,
      naujaBusena,
      () => {
        atvaizduotiSėkmėsŽinutę(); // Step 14: atvaizduoti(), Step 15: atvaizduoti sėkmės žinutę
      }
    );
  },
};
