export interface Server {
  id?: number;
  user: string;
  pwd: string;
  server: string;
  platform: string;
  ip: string;
  port: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
