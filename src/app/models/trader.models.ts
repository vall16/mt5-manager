// export interface Trader {
//   id: string;
//   user_id: string;
//   name: string;
//   mt5_login: string;
//   mt5_password: string;
//   mt5_server: string;
//   status: 'active' | 'inactive' | 'error';
//   created_at: string;
//   updated_at: string;
// }

export interface CreateTraderRequest {
  name: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
}

export interface Trader {
  id: number;
  name: string;
  server_master: string;
  server_slave: string;
  strategy: string;
  balance: number;
  status: 'active' | 'inactive';
  created_at?: string;
}

