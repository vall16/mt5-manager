import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service';
import { Trader, CreateTraderRequest } from '../models/trader.models';

@Injectable({
  providedIn: 'root'
})
export class TraderService {
  private tradersSubject: BehaviorSubject<Trader[]> = new BehaviorSubject<Trader[]>([]);
  public traders$: Observable<Trader[]> = this.tradersSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private authService: AuthService
  ) {}

  async loadTraders(): Promise<void> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) return;

    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('traders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading traders:', error);
        return;
      }

      this.tradersSubject.next(data || []);
    } catch (error) {
      console.error('Error loading traders:', error);
    }
  }

  async createTrader(request: CreateTraderRequest): Promise<{ success: boolean; message: string; trader?: Trader }> {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    try {
      const supabase = this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('traders')
        .insert({
          user_id: currentUser.id,
          name: request.name,
          mt5_login: request.mt5_login,
          mt5_password: request.mt5_password,
          mt5_server: request.mt5_server,
          status: 'inactive'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating trader:', error);
        return { success: false, message: 'Failed to create trader' };
      }

      await this.loadTraders();
      return { success: true, message: 'Trader created successfully', trader: data };
    } catch (error) {
      console.error('Error creating trader:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  async updateTrader(id: string, updates: Partial<Trader>): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase
        .from('traders')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Error updating trader:', error);
        return { success: false, message: 'Failed to update trader' };
      }

      await this.loadTraders();
      return { success: true, message: 'Trader updated successfully' };
    } catch (error) {
      console.error('Error updating trader:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  async deleteTrader(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const supabase = this.supabaseService.getClient();
      const { error } = await supabase
        .from('traders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting trader:', error);
        return { success: false, message: 'Failed to delete trader' };
      }

      await this.loadTraders();
      return { success: true, message: 'Trader deleted successfully' };
    } catch (error) {
      console.error('Error deleting trader:', error);
      return { success: false, message: 'An error occurred' };
    }
  }

  getTraders(): Trader[] {
    return this.tradersSubject.value;
  }
}
