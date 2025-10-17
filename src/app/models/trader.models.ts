export interface Trader {
  id: string;
  user_id: string;
  name: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
  status: 'active' | 'inactive' | 'error';
  created_at: string;
  updated_at: string;
}

export interface CreateTraderRequest {
  name: string;
  mt5_login: string;
  mt5_password: string;
  mt5_server: string;
}
