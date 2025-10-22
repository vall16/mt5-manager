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
  error: string | null = null;

  // newServer: Partial<Server> = {
  //   server: '',
  //   platform: '',
  //   user: '',
  //   pwd: '',
  //   ip: '',
  //   port: 0,
  //   is_active: true,
  // };

  showAddForm = false;

newServer: Partial<Server> = {
  server: '',
  platform: '',
  user: '',
  pwd: '',
  ip: '',
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

    this.traderService.getAllServers2().subscribe({
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

  // addServer(): void {
  //   this.traderService.insertServer(this.newServer).subscribe({
  //     next: () => {
  //       this.loadServers();  // ricarica la lista dopo l'inserimento
  //       this.newServer = { server: '', platform: '', user: '', pwd: '', ip: '', port: 0, is_active: true };
  //     },
  //     error: (err) => {
  //       console.error('Error adding server:', err);
  //       this.error = err.message || 'Failed to add server';
  //     },
  //   });
  // }

 toggleAddForm() {
    this.showAddForm = !this.showAddForm;
  }

  addServer() {
    // if (this.newServer.server && this.newServer.user) {
    //   this.servers.push({ ...this.newServer });
    //   this.newServer = { server: '', platform: '', user: '', ip: '', port: 0, is_active: false };
    //   this.showAddForm = false;
    // } else {
    //   alert('Please fill at least Server and User');
    // }
  }
  deleteServer(index: number) {
  if (confirm(`Are you sure you want to delete server "${this.servers[index].server}"?`)) {
    this.servers.splice(index, 1);
  }
}



}
