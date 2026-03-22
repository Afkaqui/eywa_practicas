"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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

export type ViewType =
  | 'hero' | 'diagnostic' | 'portfolio' | 'mobile' | 'validator'
  | 'notifications' | 'settings'
  | 'superadmin' | 'admin' | 'gestor';

export default function Page() {
  const { user, profile, loading, signOut } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('hero');

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
        {currentView === 'hero' && <HeroDashboard />}
        {currentView === 'diagnostic' && <DiagnosticInterface />}
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
