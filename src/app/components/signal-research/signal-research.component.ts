import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraderService } from '../../services/trader.service';

interface OptimizationResult {
  strategy: string;
  sl: number;
  tp: number;
  max_hold: number;
  trades: number;
  win_rate: number;
  return_pct: number;
  max_dd: number;
  avg_hold: number;
  sharpe: number;
}

interface ResearchConfig {
  symbol: string;
  timeframe: string;
  days: number;
  lot: number;
  balance: number;
  sl_min: number;
  sl_max: number;
  sl_step: number;
  tp_min: number;
  tp_max: number;
  tp_step: number;
  strategies: string[];
}

interface BacktestTrade {
  time: string;
  type: string;
  exit: string;
  pnl: number;
  balance: number;
}

@Component({
  selector: 'app-signal-research',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signal-research.component.html',
  styleUrls: ['./signal-research.component.css']
})
export class SignalResearchComponent implements OnInit {
  symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDJPY', 'MSFT', 'MSFT.NAS', 'NVDA', 'NVDA.NAS'];
  timeframes = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
  
  allStrategies = [
    'SUPER', 'SUPER_PRO', 'SUPER_USDJPY',
    'BASE', 'BASE_NOHOLD', 'TRENDGUARD', 'TRENDGUARD_XAU',
    'ICHIMOKU', 'EURUSD_NOHOLD',
    'MSFT', 'NVDA',
    'GBPUSD', 'GBPJPY', 'AUDJPY'
  ];
  selectedStrategies: string[] = [];

  config: ResearchConfig = {
    symbol: 'NVDA',
    timeframe: 'M15',
    days: 90,
    lot: 0.01,
    balance: 1000,
    sl_min: 100,
    sl_max: 600,
    sl_step: 50,
    tp_min: 200,
    tp_max: 1200,
    tp_step: 100,
    strategies: []
  };

  optimizationResults: OptimizationResult[] = [];
  selectedResult: OptimizationResult | null = null;
  detailTrades: BacktestTrade[] = [];

  loading = false;
  error = '';
  progress = 0;
  sessionId: string | null = null;
  private pollTimer: any = null;

  sortKey = 'return_pct';
  sortDir: 'asc' | 'desc' = 'desc';

  constructor(private traderService: TraderService) {}

  ngOnInit() {
    this.selectedStrategies = ['NVDA', 'SUPER', 'BASE'];
    this.config.strategies = this.selectedStrategies;
  }

  toggleStrategy(s: string) {
    const idx = this.selectedStrategies.indexOf(s);
    if (idx >= 0) {
      this.selectedStrategies.splice(idx, 1);
    } else {
      this.selectedStrategies.push(s);
    }
    this.config.strategies = [...this.selectedStrategies];
  }

  isStrategySelected(s: string): boolean {
    return this.selectedStrategies.includes(s);
  }

  runOptimization() {
    if (this.selectedStrategies.length === 0) {
      this.error = 'Seleziona almeno una strategia';
      return;
    }

    this.loading = true;
    this.error = '';
    this.optimizationResults = [];
    this.selectedResult = null;
    this.progress = 0;

    this.traderService.runSignalResearch(this.config).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.startPolling();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to start research';
        this.loading = false;
      }
    });
  }

  cancelResearch() {
    if (!this.sessionId) return;
    this.traderService.cancelSignalResearch(this.sessionId).subscribe({
      next: () => {
        this.error = 'Research cancelled';
        this.loading = false;
        this.stopPolling();
      }
    });
  }

  selectResult(r: OptimizationResult) {
    this.selectedResult = r;
    this.detailTrades = [];
  }

  ngOnDestroy() {
    this.stopPolling();
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
              this.optimizationResults = res.result?.results || [];
            }
            this.loading = false;
            this.stopPolling();
          } else if (res.status === 'error') {
            this.error = res.result?.error || 'Research failed';
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

  get sortedResults(): OptimizationResult[] {
    const sorted = [...this.optimizationResults];
    sorted.sort((a: any, b: any) => {
      const va = a[this.sortKey];
      const vb = b[this.sortKey];
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

  getComboCount(): number {
    const slCount = Math.floor((this.config.sl_max - this.config.sl_min) / this.config.sl_step) + 1;
    const tpCount = Math.floor((this.config.tp_max - this.config.tp_min) / this.config.tp_step) + 1;
    return slCount * tpCount;
  }

  exportCsv() {
    if (!this.optimizationResults.length) return;
    const headers = ['Strategy', 'SL', 'TP', 'MaxHold', 'Trades', 'WinRate%', 'Return%', 'MaxDD', 'AvgHold', 'Sharpe'];
    const rows = this.optimizationResults.map(r => [
      r.strategy, r.sl, r.tp, r.max_hold, r.trades, r.win_rate, r.return_pct, r.max_dd, r.avg_hold, r.sharpe
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `signal_research_${this.config.symbol}_${this.config.days}d.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
