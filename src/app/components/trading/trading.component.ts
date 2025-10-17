import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Mt5ApiService } from '../../services/mt5-api.service';
import { SymbolInfo, OrderRequest, Tick } from '../../models/mt5.models';

@Component({
  selector: 'app-trading',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css']
})
export class TradingComponent implements OnInit {
  symbols: SymbolInfo[] = [];
  selectedSymbol: string = '';
  currentTick: Tick | null = null;

  orderForm = {
    lot: 0.1,
    sl_point: 50,
    tp_point: 100,
    deviation: 10,
    magic: 123456,
    comment: ''
  };

  loading = false;
  message: string | null = null;
  messageType: 'success' | 'error' = 'success';
  symbolSearch: string = '';

  constructor(private mt5Service: Mt5ApiService) {}

  ngOnInit() {
    this.loadSymbols();
  }

  loadSymbols() {
    this.loading = true;
    this.mt5Service.getTradableSymbols().subscribe({
      next: (data) => {
        this.symbols = data.filter(s => s.tradable);
        if (this.symbols.length > 0) {
          this.selectedSymbol = this.symbols[0].symbol;
          this.loadTick();
        }
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Failed to load symbols', 'error');
        this.loading = false;
      }
    });
  }

  onSymbolChange() {
    if (this.selectedSymbol) {
      this.loadTick();
    }
  }

  loadTick() {
    if (!this.selectedSymbol) return;

    this.mt5Service.getLastTick(this.selectedSymbol).subscribe({
      next: (data) => {
        this.currentTick = data;
      },
      error: (err) => {
        console.error('Failed to load tick', err);
      }
    });
  }

  get filteredSymbols() {
    if (!this.symbolSearch) return this.symbols;
    return this.symbols.filter(s =>
      s.symbol.toLowerCase().includes(this.symbolSearch.toLowerCase())
    );
  }

  executeBuy() {
    if (!this.selectedSymbol) {
      this.showMessage('Please select a symbol', 'error');
      return;
    }

    const orderRequest: OrderRequest = {
      symbol: this.selectedSymbol,
      lot: this.orderForm.lot,
      sl_point: this.orderForm.sl_point,
      tp_point: this.orderForm.tp_point,
      deviation: this.orderForm.deviation,
      magic: this.orderForm.magic,
      comment: this.orderForm.comment
    };

    this.loading = true;
    this.mt5Service.buyOrder(orderRequest).subscribe({
      next: (result) => {
        if (result.retcode === 10009) {
          this.showMessage(`BUY order executed successfully. Deal: ${result.deal}`, 'success');
        } else {
          this.showMessage(`Order failed. Code: ${result.retcode}`, 'error');
        }
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Failed to execute BUY order', 'error');
        this.loading = false;
      }
    });
  }

  executeSell() {
    if (!this.selectedSymbol) {
      this.showMessage('Please select a symbol', 'error');
      return;
    }

    const orderRequest: OrderRequest = {
      symbol: this.selectedSymbol,
      lot: this.orderForm.lot,
      sl_point: this.orderForm.sl_point,
      tp_point: this.orderForm.tp_point,
      deviation: this.orderForm.deviation,
      magic: this.orderForm.magic,
      comment: this.orderForm.comment
    };

    this.loading = true;
    this.mt5Service.sellOrder(orderRequest).subscribe({
      next: (result) => {
        if (result.retcode === 10009) {
          this.showMessage(`SELL order executed successfully. Deal: ${result.deal}`, 'success');
        } else {
          this.showMessage(`Order failed. Code: ${result.retcode}`, 'error');
        }
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Failed to execute SELL order', 'error');
        this.loading = false;
      }
    });
  }

  closeAllPositions() {
    if (!this.selectedSymbol) {
      this.showMessage('Please select a symbol', 'error');
      return;
    }

    if (!confirm(`Close all positions for ${this.selectedSymbol}?`)) {
      return;
    }

    this.loading = true;
    this.mt5Service.closeAllPositions({
      symbol: this.selectedSymbol,
      magic: this.orderForm.magic,
      deviation: this.orderForm.deviation
    }).subscribe({
      next: (results) => {
        const successCount = results.filter(r => r.retcode === 10009).length;
        this.showMessage(`Closed ${successCount} positions`, 'success');
        this.loading = false;
      },
      error: (err) => {
        this.showMessage('Failed to close positions', 'error');
        this.loading = false;
      }
    });
  }

  refreshTick() {
    this.loadTick();
  }

  showMessage(msg: string, type: 'success' | 'error') {
    this.message = msg;
    this.messageType = type;
    setTimeout(() => {
      this.message = null;
    }, 5000);
  }

  getSpreadPips(): number {
    if (!this.currentTick) return 0;
    const symbolInfo = this.symbols.find(s => s.symbol === this.selectedSymbol);
    if (!symbolInfo) return 0;
    return (this.currentTick.ask - this.currentTick.bid) / symbolInfo.point;
  }
}
