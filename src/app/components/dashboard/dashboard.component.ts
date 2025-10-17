import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mt5ApiService } from '../../services/mt5-api.service';
import { AccountInfo, MarginInfo, Position } from '../../models/mt5.models';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  accountInfo: AccountInfo | null = null;
  marginInfo: MarginInfo | null = null;
  openPositions: Position[] = [];
  isConnected = false;
  error: string | null = null;
  private subscription?: Subscription;

  constructor(private mt5Service: Mt5ApiService) {}

  ngOnInit() {
    this.checkConnection();
    this.loadData();
    this.startAutoRefresh();
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  checkConnection() {
    this.mt5Service.healthCheck().subscribe({
      next: (response) => {
        this.isConnected = response.status === 'ok';
      },
      error: (err) => {
        this.isConnected = false;
        this.error = 'Connection failed';
      }
    });
  }

  loadData() {
    this.loadAccountInfo();
    this.loadMarginInfo();
    this.loadOpenPositions();
  }

  loadAccountInfo() {
    this.mt5Service.getAccountInfo().subscribe({
      next: (data) => {
        this.accountInfo = data;
        this.error = null;
      },
      error: (err) => {
        this.error = 'Failed to load account info';
        console.error(err);
      }
    });
  }

  loadMarginInfo() {
    this.mt5Service.getAccountMargin().subscribe({
      next: (data) => {
        this.marginInfo = data;
      },
      error: (err) => {
        console.error('Failed to load margin info', err);
      }
    });
  }

  loadOpenPositions() {
    this.mt5Service.getOpenPositions().subscribe({
      next: (data) => {
        this.openPositions = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Failed to load positions', err);
      }
    });
  }

  startAutoRefresh() {
    this.subscription = interval(5000)
      .pipe(switchMap(() => this.mt5Service.getAccountMargin()))
      .subscribe({
        next: (data) => {
          this.marginInfo = data;
        }
      });

    interval(3000)
      .pipe(switchMap(() => this.mt5Service.getOpenPositions()))
      .subscribe({
        next: (data) => {
          this.openPositions = Array.isArray(data) ? data : [];
        }
      });
  }

  getPositionType(type: number): string {
    return type === 0 ? 'BUY' : 'SELL';
  }

  getPositionClass(profit: number): string {
    return profit >= 0 ? 'profit-positive' : 'profit-negative';
  }

  getTotalProfit(): number {
    return this.openPositions.reduce((sum, pos) => sum + pos.profit, 0);
  }

  refresh() {
    this.loadData();
  }
}
