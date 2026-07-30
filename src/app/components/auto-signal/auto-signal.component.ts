import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraderService } from '../../services/trader.service';

interface AutoResult {
  strategy: string;
  sl: number;
  tp: number;
  direction: string;
  trades: number;
  win_rate: number;
  return_pct: number;
  max_dd: number;
  sharpe: number;
  target_hit: boolean;
}

@Component({
  selector: 'app-auto-signal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auto-signal.component.html',
  styleUrls: ['./auto-signal.component.css']
})
export class AutoSignalComponent implements OnInit, OnDestroy {
  symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDJPY', 'MSFT', 'MSFT.NAS', 'NVDA', 'NVDA.NAS'];

  config = {
    symbol: 'NVDA',
    days: 365,
    lot: 0.01,
    balance: 1000,
    direction: 'both',
    target_return: 30,
  };

  results: AutoResult[] = [];
  targetHits: string[] = [];
  targetReturn = 30;
  loading = false;
  error = '';
  progress = 0;
  sessionId: string | null = null;
  private pollTimer: any = null;

  sortKey = 'return_pct';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(private traderService: TraderService) {}

  ngOnInit() {}

  ngOnDestroy() {
    this.stopPolling();
  }

  runDiscovery() {
    this.loading = true;
    this.error = '';
    this.results = [];
    this.progress = 0;

    this.traderService.runAutoSignalResearch(this.config).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.startPolling();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to start discovery';
        this.loading = false;
      }
    });
  }

  cancelResearch() {
    if (!this.sessionId) return;
    this.traderService.cancelSignalResearch(this.sessionId).subscribe({
      next: () => {
        this.error = 'Cancelled';
        this.loading = false;
        this.stopPolling();
      }
    });
  }

  getStrategyDescription(s: string): string {
    const descs: {[key: string]: string} = {
      'BASE': 'Breakout M5',
      'BASE_NOHOLD': 'Breakout M5 no hold',
      'TRENDGUARD': 'Trend ADX M1+M5+M15',
      'TRENDGUARD_XAU': 'Trend ADX XAU',
      'EURUSD_NOHOLD': 'EURUSD M5',
      'SUPER': 'Super trend M1+M5+M15',
      'SUPER_PRO': 'Super Pro M1+M5+M15',
      'ICHIMOKU': 'Ichimoku M1+M5+M15+H1',
      'MSFT': 'MSFT M1+M5+M15',
      'NVDA': 'NVDA M15',
      'SUPER_USDJPY': 'USDJPY Super',
      'GBPUSD': 'GBPUSD M5',
      'GBPJPY': 'GBPJPY M5',
      'AUDJPY': 'AUDJPY M5',
      'SCALPER_M1': 'Scalper M1',
    };
    return descs[s] || s;
  }

  private startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      if (!this.sessionId) return;
      this.traderService.getSignalResearchStatus(this.sessionId).subscribe({
        next: (res) => {
          if (res.status === 'running') {
            this.progress = res.progress || 0;
          } else if (res.status === 'done') {
            if (res.result?.error) {
              this.error = res.result.error;
            } else {
              this.results = res.result?.results || [];
              this.targetHits = res.result?.target_hits || [];
              this.targetReturn = res.result?.target_return || 30;
            }
            this.loading = false;
            this.stopPolling();
            if (!this.error && this.results.length === 0) {
              this.error = 'Nessuna strategia ha prodotto risultati con i dati disponibili.';
            }
          } else if (res.status === 'error') {
            this.error = res.result?.error || 'Discovery failed';
            this.loading = false;
            this.stopPolling();
          }
        },
        error: () => {
          this.error = 'Lost connection to server';
          this.loading = false;
          this.stopPolling();
        }
      });
    }, 2000);
  }

  private stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  get sortedResults(): AutoResult[] {
    const sorted = [...this.results];
    sorted.sort((a, b) => {
      const va = (a as any)[this.sortKey];
      const vb = (b as any)[this.sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      return this.sortDir === 'asc' ? va - vb : vb - va;
    });
    return sorted;
  }

  sortBy(key: string) {
    if (this.sortKey === key) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDir = 'desc';
    }
  }

  bestPerStrategy(): AutoResult[] {
    const map = new Map<string, AutoResult>();
    for (const r of this.results) {
      const existing = map.get(r.strategy);
      if (!existing || r.return_pct > existing.return_pct) {
        map.set(r.strategy, r);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.return_pct - a.return_pct);
  }
}
