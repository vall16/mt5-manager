import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://eeekjxwsvfkdwfceccsd.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlZWtqeHdzdmZrZHdmY2VjY3NkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1Njc4MTksImV4cCI6MjA3NjE0MzgxOX0.BJZivwY8s1JEA-M_CKlOa3-LkOpl_-L_BJEQZFHCo18'
    );
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }
}
