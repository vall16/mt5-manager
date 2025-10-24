import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TraderService } from '../../services/trader.service';
import { Trader } from '../../models/trader.models';
import { AddTraderModalComponent } from '../add-trader-modal/add-trader-modal.component';
import { ServersListComponent } from '../servers-list/servers-list.component';
import { Server } from '../../models/server.model';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,AddTraderModalComponent, ServersListComponent],
  
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  traders: Trader[] = [];
  servers: Server[] = [];

  showAddModal = false;
  showServersList = false;
  selectedTrader: Trader | null = null;
  loading: boolean=false;
  error: string="";
  serverService: any;

  constructor(
    public authService: AuthService,
    private traderService: TraderService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTraders();
    this.loadServers();

    
  }
loadServers() {
  this.traderService.getAllServers().subscribe(res => this.servers = res);
}

  async loadTraders() {
    this.loading = true;
    this.error = '';

    this.traderService.loadTraders().subscribe({
      next: (res: Trader[]) => {
        this.traders = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento traders:', err);
        this.error = 'Errore durante il caricamento dei traders';
        this.loading = false;
      }
    });
  }



  

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

  getServerNameById(serverId?: number): string {
  if (!this.servers || this.servers.length === 0) return 'Unknown';

  const server = this.servers.find(s => s.id === serverId);
  return server ? server.server : 'Unknown';
}


  
  goToMT5Dashboard(trader: Trader) {
    this.router.navigate(['/dashboard'], { state: { trader } });
  }

  logout() {
    this.authService.logout();
  }
}
