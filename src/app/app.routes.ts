import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TradingComponent } from './components/trading/trading.component';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  
  { path: '', component: LoginComponent },     
  // { path: '', component: UserDashboardComponent },       
  { path: 'dashboard', component: DashboardComponent },
  { path: 'trading', component: TradingComponent },
  { path: 'history', component: HistoryComponent },
  { path: 'user-dashboard', component: UserDashboardComponent, canActivate: [authGuard] },
  //  { path: 'user-dashboard', component: UserDashboardComponent },
  
];

