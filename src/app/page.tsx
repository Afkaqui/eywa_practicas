"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createBrowserClient } from '@supabase/ssr';
import { HomePage } from '@/components/HomePage';
import { LoginPage } from '@/components/LoginPage';
import { HeroDashboard } from '@/components/HeroDashboard';
import { DiagnosticInterface } from '@/components/DiagnosticInterface';
import { InvestorPortfolio } from '@/components/InvestorPortfolio';
import { MobileApp } from '@/components/MobileApp';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { ValidadorProyectos } from '@/components/ValidadorProyectos';
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { GestorDashboard } from '@/components/GestorDashboard';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { DiagnosticResult } from '@/lib/types/database';

type ViewType =
  | 'hero' | 'diagnostic' | 'portfolio' | 'mobile' | 'validator'
  | 'notifications' | 'settings'
  | 'superadmin' | 'admin' | 'gestor';

export default function Page() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('hero');
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  const supabase = useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);

  // Load latest diagnostic result from Supabase (non-blocking)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const loadResult = async () => {
      try {
        const { data } = await supabase
          .from('diagnostic_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && data) {
          setDiagnosticResult({
            score: data.score,
            maxScore: data.max_score,
            breakdown: data.breakdown as DiagnosticResult['breakdown'],
            completedAt: data.created_at,
          });
        }
      } catch {
        // table doesn't exist or no results
      }
    };
    loadResult();

    return () => { cancelled = true; };
  }, [user, supabase]);

  // Save diagnostic result to Supabase
  const handleDiagnosticComplete = useCallback(async (result: DiagnosticResult) => {
    setDiagnosticResult(result);

    if (user) {
      const percentage = Math.round((result.score / result.maxScore) * 100);
      const level = percentage >= 80 ? 'Excelente' : percentage >= 60 ? 'Bueno' : percentage >= 40 ? 'Moderado' : 'Inicial';

      await supabase
        .from('diagnostic_results')
        .insert({
          user_id: user.id,
          score: result.score,
          max_score: result.maxScore,
          percentage,
          level,
          breakdown: result.breakdown,
        });
    }
  }, [user, supabase]);

  if (loading) return <LoadingScreen />;

  if (!user && showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} />;
  }

  if (!user) {
    return <HomePage onGetStarted={() => setShowLogin(true)} />;
  }

  const role = profile?.role || 'user';

  return (
    <div className="flex min-h-screen bg-white">
      <NavigationSidebar
        currentView={currentView}
        userRole={role}
        userName={profile?.full_name || 'Usuario'}
        userEmail={profile?.email || ''}
        onNavigate={(view) => setCurrentView(view as ViewType)}
        onLogout={signOut}
      />

      <div className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 transition-all duration-300">
        {currentView === 'hero' && <HeroDashboard diagnosticResult={diagnosticResult} onStartDiagnostic={() => setCurrentView('diagnostic')} />}
        {currentView === 'diagnostic' && <DiagnosticInterface onScoreComplete={(result) => { handleDiagnosticComplete(result); setCurrentView('hero'); }} />}
        {currentView === 'validator' && <ValidadorProyectos />}
        {currentView === 'portfolio' && <InvestorPortfolio />}
        {currentView === 'mobile' && <MobileApp />}

        {currentView === 'superadmin' && role === 'superadmin' && <SuperAdminDashboard />}
        {currentView === 'admin' && ['superadmin', 'admin'].includes(role) && <AdminDashboard />}
        {currentView === 'gestor' && ['superadmin', 'admin', 'gestor'].includes(role) && <GestorDashboard />}

        {currentView === 'notifications' && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">Notificaciones</h2>
              <p className="text-sm md:text-base text-gray-600">Panel de notificaciones en desarrollo</p>
            </div>
          </div>
        )}
        {currentView === 'settings' && (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 md:p-8">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">Configuración</h2>
              <p className="text-sm md:text-base text-gray-600">Panel de configuración en desarrollo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
