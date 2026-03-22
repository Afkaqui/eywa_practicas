-- ╔═══════════════════════════════════════════════════════════════╗
-- ║  EYWA Platform - Supabase Database Setup                    ║
-- ║  Ejecutar en: Supabase Dashboard → SQL Editor               ║
-- ║  Última actualización: 2026-03-22                           ║
-- ╚═══════════════════════════════════════════════════════════════╝

-- ════════════════════════════════════════
-- PASO 1: Tipos personalizados
-- ════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('superadmin', 'admin', 'gestor', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE user_plan AS ENUM ('free', 'premium');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ════════════════════════════════════════
-- PASO 2: Tabla de perfiles
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  company TEXT,
  role user_role NOT NULL DEFAULT 'user',
  plan user_plan NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: auto-crear perfil al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: auto-actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ════════════════════════════════════════
-- PASO 3: Tabla de empresas del portfolio
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.portfolio_companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL DEFAULT 'Pendiente',
  carbon TEXT,
  trend TEXT,
  last_audit TEXT,
  risk TEXT NOT NULL DEFAULT 'medio' CHECK (risk IN ('bajo', 'medio', 'alto')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS portfolio_companies_updated_at ON public.portfolio_companies;
CREATE TRIGGER portfolio_companies_updated_at
  BEFORE UPDATE ON public.portfolio_companies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ════════════════════════════════════════
-- PASO 4: Tablas de preguntas diagnósticas
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.diagnostic_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sort_order INTEGER NOT NULL DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  context_title TEXT,
  context_description TEXT,
  context_impact TEXT,
  context_image TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.diagnostic_options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.diagnostic_questions(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0
);

DROP TRIGGER IF EXISTS diagnostic_questions_updated_at ON public.diagnostic_questions;
CREATE TRIGGER diagnostic_questions_updated_at
  BEFORE UPDATE ON public.diagnostic_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ════════════════════════════════════════
-- PASO 5: Tabla de resultados diagnósticos
-- ════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.diagnostic_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  percentage INTEGER NOT NULL,
  level TEXT NOT NULL,
  breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índice para buscar resultados por usuario eficientemente
CREATE INDEX IF NOT EXISTS idx_diagnostic_results_user_id
  ON public.diagnostic_results(user_id);

CREATE INDEX IF NOT EXISTS idx_diagnostic_results_created_at
  ON public.diagnostic_results(user_id, created_at DESC);

-- ════════════════════════════════════════
-- PASO 6: Row Level Security (RLS)
-- ════════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnostic_results ENABLE ROW LEVEL SECURITY;

-- Función helper: obtener rol del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── PROFILES ──

-- Permitir inserción desde trigger (SECURITY DEFINER)
CREATE POLICY "Allow trigger insert profiles"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.get_user_role() IN ('superadmin', 'admin'));

CREATE POLICY "Users can update own profile basic fields"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND plan = (SELECT plan FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Superadmin can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'superadmin');

CREATE POLICY "Admin can update user plan"
  ON public.profiles FOR UPDATE
  USING (public.get_user_role() = 'admin')
  WITH CHECK (
    role = (SELECT role FROM public.profiles WHERE id = profiles.id)
  );

-- ── PORTFOLIO COMPANIES ──

CREATE POLICY "Authenticated users can read portfolio"
  ON public.portfolio_companies FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestors can insert portfolio"
  ON public.portfolio_companies FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can update portfolio"
  ON public.portfolio_companies FOR UPDATE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can delete portfolio"
  ON public.portfolio_companies FOR DELETE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

-- ── DIAGNOSTIC QUESTIONS ──

CREATE POLICY "Authenticated users can read questions"
  ON public.diagnostic_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestors can insert questions"
  ON public.diagnostic_questions FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can update questions"
  ON public.diagnostic_questions FOR UPDATE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can delete questions"
  ON public.diagnostic_questions FOR DELETE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

-- ── DIAGNOSTIC OPTIONS ──

CREATE POLICY "Authenticated users can read options"
  ON public.diagnostic_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Gestors can insert options"
  ON public.diagnostic_options FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can update options"
  ON public.diagnostic_options FOR UPDATE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can delete options"
  ON public.diagnostic_options FOR DELETE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

-- ── DIAGNOSTIC RESULTS ──

CREATE POLICY "Users can view own results"
  ON public.diagnostic_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all results"
  ON public.diagnostic_results FOR SELECT
  USING (public.get_user_role() IN ('superadmin', 'admin'));

CREATE POLICY "Users can insert own results"
  ON public.diagnostic_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own results"
  ON public.diagnostic_results FOR DELETE
  USING (auth.uid() = user_id);

-- ════════════════════════════════════════
-- PASO 6.5: Tablas Edutech (Cursos)
-- ════════════════════════════════════════

DO $$ BEGIN
  CREATE TYPE course_level AS ENUM ('basico', 'intermedio', 'avanzado');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE course_category AS ENUM ('agrotech', 'edutech', 'banca_sostenible', 'esg', 'general');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category course_category NOT NULL DEFAULT 'general',
  level course_level NOT NULL DEFAULT 'basico',
  duration_hours INTEGER NOT NULL DEFAULT 1,
  image_url TEXT,
  instructor TEXT NOT NULL DEFAULT 'EYWA Academy',
  lessons_count INTEGER NOT NULL DEFAULT 1,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS courses_updated_at ON public.courses;
CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed BOOLEAN NOT NULL DEFAULT false,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_user
  ON public.course_enrollments(user_id);

CREATE INDEX IF NOT EXISTS idx_course_enrollments_course
  ON public.course_enrollments(course_id);

-- RLS para cursos
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;

-- ── COURSES ──
CREATE POLICY "Authenticated users can read published courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (is_published = true);

CREATE POLICY "Gestors can read all courses"
  ON public.courses FOR SELECT
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can insert courses"
  ON public.courses FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can update courses"
  ON public.courses FOR UPDATE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

CREATE POLICY "Gestors can delete courses"
  ON public.courses FOR DELETE
  USING (public.get_user_role() IN ('gestor', 'admin', 'superadmin'));

-- ── COURSE ENROLLMENTS ──
CREATE POLICY "Users can view own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all enrollments"
  ON public.course_enrollments FOR SELECT
  USING (public.get_user_role() IN ('superadmin', 'admin'));

CREATE POLICY "Users can enroll themselves"
  ON public.course_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own enrollment"
  ON public.course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own enrollment"
  ON public.course_enrollments FOR DELETE
  USING (auth.uid() = user_id);

-- ════════════════════════════════════════
-- PASO 7: Datos iniciales (Seed)
-- ════════════════════════════════════════

-- Empresas del portfolio (solo si la tabla está vacía)
INSERT INTO public.portfolio_companies (name, sector, score, status, carbon, trend, last_audit, risk)
SELECT * FROM (VALUES
  ('Amazonia Agrotech', 'Agricultura', 85, 'Verificado', '1,204t', '+5%', 'Hace 2 dias', 'bajo'),
  ('Verde Innovations', 'Tecnologia', 78, 'Auditoria Pendiente', '892t', '+2%', 'Hace 14 dias', 'medio'),
  ('EcoSolutions Corp', 'Energia', 92, 'Verificado', '2,156t', '+8%', 'Hace 1 dia', 'bajo'),
  ('BioTech Dynamics', 'Biotecnologia', 71, 'En Revision', '645t', '-1%', 'Hace 21 dias', 'alto'),
  ('Sustainable Futures Inc', 'Manufactura', 88, 'Verificado', '1,567t', '+6%', 'Hace 5 dias', 'bajo')
) AS v(name, sector, score, status, carbon, trend, last_audit, risk)
WHERE NOT EXISTS (SELECT 1 FROM public.portfolio_companies LIMIT 1);

-- Preguntas diagnósticas con opciones (solo si la tabla está vacía)
DO $$
DECLARE
  q1_id UUID;
  q2_id UUID;
  q3_id UUID;
BEGIN
  -- Solo insertar si no hay preguntas
  IF EXISTS (SELECT 1 FROM public.diagnostic_questions LIMIT 1) THEN
    RETURN;
  END IF;

  INSERT INTO public.diagnostic_questions (sort_order, title, description, context_title, context_description, context_impact, context_image)
  VALUES (1, 'Estado de Certificación Orgánica',
    'Seleccione el estado actual de certificación orgánica de su empresa. Esta información es crítica para la evaluación de sostenibilidad.',
    'Certificación Orgánica',
    'La certificación orgánica valida prácticas agrícolas sostenibles y garantiza el cumplimiento de estándares ambientales.',
    '+15 puntos',
    'https://images.unsplash.com/photo-1763241841248-11aa17ab625a?w=1080')
  RETURNING id INTO q1_id;

  INSERT INTO public.diagnostic_questions (sort_order, title, description, context_title, context_description, context_impact, context_image)
  VALUES (2, 'Gestión de Emisiones de Carbono',
    'Indique el nivel de implementación de sistemas de medición y reducción de emisiones de carbono.',
    'Emisiones de Carbono',
    'La medición precisa de emisiones es fundamental para la transición hacia operaciones carbono-neutral.',
    '+20 puntos',
    'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1080')
  RETURNING id INTO q2_id;

  INSERT INTO public.diagnostic_questions (sort_order, title, description, context_title, context_description, context_impact, context_image)
  VALUES (3, 'Prácticas de Gobernanza Social',
    'Evalúe las prácticas de gobernanza y responsabilidad social de su organización.',
    'Gobernanza Social',
    'Las prácticas de gobernanza social son indicadores clave de sostenibilidad corporativa.',
    '+15 puntos',
    NULL)
  RETURNING id INTO q3_id;

  -- Opciones para pregunta 1
  INSERT INTO public.diagnostic_options (question_id, label, value, score, sort_order) VALUES
    (q1_id, 'Certificación Orgánica', 'yes', 15, 1),
    (q1_id, 'Sin Certificación', 'no', 0, 2),
    (q1_id, 'En Progreso', 'progress', 10, 3),
    (q1_id, 'Aplicación Reciente', 'applied', 8, 4);

  -- Opciones para pregunta 2
  INSERT INTO public.diagnostic_options (question_id, label, value, score, sort_order) VALUES
    (q2_id, 'Sistema Completo Implementado', 'complete', 20, 1),
    (q2_id, 'Sistema Parcial', 'partial', 12, 2),
    (q2_id, 'En Fase de Planificación', 'planning', 6, 3),
    (q2_id, 'Sin Sistema Actual', 'none', 0, 4);

  -- Opciones para pregunta 3
  INSERT INTO public.diagnostic_options (question_id, label, value, score, sort_order) VALUES
    (q3_id, 'Gobernanza Completa', 'complete', 15, 1),
    (q3_id, 'Parcialmente Implementada', 'partial', 10, 2),
    (q3_id, 'En Desarrollo', 'developing', 5, 3),
    (q3_id, 'Sin Prácticas Formales', 'none', 0, 4);
END $$;

-- Cursos Edutech (solo si la tabla está vacía)
INSERT INTO public.courses (title, description, category, level, duration_hours, instructor, lessons_count, is_published, image_url)
SELECT * FROM (VALUES
  ('Introduccion a la Sostenibilidad ESG',
   'Aprende los fundamentos de los criterios Ambientales, Sociales y de Gobernanza para evaluar el impacto de tu organizacion.',
   'esg'::course_category, 'basico'::course_level, 4, 'EYWA Academy', 8, true,
   'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80'),
  ('Certificacion Organica para Agronegocios',
   'Guia completa para obtener la certificacion organica: requisitos, procesos y beneficios para productores agricolas.',
   'agrotech'::course_category, 'intermedio'::course_level, 6, 'Ing. Eduardo Noriega', 12, true,
   'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&q=80'),
  ('Medicion de Huella de Carbono',
   'Metodologias y herramientas para medir, reportar y reducir las emisiones de carbono en tu empresa.',
   'esg'::course_category, 'intermedio'::course_level, 5, 'EYWA Academy', 10, true,
   'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&q=80'),
  ('Finanzas Sostenibles y Bonos Verdes',
   'Comprende los instrumentos financieros sostenibles y como acceder a fondos de inversion de impacto.',
   'banca_sostenible'::course_category, 'avanzado'::course_level, 8, 'Esp. Maria Torres', 15, true,
   'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80'),
  ('Buenas Practicas Agricolas (BPA)',
   'Implementacion de practicas agricolas sostenibles para mejorar la productividad y reducir el impacto ambiental.',
   'agrotech'::course_category, 'basico'::course_level, 3, 'Ing. Carlos Mendoza', 6, true,
   'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80'),
  ('Emprendimiento Digital Sostenible',
   'Herramientas digitales y estrategias para escalar tu emprendimiento con enfoque en sostenibilidad.',
   'edutech'::course_category, 'basico'::course_level, 4, 'EYWA Academy', 8, true,
   'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80')
) AS v(title, description, category, level, duration_hours, instructor, lessons_count, is_published, image_url)
WHERE NOT EXISTS (SELECT 1 FROM public.courses LIMIT 1);

-- ════════════════════════════════════════
-- PASO 8: Crear primer SuperAdmin
-- ════════════════════════════════════════
-- Después de registrarte en la app, ejecuta:
-- UPDATE public.profiles SET role = 'superadmin' WHERE email = 'TU_EMAIL@ejemplo.com';
