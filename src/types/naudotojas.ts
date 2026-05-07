export type NaudotojoRolė = 'administrator' | 'attendant' | 'technician';
export type NaudotojoBūsena = 'active' | 'vacation' | 'sick' | 'inactive' | 'terminated';

export interface Naudotojas {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: NaudotojoRolė;
  status: NaudotojoBūsena;
  created_at: string;
}

export type User = Naudotojas;
export type UserRole = NaudotojoRolė;
export type UserStatus = NaudotojoBūsena;
