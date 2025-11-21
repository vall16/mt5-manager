// src/app/components/listen-button/listen-button.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalService } from '../../services/signal.service';


@Component({
  selector: 'app-listen-button',
  templateUrl: './listen-button.component.html',
})
export class ListenButtonComponent implements OnInit, OnDestroy {
  signal: string | null = null;
  subscription: Subscription | null = null;

  constructor(private signalService: SignalService) {}

  ngOnInit() {
  this.subscription = this.signalService.pollSignal(5000)
    .subscribe(res => {
      // Aggiorna la proprietà signal
      this.signal = res.signal;

      // Mostra alert solo quando c'è BUY
    //   if (this.signal === 'BUY') {
        // alert('🚀 Segnale  rilevato!');
    //   }
    });
}


  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
