import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, tap, throwError } from 'rxjs';
import { Server } from '../models/server.model';
import { BuyRequest, CopyOrdersResponse, Trader,SlaveSymbol, CheckServerResponse } from '../models/trader.models';
import { environment } from '../../environments/environment';


// private apiUrl = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class TraderService {
  // private apiUrl = 'http://127.0.0.1:8080'; // URL del backend FastAPI
  private apiUrl = environment.apiUrl; // URL del backend FastAPI

  constructor(private http: HttpClient) {}


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

  updateServer(server: Server): Observable<any> {
   return this.http.put(`${this.apiUrl}/db/servers/${server.id}`, server);
  }


  checkServer(server: Server): Observable<CheckServerResponse> {
    // Per il check bastano IP e Porta dell'agente
    if (!server.ip || !server.port) {
      return throwError(() => new Error('IP e Porta dell\'agente sono obbligatori per il check'));
    }

    console.log('📡 Eseguo check salute su agente ->', `${server.ip}:${server.port}`);

    const body = {
      host: server.ip,
      port: server.port
    };

    // Tipizziamo il post così sappiamo esattamente cosa aspettarci (status, connected, ecc.)
    return this.http.post<CheckServerResponse>(`${this.apiUrl}/mt5/check-server`, body);
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
        updated_at: trader.updated_at,

        custom_signal_interval: trader.custom_signal_interval ?? 2,   //default 2
        selected_signal: trader.selected_signal,
        selected_symbol: trader.selected_symbol

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
    return this.http.delete<{ success: boolean; message?: string }>(`${this.apiUrl}/db/traders/${traderId}`);
  }


  copyOrders(traderId: number) {
    return this.http.post<CopyOrdersResponse>(
      `${this.apiUrl}/db/traders/${traderId}/copy_orders`,
      {}
    );
  }


  updateTraderServers(
    id: number,
    masterId: number | null,
    slaveId: number | null,
    sl?: number | null,
    tp?: number | null,
    tsl?: number | null,
    moltiplicatore?: number | null,

    // 🆕 nuovi parametri
    selected_signal?: string | null,
    custom_signal_interval?: number | null,
    selected_symbol?: string | null,
    // copyInterval?: number | null

  ) {
    return this.http.put<Trader>(`${this.apiUrl}/db/traders/${id}/servers`, {
      master_server_id: masterId,
      slave_server_id: slaveId,
      sl: sl,
      tp: tp,
      tsl: tsl,
      moltiplicatore: moltiplicatore,

      // 🆕 campi custom signal
      selected_signal: selected_signal,
      custom_signal_interval: custom_signal_interval,
      selected_symbol: selected_symbol,
      // copy_interval: copyInterval

    });
  }


  startServer(server: Server): Observable<any> {
    return this.http.post(`${this.apiUrl}/mt5/start_server`, server);
  }

  

  /** Avvia il listener del BUY nel backend */
  startListeningBuy_orig(trader:Trader): Observable<any> {
    
    return this.http.post(`${this.apiUrl}/trade/start_polling`, trader);
  }

  /** Avvia il listener nel backend (MULTI)*/
  startListening(trader: Trader, signal: string): Observable<any> {
    
    trader.selected_signal =signal

    return this.http.post(`${this.apiUrl}/trade/start_polling`, trader);
  }


  // stopListeningBuy(): Observable<any> {
  //   return this.http.post(`${this.apiUrl}/trade/stop_polling`, {});
  // }

  // stoppa il listening nel BE (MULTI)
  stopListening(trader: Trader) {
    return this.http.post(`${this.apiUrl}/trade/stop_polling`, { trader_id: trader.id });
  }



  getSlaveSymbols(slaveApiUrl: string): Observable<{ symbols: SlaveSymbol[] }> {

    const url = `${slaveApiUrl}/symbols/active`;
    console.log("🔵 [getSlaveSymbols] Chiamo URL:", url);

    return this.http.get<{ symbols: SlaveSymbol[] }>(url).pipe(

      tap({
        next: (res: any) => {
          console.log("🟢 [getSlaveSymbols] SUCCESS");
          console.log("🟢 Response type:", typeof res);
          console.log("🟢 Response object:", res);
          if (res?.symbols) {
            console.log("🟢 Symbols count:", res.symbols.length);
          }
        },
        error: (err) => {
          console.error("🔴 [getSlaveSymbols] ERROR!");

          console.error("🔴 Error name:", err.name);
          console.error("🔴 Error message:", err.message);
          console.error("🔴 Error status:", err.status);
          console.error("🔴 Error statusText:", err.statusText);

          console.error("🔴 Error URL:", err.url);

          // Corpo della risposta o ProgressEvent
          console.error("🔴 Error error:", err.error);
          if (err.error instanceof ProgressEvent) {
            console.error("🔴 Error is ProgressEvent → CORS o connessione rifiutata");
          }

          // JSON stringify
          try {
            console.error("🔴 Error JSON:", JSON.stringify(err));
          } catch (e) {
            console.error("🔴 Cannot stringify error:", e);
          }
        }
      })
    );
}


}

  


