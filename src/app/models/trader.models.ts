
export interface CreateTraderRequest {
  name: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
}


export interface Trader {
  id?: number;
  name: string;
  status: 'active' | 'inactive';  // is_active diventa status
  master_server_id?: number;      // riferimento al server master
  slave_server_id?: number;       // riferimento al server slave
  sl?: number;                    // Stop Loss
  tp?: number;                    // Take Profit
  tsl?: number;                   // Trailing Stop Loss
  moltiplicatore?: number;        // fattore di copia
  fix_lot?: number;               // lotto fisso (opzionale)
  created_at?: string;
  updated_at?: string;
  copying?: boolean;  
}

export interface NewTrader {
  
  name: string;
  status: 'active' | 'inactive';  // is_active diventa status
  master_server_id?: number;      // riferimento al server master
  slave_server_id?: number;       // riferimento al server slave
  sl?: number;                    // Stop Loss
  tp?: number;                    // Take Profit
  tsl?: number;                   // Trailing Stop Loss
  moltiplicatore?: number;        // fattore di copia
  fix_lot?: number;               // lotto fisso (opzionale)
  created_at?: string;
  updated_at?: string;
}

export interface BuyRequest {
  symbol: string;
  lot: number;
  sl_point?: number;
  tp_point?: number;
  magic?: number;
  comment?: string;
}






