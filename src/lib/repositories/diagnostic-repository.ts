import type { SupabaseClient } from '@supabase/supabase-js';
import type { DiagnosticQuestion, DiagnosticResult } from '@/lib/types/database';

export interface DiagnosticResultRow {
  id: string;
  user_id: string;
  score: number;
  max_score: number;
  percentage: number;
  level: string;
  breakdown: DiagnosticResult['breakdown'];
  created_at: string;
}

export class DiagnosticRepository {
  constructor(private supabase: SupabaseClient) {}

  async getQuestions(): Promise<DiagnosticQuestion[]> {
    const { data, error } = await this.supabase
      .from('diagnostic_questions')
      .select('*, diagnostic_options(*)')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getLatestResult(userId: string): Promise<DiagnosticResultRow | null> {
    const { data, error } = await this.supabase
      .from('diagnostic_results')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  async saveResult(result: Omit<DiagnosticResultRow, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('diagnostic_results')
      .insert(result);

    if (error) throw error;
  }
}
