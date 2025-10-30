import { Component, OnInit } from '@angular/core';
// import { EventEmitter, Output } from '@angular/core';

import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TraderService } from '../../services/trader.service';
import { NewTrader, Trader,BuyRequest } from '../../models/trader.models';
import { AddTraderModalComponent } from '../add-trader-modal/add-trader-modal.component';
import { ServersListComponent } from '../servers-list/servers-list.component';
import { Server } from '../../models/server.model';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of, switchMap } from 'rxjs';




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
  // newTrader: Partial<Trader> = {}; // Oggetto per la nuova card
  // newTrader: Partial<Trader> & { master_server_id?: number; slave_server_id?: number } = {};
newTrader: NewTrader = {
  name: '',
  status: 'active'
};




  showAddModal = false;
  showServersList = false;
  selectedTrader: Trader | null = null;
  loading: boolean=false;
  error: string="";
  serverService: any;
  errorMessage: string | undefined;

  // @Output() serverAdded = new EventEmitter<void>(); // <=== AGGIUNTO


  constructor(
    public authService: AuthService,
    private traderService: TraderService,
    private router: Router
  ) {}

  ngOnInit() {

    this.loadServersAndTraders();

  }


    // loadServersAndTraders() {
    //   this.traderService.getAllServers().subscribe({
    //     next: (serversData: Server[]) => {
          
    //       console.log(serversData);
    //       this.servers = serversData;

    //       // Solo dopo che servers è pronto, carico i traders
    //       this.traderService.loadTraders().subscribe({
    //         next: (tradersData: Trader[]) => {
    //           console.log(tradersData);
    //           this.traders = tradersData;
    //         },
    //         error: (err) => console.error('Errore caricamento traders:', err)
    //       });
    //     },
    //     error: (err) => console.error('Errore caricamento servers:', err)
    //   });
    // }


    loadServersAndTraders() {
  this.loading = true; // flag di caricamento opzionale

  this.traderService.getAllServers().pipe(
    catchError(err => {
      console.error('Errore caricamento servers:', err);
      this.errorMessage = 'Impossibile caricare i server.';
      return of([] as Server[]); // ritorna array vuoto per continuare
    }),
    switchMap((serversData: Server[]) => {
      this.servers = serversData;
      if (!serversData.length) {
        console.warn('Nessun server trovato.');
      }

      return this.traderService.loadTraders().pipe(
        catchError(err => {
          console.error('Errore caricamento traders:', err);
          this.errorMessage = 'Impossibile caricare i trader.';
          return of([] as Trader[]);
        })
      );
    }),
    finalize(() => {
      this.loading = false;
    })
  ).subscribe({
    next: (tradersData: Trader[]) => {
      this.traders = tradersData;
      if (!tradersData.length) {
        console.warn('Nessun trader trovato.');
      }
    },
    error: (err) => {
      // Qui non dovrebbe più arrivare nulla perché catchError intercetta tutto
      console.error('Errore imprevisto:', err);
      this.errorMessage = 'Errore imprevisto durante il caricamento.';
    }
  });
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

  addTrader(): void {
    // Validazione minima
    if (!this.newTrader.name || !this.newTrader.master_server_id || !this.newTrader.slave_server_id) {
      alert('Please fill in all required fields (Name, Master, Slave).');
      return;
    }

    // Imposta lo status di default
    this.newTrader.status = 'active';
    this.newTrader.created_at = new Date().toISOString();

    // Prepara payload per il backend
  const payload = {
    name: this.newTrader.name,
    status: 'active',
    master_server_id: Number(this.newTrader.master_server_id),
    slave_server_id: Number(this.newTrader.slave_server_id),
    sl: this.newTrader.sl ?? null,
    tp: this.newTrader.tp ?? null,
    tsl: this.newTrader.tsl ?? null,
    moltiplicatore: this.newTrader.moltiplicatore ?? null,
    fix_lot: this.newTrader.fix_lot ?? null
  };


  console.log('Payload:', payload); // Controllo rapido del JSON inviato


    this.traderService.insertTrader(payload as Trader).subscribe({
      next: (createdTrader: Trader) => {

        const name = createdTrader.name;
        this.traders.push(createdTrader); // Aggiunge alla lista in tempo reale
        // ✅ 1. Reset form
        this.newTrader = { name: '', status: 'active' };
        this.loadTraders();
        alert(`Trader aggiunto con successo!`);



      },
      error: (err: any) => {
        console.error('Error adding trader:', err);
        alert('Failed to add trader. See console for details.');
      }
      
    });
  }

// All'interno di UserDashboardComponent
async deleteTrader(trader: Trader) {
  if (!trader.id) {
    alert('Trader ID missing.');
    return;
  }

  // Conferma con l'utente
  const confirmed = confirm(`Sei sicuro di voler eliminare il trader "${trader.name}"?`);
  if (!confirmed) return;

  // Chiamata al service per eliminare il trader
  this.traderService.deleteTrader(trader.id).subscribe({
    next: (res: any) => {
      // Aggiorna la lista locali dei traders senza ricaricare tutto
      this.traders = this.traders.filter(t => t.id !== trader.id);
      alert(`Trader "${trader.name}" eliminato con successo.`);
    },
    error: (err: any) => {
      console.error('Errore eliminazione trader:', err);
      alert(`Errore durante l'eliminazione del trader "${trader.name}".`);
    }
  });
}

  // copyOrders(trader: Trader) {
  // this.traderService.copyOrders(trader.id!).subscribe({
  //   next: (res: any) => {
  //     // alert(trader.id);
  //     // alert(`Copied ${res.copied_orders} orders for trader ${trader.name}`);
  //   },
  //   error: (err: any) => {
  //     console.error(err);
  //     alert('Error copying orders');
  //   }
  // });
  // }

//   copyOrders(trader: Trader) {
//   if (!trader.id) return;

//   // Mostra spinner sul pulsante
//   trader.copying = true;

//   this.traderService.copyOrders(trader.id).subscribe({
//     next: (res: any) => {
//       trader.copying = false;

//       // Mostra alert o toast con il risultato
//       if (res?.copied_orders != null) {
//         alert(`✅ Copied ${res.copied_orders} orders for trader "${trader.name}"`);
//       } else {
//         alert(`✅ Orders copied for trader "${trader.name}"`);
//       }
//     },
//     error: (err: any) => {
//       trader.copying = false;
//       console.error(err);
//       alert(`❌ Error copying orders for trader "${trader.name}"`);
//     }
//   });
// }

copyOrders(trader: Trader) {
  if (!trader.id) return;

  trader.copying = true;  // mostra spinner e disabilita button

  this.traderService.copyOrders(trader.id).subscribe({
    next: (res: any) => {
      trader.copying = false;
      alert(`✅ Copied ${res?.copied_orders || 0} orders for trader "${trader.name}"`);
    },
    error: (err: any) => {
      trader.copying = false;
      console.error(err);
      alert(`❌ Error copying orders for trader "${trader.name}"`);
    }
  });
}



saveTrader(trader: Trader) {
  this.traderService.updateTraderServers(trader.id!, trader.master_server_id!, trader.slave_server_id!)
    .subscribe({
      next: (updatedTrader) => {
        trader.master_server_id = updatedTrader.master_server_id;
        trader.slave_server_id = updatedTrader.slave_server_id;
        alert(`Trader "${trader.name}" aggiornato con successo!`);
      },
      error: (err) => {
        console.error(err);
        alert('Errore durante l\'aggiornamento del trader');
      }
    });
}



  openAddModal() {
    this.showAddModal = true;
  }

  openServersList() {
    this.showServersList = true;
  }

  openBuyPosition() {
    
    const order: BuyRequest = {
      symbol: 'EURUSD',
      lot: 0.1,
      sl_point: 50,  // 50 punti stop loss
      tp_point: 100, // 100 punti take profit
      magic: 123456,
      comment: 'Ordine da Angular'
    };

    this.traderService.openBuyOrder(order).subscribe({
      next: (res: any) => console.log('Ordine aperto:', res),
      error: (err: any) => console.error('Errore ordine:', err)
    });
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
