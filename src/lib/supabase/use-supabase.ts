"use client";

import { useMemo } from 'react';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Hook centralizado para obtener la instancia del cliente Supabase.
 * Reemplaza la creación de múltiples instancias en cada componente.
 * useMemo garantiza una sola instancia por componente montado.
 */
export function useSupabase() {
  return useMemo(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ), []);
}
