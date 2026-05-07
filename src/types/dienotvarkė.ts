export type DienotvarkėsBūsena = 'pending' | 'in_progress' | 'completed';
export type DienotvarkėsTipas = 'refill' | 'maintenance' | 'repair';
export type DienotvarkėsPrioritetas = 'high' | 'medium' | 'low';

export interface Dienotvarkė {
  id: string;
  machine_id: string;
  assigned_to: string | null;
  type: DienotvarkėsTipas;
  priority: DienotvarkėsPrioritetas;
  status: DienotvarkėsBūsena;
  description: string;
  scheduled_date: string;
  created_at: string;
}

export type ServiceTask = Dienotvarkė;
export type TaskStatus = DienotvarkėsBūsena;
export type TaskType = DienotvarkėsTipas;
export type TaskPriority = DienotvarkėsPrioritetas;
