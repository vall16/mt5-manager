import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mt5ApiService } from '../../services/mt5-api.service';
import { Deal } from '../../models/mt5.models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css']
})
export class HistoryComponent implements OnInit {
  deals: Deal[] = [];
  filteredDeals: Deal[] = [];
  loading = false;
  symbolFilter: string = '';

  constructor(private mt5Service: Mt5ApiService) {}

  ngOnInit() {
    this.loadDealsHistory();
  }

  loadDealsHistory(symbol?: string) {
    this.loading = true;
    this.mt5Service.getDealsHistory(symbol).subscribe({
      next: (response) => {
        this.deals = response.data;
        this.filteredDeals = this.deals;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load deals history', err);
        this.loading = false;
      }
    });
  }

  filterBySymbol() {
    if (this.symbolFilter.trim() === '') {
      this.loadDealsHistory();
    } else {
      this.loadDealsHistory(this.symbolFilter.trim());
    }
  }

  clearFilter() {
    this.symbolFilter = '';
    this.loadDealsHistory();
  }

  getDealType(type: number): string {
    const types: { [key: number]: string } = {
      0: 'BUY',
      1: 'SELL',
      2: 'BALANCE',
      3: 'CREDIT',
      4: 'CHARGE',
      5: 'COMMISSION'
    };
    return types[type] || 'UNKNOWN';
  }

  getDealTypeClass(type: number): string {
    if (type === 0) return 'deal-buy';
    if (type === 1) return 'deal-sell';
    return 'deal-other';
  }

  formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
  }

  getTotalProfit(): number {
    return this.filteredDeals.reduce((sum, deal) => sum + deal.profit, 0);
  }

  getTotalCommission(): number {
    return this.filteredDeals.reduce((sum, deal) => sum + deal.commission, 0);
  }

  getNetProfit(): number {
    return this.getTotalProfit() + this.getTotalCommission();
  }

  refresh() {
    this.loadDealsHistory(this.symbolFilter.trim() || undefined);
  }
}
