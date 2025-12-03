// src/app/services/signal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SignalService {
  // private apiUrl = 'http://127.0.0.1:8080';
  private apiUrl = environment.apiUrl; // URL del backend FastAPI

  constructor(private http: HttpClient) {}

  pollSignal(intervalMs: number = 5000): Observable<{ signal: string }> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<{ signal: string }>(this.apiUrl))
    );
  }
}
