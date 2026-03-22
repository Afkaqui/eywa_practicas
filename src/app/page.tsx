"use client";

import { useState } from 'react';
import { HomePage } from '@/components/HomePage';
import { LoginPage } from '@/components/LoginPage';
import { HeroDashboard } from '@/components/HeroDashboard';
import { DiagnosticInterface } from '@/components/DiagnosticInterface';
import { InvestorPortfolio } from '@/components/InvestorPortfolio';
import { MobileApp } from '@/components/MobileApp';
import { NavigationSidebar } from '@/components/NavigationSidebar';
import { ValidadorProyectos } from '@/components/ValidadorProyectos';

export default function Page() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [currentView, setCurrentView] = useState<'hero' | 'diagnostic' | 'portfolio' | 'mobile' | 'notifications' | 'settings' | 'validator'>('hero');

  // Si no está logueado y se muestra login
  if (!isLoggedIn && showLogin) {
    return (
      <LoginPage
        onLogin={() => {
          setIsLoggedIn(true);
        }}
        onBack={() => setShowLogin(false)}
      />
    );
  }

  // Si no está logueado y no se muestra login, mostrar HomePage
  if (!isLoggedIn) {
    return <HomePage onGetStarted={() => setShowLogin(true)} />;
  }

  // Si está logueado, mostrar dashboard con sidebar
  return (
    <div className="flex min-h-screen bg-white">
      {/* Navigation Sidebar */}
      <NavigationSidebar
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view as any)}
        onLogout={() => {
          setIsLoggedIn(false);
          localStorage.removeItem('userPlan');
          localStorage.removeItem('userEmail');
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-20 pb-20 md:pb-0 transition-all duration-300">
        {currentView === 'hero' && <HeroDashboard />}
        {currentView === 'diagnostic' && <DiagnosticInterface />}
        {currentView === 'validator' && <ValidadorProyectos />}
        {currentView === 'portfolio' && <InvestorPortfolio />}
        {currentView === 'mobile' && <MobileApp />}

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
