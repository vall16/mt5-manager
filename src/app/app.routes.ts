import { Routes } from '@angular/router';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { BacktestComponent } from './components/backtest/backtest.component';
import { SignalResearchComponent } from './components/signal-research/signal-research.component';
import { AutoSignalComponent } from './components/auto-signal/auto-signal.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  
  { path: '', component: LoginComponent },     
  // { path: '', component: UserDashboardComponent },       
  { path: 'history', component: HistoryComponent },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  { path: 'backtest', component: BacktestComponent },
  { path: 'signal-research', component: SignalResearchComponent },
  { path: 'signal-research-auto', component: AutoSignalComponent },
  //  { path: 'user-dashboard', component: UserDashboardComponent },
  
];

