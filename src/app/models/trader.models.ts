
export interface CreateTraderRequest {
  name: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
}

// export interface Trader {
//   id: number;
//   name: string;
//   server_master: string;
//   server_slave: string;
//   strategy: string;
//   balance: number;
//   status: 'active' | 'inactive';
//   created_at?: string;
// }

export interface Trader {
  id?: number;
  name: string;
  status: 'active' | 'inactive';  // is_active diventa status
  server_master_id?: number;      // riferimento al server master
  server_slave_id?: number;       // riferimento al server slave
  sl?: number;                    // Stop Loss
  tp?: number;                    // Take Profit
  tsl?: number;                   // Trailing Stop Loss
  moltiplicatore?: number;        // fattore di copia
  fix_lot?: number;               // lotto fisso (opzionale)
  created_at?: string;
  updated_at?: string;
}



