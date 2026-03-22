// ════════════════════════════════════════
// Constantes de negocio: Scoring & Niveles
// ════════════════════════════════════════

export const SCORE_THRESHOLDS = {
  EXCELLENT: 80,
  GOOD: 60,
  MODERATE: 40,
} as const;

export const SCORE_LEVELS = {
  EXCELLENT: 'Excelente',
  GOOD: 'Bueno',
  MODERATE: 'Moderado',
  INITIAL: 'Inicial',
} as const;

export const SEAL_LABELS = {
  GOLD: 'Gold Seal',
  SILVER: 'Silver Seal',
  BRONZE: 'Bronze Seal',
  NONE: 'Sin Certificación',
} as const;

export function getScoreLevel(percentage: number): string {
  if (percentage >= SCORE_THRESHOLDS.EXCELLENT) return SCORE_LEVELS.EXCELLENT;
  if (percentage >= SCORE_THRESHOLDS.GOOD) return SCORE_LEVELS.GOOD;
  if (percentage >= SCORE_THRESHOLDS.MODERATE) return SCORE_LEVELS.MODERATE;
  return SCORE_LEVELS.INITIAL;
}

export function getSealLabel(percentage: number): string {
  if (percentage >= SCORE_THRESHOLDS.EXCELLENT) return SEAL_LABELS.GOLD;
  if (percentage >= SCORE_THRESHOLDS.GOOD) return SEAL_LABELS.SILVER;
  if (percentage >= SCORE_THRESHOLDS.MODERATE) return SEAL_LABELS.BRONZE;
  return SEAL_LABELS.NONE;
}

export function calculatePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}
