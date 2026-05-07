export type AutomatoPrekėsBūsena = 'good' | 'expiring_soon' | 'expired';

export interface AutomatoPrekė {
  id: string;
  machine_id: string;
  product_id: string;
  quantity: number;
  max_quantity: number;
  price: number;
  refill_date: string;
  expiry_date: string;
  status: AutomatoPrekėsBūsena;
}

export type MachineProduct = AutomatoPrekė;
export type ProductStatus = AutomatoPrekėsBūsena;
