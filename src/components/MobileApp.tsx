"use client";

import { useState } from 'react';
import { Home, BarChart3, FileText, Settings, ChevronRight } from 'lucide-react';

export function MobileApp() {
  const [selectedTab, setSelectedTab] = useState('home');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      {/* iPhone 15 Pro Frame */}
      <div className="w-[393px] h-[852px] bg-black rounded-[60px] p-2 shadow-2xl">
        <div className="w-full h-full bg-white rounded-[52px] overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="bg-white px-8 pt-3 pb-2">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>9:41</span>
              <div className="flex items-center gap-1.5">
                <div className="flex gap-0.5">
                  <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
                  <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
                  <div className="w-1 h-3 bg-gray-900 rounded-full"></div>
                  <div className="w-1 h-3 bg-gray-400 rounded-full"></div>
                </div>
                <div className="w-4 h-2 border border-gray-900 rounded-sm relative">
                  <div className="absolute inset-0.5 bg-gray-900 rounded-sm"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* Header */}
            <div className="px-6 pt-4 pb-6 bg-gradient-to-b from-white to-gray-50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-1">Bienvenido de nuevo</div>
                  <h1 className="text-2xl font-semibold text-gray-900">Panel</h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">E</span>
                </div>
              </div>

              {/* Trust Score Card */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Trust Score</div>
                  <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded border border-amber-200">
                    Gold
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-5xl font-light text-gray-900">85</span>
                  <span className="text-xl text-gray-400 font-light">/100</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'Ambiental', value: 92 },
                    { label: 'Social', value: 81 },
                    { label: 'Gobernanza', value: 82 },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{item.label}</span>
                        <span className="font-semibold text-gray-900">{item.value}</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                          style={{ width: `${item.value}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="px-6 py-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Métricas Clave</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Carbono</div>
                  <div className="text-2xl font-light text-gray-900 mb-1">1,204</div>
                  <div className="text-xs text-gray-500">Tons CO₂</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Gap IMI</div>
                  <div className="text-2xl font-light text-gray-900 mb-1">-12%</div>
                  <div className="text-xs text-emerald-600">Mejorando</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Próxima Auditoría</div>
                  <div className="text-2xl font-light text-gray-900 mb-1">45</div>
                  <div className="text-xs text-gray-500">Días</div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Proyectos</div>
                  <div className="text-2xl font-light text-gray-900 mb-1">24</div>
                  <div className="text-xs text-gray-500">Activos</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-6 py-4">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Acciones Rápidas</div>
              <div className="space-y-2">
                {[
                  { label: 'Iniciar Evaluación', sublabel: 'Comenzar nuevo diagnóstico' },
                  { label: 'Ver Reportes', sublabel: 'Acceder a análisis' },
                  { label: 'Datos de Carbono', sublabel: 'Actualizar métricas' },
                ].map((action, i) => (
                  <button key={i} className="w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="text-left">
                      <div className="text-sm font-medium text-gray-900">{action.label}</div>
                      <div className="text-xs text-gray-500">{action.sublabel}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="px-6 py-4 pb-24">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Actividad Reciente</div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="space-y-4">
                  {[
                    { event: 'Diagnóstico completado', time: 'Hace 2h', status: 'success' },
                    { event: 'Datos de carbono actualizados', time: 'Hace 5h', status: 'info' },
                    { event: 'Curso inscrito', time: 'Hace 1d', status: 'info' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        item.status === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-gray-900 font-medium">{item.event}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-white border-t border-gray-200 px-4 py-2">
            <div className="flex items-center justify-around">
              {[
                { icon: Home, label: 'Inicio', id: 'home' },
                { icon: BarChart3, label: 'Análisis', id: 'analytics' },
                { icon: FileText, label: 'Reportes', id: 'reports' },
                { icon: Settings, label: 'Ajustes', id: 'settings' },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = selectedTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedTab(item.id)}
                    className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                      isActive ? 'text-emerald-600' : 'text-gray-400'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}