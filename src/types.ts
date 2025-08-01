// Transaction-based data structure for real cohort analysis
export interface TransactionData {
  accountId: string;
  transactionDate: string; // ISO date string
  arr: number;
  transactionType: 'new' | 'expansion' | 'contraction' | 'churn' | 'renewal';
  previousARR?: number; // For calculating changes
}

// Legacy interface for backward compatibility
export interface CustomerData {
  accountId: string;
  closeDate: string;
  arr: number;
}

// Enhanced customer summary for analysis
export interface CustomerSummary {
  accountId: string;
  firstTransactionDate: string;
  transactions: TransactionData[];
  currentARR: number;
  isActive: boolean;
  cohortName: string;
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