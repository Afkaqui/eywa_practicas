import type { SupabaseClient } from '@supabase/supabase-js';
import type { PortfolioCompany } from '@/lib/types/database';

export class PortfolioRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAll(): Promise<PortfolioCompany[]> {
    const { data, error } = await this.supabase
      .from('portfolio_companies')
      .select('*')
      .order('score', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async create(company: Omit<PortfolioCompany, 'id' | 'created_at' | 'updated_at'>): Promise<PortfolioCompany> {
    const { data, error } = await this.supabase
      .from('portfolio_companies')
      .insert(company)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async update(id: string, updates: Partial<PortfolioCompany>): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_companies')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('portfolio_companies')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}
