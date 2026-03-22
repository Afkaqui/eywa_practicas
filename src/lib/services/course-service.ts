import type { Course, CourseEnrollment } from '@/lib/types/database';
import { CourseRepository } from '@/lib/repositories/course-repository';

export interface CourseStats {
  totalCourses: number;
  enrolled: number;
  completed: number;
  inProgress: number;
  avgProgress: number;
}

export class CourseService {
  constructor(private repository: CourseRepository) {}

  async getPublishedCourses(): Promise<Course[]> {
    return this.repository.getPublished();
  }

  async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
    return this.repository.getUserEnrollments(userId);
  }

  async enrollUser(userId: string, courseId: string): Promise<CourseEnrollment> {
    return this.repository.enroll(userId, courseId);
  }

  async updateProgress(enrollmentId: string, newProgress: number): Promise<void> {
    const progress = Math.min(newProgress, 100);
    const completed = progress >= 100;
    await this.repository.updateProgress(enrollmentId, progress, completed);
  }

  static calculateStats(courses: Course[], enrollments: CourseEnrollment[]): CourseStats {
    const completed = enrollments.filter(e => e.completed).length;
    const inProgress = enrollments.filter(e => !e.completed).length;
    const avgProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + e.progress, 0) / enrollments.length)
      : 0;

    return {
      totalCourses: courses.length,
      enrolled: enrollments.length,
      completed,
      inProgress,
      avgProgress,
    };
  }
}
