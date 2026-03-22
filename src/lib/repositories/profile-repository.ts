import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types/database';

export class ProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async getById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async getAll(): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateRole(userId: string, role: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) throw error;
  }

  async updatePlan(userId: string, plan: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ plan })
      .eq('id', userId);

    if (error) throw error;
  }
}
