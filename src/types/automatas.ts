export type AutomatoBūsena =
  | 'operational'
  | 'offline'
  | 'needs_service'
  | 'broken'
  | 'maintenance'
  | 'servicing';

export interface Automatas {
  id: string;
  name: string;
  model: string;
  address: string;
  longitude: number;
  latitude: number;
  status: AutomatoBūsena;
  revenue_today: number;
  created_at: string;
  last_serviced: string | null;
}

export type Machine = Automatas;
export type MachineStatus = AutomatoBūsena;
