import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Server } from '../models/server.model';
import { Trader } from '../models/trader.models';

@Injectable({
  providedIn: 'root',
})
export class TraderService {
  private apiUrl = 'http://127.0.0.1:8080'; // URL del backend FastAPI

  constructor(private http: HttpClient) {}

  

  // ✅ nuovo metodo con dati fake
  getAllServers2(): Observable<Server[]> {
    const fakeServers: Server[] = [
  {
    id: 1,
    user: '959911',
    pwd: 'pwd1',
    server: 'VTMarkets-Demo',
    platform: 'MT5',
    ip: '192.168.0.1',
    port: 443,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    path: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe',
    login: '959911',
    password: 'Qpnldan1@1'
  },
  {
    id: 2,
    user: 'demo2',
    pwd: 'pwd2',
    server: 'Server Two',
    platform: 'MT4',
    ip: '192.168.0.2',
    port: 443,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    path: 'C:\\Program Files\\MetaTrader 4\\terminal.exe',
    login: 'demo2',
    password: 'pwd2'
  },
  {
    id: 3,
    user: 'demo3',
    pwd: 'pwd3',
    server: 'Server Three',
    platform: 'MT5',
    ip: '192.168.0.3',
    port: 443,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    path: 'C:\\MetaTrader5\\terminal64.exe',
    login: 'demo3',
    password: 'pwd3'
  },
  {
    id: 4,
    user: 'demo4',
    pwd: 'pwd4',
    server: 'Server Four',
    platform: 'MT4',
    ip: '192.168.0.4',
    port: 443,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    path: 'D:\\Trading\\MT4\\terminal.exe',
    login: 'demo4',
    password: 'pwd4'
  },
  {
    id: 5,
    user: 'demo5',
    pwd: 'pwd5',
    server: 'Server Five',
    platform: 'MT5',
    ip: '192.168.0.5',
    port: 443,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    path: 'D:\\MetaTrader5\\terminal64.exe',
    login: 'demo5',
    password: 'pwd5'
  }
];


    // restituisce un Observable simulando la chiamata HTTP
    return of(fakeServers);
  }

  
  /** ✅ GET: tutti i server */
  getAllServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.apiUrl}/servers`);
  }


  // /** ✅ POST: inserisci un nuovo server */
  insertServer(server: Partial<Server>): Observable<any> {
  return this.http.post(`${this.apiUrl}/servers`, server);
}

  deleteServer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/servers/${id}`);
  }



  checkServer(server: Server): Observable<any> {
    const body = {
      server: server.server,
      login: server.login,
      password: server.password,
      port: server.port,
      path: server.path || "C:\\Program Files\\MetaTrader 5\\terminal64.exe"
    };
    return this.http.post(`${this.apiUrl}/check-server`, body);
  }

  loadTraders(): Observable<Trader[]> {
  const traders: Trader[] = [
    {
      id: 1,
      name: 'Trader Alpha',
      server_master_id: 1, // VTMarkets-Demo
      server_slave_id: 2,  // Eightcap-Demo
      strategy: 'Scalping',
      balance: 12000,
      status: 'active',
      created_at: '2025-10-23T09:00:00Z'
    },
    {
      id: 2,
      name: 'Trader Beta',
      server_master_id: 3, // Pepperstone-Live03
      server_slave_id: 4,  // Exness-Demo
      strategy: 'Swing',
      balance: 8500,
      status: 'inactive',
      created_at: '2025-10-22T15:30:00Z'
    },
    {
      id: 3,
      name: 'Trader Gamma',
      server_master_id: 5, // ICMarkets-Live01
      server_slave_id: 6,  // ICMarkets-Demo02
      strategy: 'Trend Following',
      balance: 25600,
      status: 'active',
      created_at: '2025-10-20T10:15:00Z'
    }
  ];

  // Simula chiamata HTTP
  return of(traders);
}

}

  


