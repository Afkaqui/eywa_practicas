export type UserRole = 'superadmin' | 'admin' | 'gestor' | 'user';
export type UserPlan = 'free' | 'premium';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  company: string | null;
  role: UserRole;
  plan: UserPlan;
  created_at: string;
  updated_at: string;
}

export interface PortfolioCompany {
  id: string;
  name: string;
  sector: string;
  score: number;
  status: string;
  carbon: string | null;
  trend: string | null;
  last_audit: string | null;
  risk: 'bajo' | 'medio' | 'alto';
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticQuestion {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  context_title: string | null;
  context_description: string | null;
  context_impact: string | null;
  context_image: string | null;
  diagnostic_options: DiagnosticOption[];
}

export interface DiagnosticOption {
  id: string;
  question_id: string;
  label: string;
  value: string;
  score: number;
  sort_order: number;
}
