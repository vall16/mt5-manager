import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TraderService } from '../../services/trader.service';
import { Trader } from '../../models/trader.models';
import { AddTraderModalComponent } from '../add-trader-modal/add-trader-modal.component';
import { ServersListComponent } from '../servers-list/servers-list.component';



@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, AddTraderModalComponent, ServersListComponent],
  
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  traders: Trader[] = [];
  showAddModal = false;
  showServersList = false;
  selectedTrader: Trader | null = null;

  constructor(
    public authService: AuthService,
    private traderService: TraderService,
    private router: Router
  ) {}

  ngOnInit() {
    // this.loadTraders();
    // this.traderService.traders$.subscribe(traders => {
    //   this.traders = traders;
    // });
  }

  // async loadTraders() {
  //   await this.traderService.loadTraders();
  // }

  openAddModal() {
    this.showAddModal = true;
  }

  openServersList() {
    this.showServersList = true;
  }

  closeAddModal() {
    this.showAddModal = false;
  }

  closeServersList() {
    this.showServersList = false;
  }

  // async onTraderAdded() {
  //   this.showAddModal = false;
  //   await this.loadTraders();
  // }

  // async deleteTrader(trader: Trader) {
  //   if (!confirm(`Delete trader "${trader.name}"?`)) {
  //     return;
  //   }

  //   const result = await this.traderService.deleteTrader(trader.id);
  //   if (result.success) {
  //     await this.loadTraders();
  //   } else {
  //     alert(result.message);
  //   }
  // }

  async toggleTraderStatus(trader: Trader) {
    const newStatus = trader.status === 'active' ? 'inactive' : 'active';
    // await this.traderService.updateTrader(trader.id, { status: newStatus });
  }

  
  goToMT5Dashboard(trader: Trader) {
    this.router.navigate(['/dashboard'], { state: { trader } });
  }

  logout() {
    this.authService.logout();
  }
}
