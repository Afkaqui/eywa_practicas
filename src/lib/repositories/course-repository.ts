import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course, CourseEnrollment } from '@/lib/types/database';

export class CourseRepository {
  constructor(private supabase: SupabaseClient) {}

  async getPublished(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAll(): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data || [];
  }

  async enroll(userId: string, courseId: string): Promise<CourseEnrollment> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .insert({ user_id: userId, course_id: courseId, progress: 0, completed: false })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateProgress(enrollmentId: string, progress: number, completed: boolean): Promise<void> {
    const { error } = await this.supabase
      .from('course_enrollments')
      .update({
        progress: Math.min(progress, 100),
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', enrollmentId);

    if (error) throw error;
  }
}
