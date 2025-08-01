export interface CustomerData {
  accountId: string;
  closeDate: string;
  arr: number;
}

export interface CohortData {
  cohortName: string;
  cohortDate: Date;
  initialRevenue: number;
  customers: CustomerData[];
  retentionByMonth: { [month: number]: number };
}

export interface CohortAnalysis {
  cohorts: CohortData[];
  maxMonths: number;
}

export type CohortType = 'month' | 'quarter' | 'year';

export interface AnalysisSettings {
  includeExpansionARR: boolean;
  excludeChurnedAccounts: boolean;
}

export interface HeatmapCell {
  cohort: string;
  month: number;
  value: number;
  percentage: number;
}