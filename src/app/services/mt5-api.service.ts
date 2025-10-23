import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AccountInfo,
  Position,
  SymbolInfo,
  Tick,
  Candle,
  OrderRequest,
  CloseRequest,
  OrderResult,
  Deal,
  DealsResponse,
  MarginInfo,
} from '../models/mt5.models';
import {Server} from '../models/server.model'

export interface ServerCheckRequest {
  server: string;
  login: number;
  password: string;
  port?: number; // opzionale
  path: string;
}

export interface ServerCheckResponse {
  status: 'success' | 'error';
  message: string;
}


@Injectable({
  providedIn: 'root'
})
export class Mt5ApiService {
  private readonly baseUrl = 'http://127.0.0.1:8080';

  constructor(private http: HttpClient) {}

  healthCheck(): Observable<any> {
    return this.http.get(`${this.baseUrl}/healthz`);
  }

  getAccountInfo(): Observable<AccountInfo> {
    return this.http.get<AccountInfo>(`${this.baseUrl}/account/info`);
  }

  getAccountMargin(): Observable<MarginInfo> {
    return this.http.get<MarginInfo>(`${this.baseUrl}/account/margin`);
  }

  getOpenPositions(): Observable<Position[]> {
    return this.http.get<Position[]>(`${this.baseUrl}/positions/open`);
  }

  getAllSymbols(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/symbols/all`);
  }

  getTradableSymbols(): Observable<SymbolInfo[]> {
    return this.http.get<SymbolInfo[]>(`${this.baseUrl}/symbols/tradable_fast`);
  }

  getLastTick(symbol: string): Observable<Tick> {
    return this.http.get<Tick>(`${this.baseUrl}/ticks/last/${symbol}`);
  }

  getTicksRange(symbol: string, fromDate: string, toDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('from_date', fromDate)
      .set('to_date', toDate);
    return this.http.get<any[]>(`${this.baseUrl}/ticks/range/${symbol}`, { params });
  }

  getLastCandles(symbol: string, timeframe: string, start: number = 0, count: number = 10): Observable<Candle[]> {
    return this.http.post<Candle[]>(`${this.baseUrl}/candle/last`, {
      symbol,
      timeframe,
      start,
      count
    });
  }

  buyOrder(orderRequest: OrderRequest): Observable<OrderResult> {
    return this.http.post<OrderResult>(`${this.baseUrl}/order/buy`, orderRequest);
  }

  sellOrder(orderRequest: OrderRequest): Observable<OrderResult> {
    return this.http.post<OrderResult>(`${this.baseUrl}/order/sell`, orderRequest);
  }

  closeOrder(closeRequest: CloseRequest): Observable<OrderResult[]> {
    return this.http.post<OrderResult[]>(`${this.baseUrl}/order/close`, closeRequest);
  }

  closeAllPositions(closeRequest: CloseRequest): Observable<OrderResult[]> {
    return this.http.post<OrderResult[]>(`${this.baseUrl}/positions/close_all`, closeRequest);
  }

  modifyOrder(symbol: string, ticket: number, newSl: number, newTp: number): Observable<OrderResult> {
    return this.http.post<OrderResult>(`${this.baseUrl}/order/modify`, {
      symbol,
      ticket,
      new_sl: newSl,
      new_tp: newTp
    });
  }

  getOrdersHistory(fromDate: string, toDate: string): Observable<any[]> {
    const params = new HttpParams()
      .set('from_date', fromDate)
      .set('to_date', toDate);
    return this.http.get<any[]>(`${this.baseUrl}/orders/history`, { params });
  }

  getDealsHistory(symbol?: string): Observable<DealsResponse> {
    return this.http.post<DealsResponse>(`${this.baseUrl}/deals/history`, { symbol });
  }

  getPendingOrders(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/orders/pending`);
  }

  getSymbolInfo(symbol: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/symbol/info/${symbol}`);
  }

  getSymbolTradingMode(symbol: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/symbol/trading_mode/${symbol}`);
  }

  selectSymbol(symbol: string, enable: boolean = true): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/symbol/select/${symbol}`, null, {
      params: new HttpParams().set('enable', enable.toString())
    });
  }

  getDiagnostic(symbol: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/diagnostic/${symbol}`);
  }

    // fa il test di esistenza del server
  // checkServer(data: ServerCheckRequest): Observable<ServerCheckResponse> {
  //   return this.http.post<ServerCheckResponse>(`${this.baseUrl}/check-server`, data);
  // }

  


}
