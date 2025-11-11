import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Server } from '../../models/server.model';
import { TraderService } from '../../services/trader.service'; // ✅ importa il servizio corretto
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-servers-list',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './servers-list.component.html',
  styleUrls: ['./servers-list.component.css']
})
export class ServersListComponent implements OnInit {
  servers: Server[] = [];
  loading = true;
  isLoading = false;
  testingIndex: number | null = null;
  startingIndex: number | null = null;


  error: string | null = null;

  showAddForm = false;

  newServer: Partial<Server> = {
    server: '',
    server_alias: '',
    platform: '',
    user: '',
    pwd: '',
    ip: '',
    path:'',
    port: 0,
    is_active: true,
  };

  constructor(private traderService: TraderService) {}   // ✅ inietta TraderService


  async ngOnInit() {
    await this.loadServers();
  }

  loadServers(): void {
    this.loading = true;
    this.error = null;

    // this.traderService.getAllServers2().subscribe({
    this.traderService.getAllServers().subscribe({
      next: (data) => {
        this.servers = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading servers:', err);
        this.error = err.message || 'Failed to load servers';
        this.loading = false;
      }
    });
  }

  addServer(): void {
    this.traderService.insertServer(this.newServer).subscribe({
      next: () => {
        this.loadServers();  // ricarica la lista dopo l'inserimento
        this.newServer = { server: '', server_alias:'',platform: '', user: '', pwd: '', ip: '',path:'', port: 0, is_active: true };
      },
      error: (err) => {
        console.error('Error adding server:', err);
        this.error = err.message || 'Failed to add server';
      },
    });
  }

 toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  
  deleteServer(server: Server) {
  if (!confirm(`Sei sicuro di voler eliminare il server "${server.server}"?`)) {
    return;
  }

  this.traderService.deleteServer(server.id!).subscribe({
    next: () => {
      console.log('✅ Server eliminato');
      this.loadServers(); // ricarica la lista aggiornata
    },
    error: (err) => console.error('❌ Errore durante la cancellazione:', err)
  });
}



    checkServer(index: number) {
      

    const server = this.servers[index];
    this.testingIndex = index; // 🔥 attiva loader solo per questo server


    this.traderService.checkServer(server).subscribe({
      next: (res) => {
        
        this.testingIndex = null; // 🔥 disattiva loader

        if (res.status === 'success') {
          
          alert(`✅ Connessione riuscita a ${server.server}`);
          this.servers[index].runtimeStatus = "online";


        } else {
          
          alert(`❌ Connessione fallita: ${res.message}`);
          this.servers[index].runtimeStatus = "offline";

        }
      },
      error: (err) => {
        this.testingIndex = null; // 🔥 disattiva loader anche in caso di errore

        alert(`⚠️ Errore nel test: ${err.message}`);
      }
    });
  }


  startServer(server: Server, index: number) {
  this.startingIndex = index;

  this.traderService.startServer(server).subscribe({
    next: (res: any) => {
      console.log('✅ Server avviato:', res);
      this.startingIndex = null; // spegne lo spinner
    },
    error: (err: any) => {
      console.error('❌ Errore avvio server:', err);
      this.startingIndex = null; // spegne lo spinner anche in caso di errore
    }
  });
}


}




