import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap, throwError } from 'rxjs';
import { Server } from '../models/server.model';
import { BuyRequest, CopyOrdersResponse, Trader } from '../models/trader.models';

@Injectable({
  providedIn: 'root',
})
export class TraderService {
  private apiUrl = 'http://127.0.0.1:8080'; // URL del backend FastAPI

  constructor(private http: HttpClient) {}

  // ✅ nuovo metodo con dati fake
//   getAllServers2(): Observable<Server[]> {
//     const fakeServers: Server[] = [
//   {
//     id: 1,
//     user: '959911',
//     pwd: 'pwd1',
//     server: 'VTMarkets-Demo',
//     platform: 'MT5',
//     ip: '192.168.0.1',
//     port: 443,
//     is_active: true,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     path: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe',
//     login: '959911',
//     password: 'Qpnldan1@1'
//   },
//   {
//     id: 2,
//     user: 'demo2',
//     pwd: 'pwd2',
//     server: 'Server Two',
//     platform: 'MT4',
//     ip: '192.168.0.2',
//     port: 443,
//     is_active: true,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     path: 'C:\\Program Files\\MetaTrader 4\\terminal.exe',
//     login: 'demo2',
//     password: 'pwd2'
//   },
//   {
//     id: 3,
//     user: 'demo3',
//     pwd: 'pwd3',
//     server: 'Server Three',
//     platform: 'MT5',
//     ip: '192.168.0.3',
//     port: 443,
//     is_active: false,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     path: 'C:\\MetaTrader5\\terminal64.exe',
//     login: 'demo3',
//     password: 'pwd3'
//   },
//   {
//     id: 4,
//     user: 'demo4',
//     pwd: 'pwd4',
//     server: 'Server Four',
//     platform: 'MT4',
//     ip: '192.168.0.4',
//     port: 443,
//     is_active: true,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     path: 'D:\\Trading\\MT4\\terminal.exe',
//     login: 'demo4',
//     password: 'pwd4'
//   },
//   {
//     id: 5,
//     user: 'demo5',
//     pwd: 'pwd5',
//     server: 'Server Five',
//     platform: 'MT5',
//     ip: '192.168.0.5',
//     port: 443,
//     is_active: false,
//     created_at: new Date().toISOString(),
//     updated_at: new Date().toISOString(),
//     path: 'D:\\MetaTrader5\\terminal64.exe',
//     login: 'demo5',
//     password: 'pwd5'
//   }
// ];


//     // restituisce un Observable simulando la chiamata HTTP
//     return of(fakeServers);
//   }

  openBuyOrder(req: BuyRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/order/buy`, req);
  }

  
  /** ✅ GET: tutti i server */
  getAllServers(): Observable<Server[]> {
    return this.http.get<Server[]>(`${this.apiUrl}/db/servers`);
  }


  // /** ✅ POST: inserisci un nuovo server */
  insertServer(server: Partial<Server>): Observable<any> {
  return this.http.post(`${this.apiUrl}/db/servers`, server);
}

  deleteServer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/db/servers/${id}`);
  }



  checkServer(server: Server): Observable<any> {
    if (!server.server || !server.user || !server.pwd || !server.port) {
    return throwError(() => new Error('Server, login, password e port sono obbligatori'));
  }
  console.log('checkServer ->', server);

    const body = {
      // server: server.server,
      // login: server.user,
      // password: server.pwd,
      port: server.port,
      host: server.ip
      // path:server.path
    };
    return this.http.post(`${this.apiUrl}/mt5/check-server`, body);
  }


  loadTraders(): Observable<Trader[]> {
  return this.http.get<Trader[]>(`${this.apiUrl}/db/traders`).pipe(
    tap(rawTraders => {
      console.log('📥 Traders ricevuti dal backend:', rawTraders);
    }),

    map(traders => traders.map(trader => ({
      id: trader.id,
      name: trader.name,
      status: trader.status ? 'active' : 'inactive',
      master_server_id: trader.master_server_id, // oppure trader.master_server_id se già numerico
      slave_server_id: trader.slave_server_id,  // oppure trader.slave_server_id
      sl: trader.sl,
      tp: trader.tp,
      tsl: trader.tsl,
      moltiplicatore: trader.moltiplicatore,
      fix_lot: trader.fix_lot,
      created_at: trader.created_at,
      updated_at: trader.updated_at
    })))
  );
  }

  insertTrader(trader: Trader): Observable<Trader> {
    return this.http.post<Trader>(`${this.apiUrl}/db/traders`, trader);
  }

  updateTrader(trader: Trader): Observable<Trader> {
    return this.http.put<Trader>(`${this.apiUrl}/db/traders/${trader.id}`, trader);
  }

  deleteTrader(traderId: number) {
  return this.http.delete<{ success: boolean; message?: string }>(`http://127.0.0.1:8080/db/traders/${traderId}`);
  }


  // originale
  // copyOrders(traderId: number) {
  //   return this.http.post(`${this.apiUrl}/db/traders/${traderId}/copy_orders`, {}, { observe: 'response' });
  // }


  // copyOrders(traderId: number) {
  // return this.http.post<{ logs: string[] }>(
  //   `${this.apiUrl}/db/traders/${traderId}/copy_orders`,
  //   {}
  // );

  copyOrders(traderId: number) {
  return this.http.post<CopyOrdersResponse>(
    `${this.apiUrl}/db/traders/${traderId}/copy_orders`,
    {}
  );
  }



  /** PUT: aggiorna solo i server di un trader */
  // updateTraderServers(id: number, masterId: number | null, slaveId: number | null) {
  //   return this.http.put<Trader>(`${this.apiUrl}/db/traders/${id}/servers`, {
  //     master_server_id: masterId,
  //     slave_server_id: slaveId
  //   });
  // }

  updateTraderServers(
    id: number,
    masterId: number | null,
    slaveId: number | null,
    sl?: number | null,
    tp?: number | null,
    tsl?: number | null,
    moltiplicatore?: number | null
  ) {
    return this.http.put<Trader>(`${this.apiUrl}/db/traders/${id}/servers`, {
      master_server_id: masterId,
      slave_server_id: slaveId,
      sl: sl,
      tp: tp,
      tsl: tsl,
      moltiplicatore: moltiplicatore
    });
}


  startServer(server: Server): Observable<any> {
    return this.http.post(`${this.apiUrl}/mt5/start_server`, server);
  }


}

  


