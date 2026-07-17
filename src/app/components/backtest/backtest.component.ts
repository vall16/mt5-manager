import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TraderService } from '../../services/trader.service';

interface BacktestSummary {
  total_trades: number;
  wins: number;
  losses: number;
  win_rate: number;
  gross_profit: number;
  gross_loss: number;
  net_pnl: number;
  final_balance: number;
  return_pct: number;
  avg_win: number;
  avg_loss: number;
  win_loss_ratio: number;
  max_drawdown: number;
}

interface BacktestTrade {
  time: string;
  type: string;
  exit: string;
  pnl: number;
  balance: number;
}

interface BacktestResult {
  strategy: string;
  symbol: string;
  days: number;
  lot: number;
  initial_balance: number;
  summary: BacktestSummary;
  trades: BacktestTrade[];
}

@Component({
  selector: 'app-backtest',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backtest.component.html',
  styleUrls: ['./backtest.component.css']
})
export class BacktestComponent implements OnDestroy, OnInit {
  strategies = [
    'SUPER', 'SUPER_PRO', 'SUPER_USDJPY',
    'BASE', 'BASE_NOHOLD', 'TRENDGUARD', 'TRENDGUARD_XAU',
    'ICHIMOKU', 'EURUSD_NOHOLD',
    'MSFT', 'NVDA',
    'GBPUSD', 'GBPJPY', 'AUDJPY'
  ];

  symbols = ['XAUUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'GBPJPY', 'AUDJPY', 'MSFT', 'NVDA'];

  traders: any[] = [];
  selectedTraderId: number | null = null;

  strategy = 'SUPER';
  symbol = 'XAUUSD';
  days = 30;
  lot = 0.01;
  balance = 10000;

  loading = false;
  error = '';
  result: BacktestResult | null = null;
  sessionId: string | null = null;
  private pollTimer: any = null;

  constructor(private traderService: TraderService) {}

  ngOnInit() {
    this.traderService.loadTraders().subscribe({
      next: (traders) => {
        this.traders = traders;
        if (traders.length === 1) {
          this.selectedTraderId = traders[0].id;
        }
      }
    });
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  runBacktest() {
    if (!this.selectedTraderId) {
      this.error = 'Seleziona un trader';
      return;
    }

    this.loading = true;
    this.error = '';
    this.result = null;

    this.traderService.runBacktest(this.strategy, this.symbol, this.days, this.lot, this.balance, this.selectedTraderId).subscribe({
      next: (res) => {
        this.sessionId = res.session_id;
        this.startPolling();
      },
      error: (err) => {
        this.error = err.error?.error || 'Failed to start backtest';
        this.loading = false;
      }
    });
  }

  cancelBacktest() {
    if (!this.sessionId) return;
    this.traderService.cancelBacktest(this.sessionId).subscribe({
      next: () => {
        this.error = 'Backtest cancelled';
        this.loading = false;
        this.stopPolling();
      }
    });
  }

  private startPolling() {
    this.stopPolling();
    this.pollTimer = setInterval(() => {
      if (!this.sessionId) return;
      this.traderService.getBacktestStatus(this.sessionId).subscribe({
        next: (res) => {
          if (res.status === 'done') {
            this.result = res.result;
            this.loading = false;
            this.stopPolling();
          } else if (res.status === 'error') {
            this.error = res.result?.error || 'Backtest failed';
            this.loading = false;
            this.stopPolling();
          } else if (res.status === 'cancelled') {
            this.error = 'Backtest cancelled';
            this.loading = false;
            this.stopPolling();
          }
          // 'running' -> keep polling
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
}
