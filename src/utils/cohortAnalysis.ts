import { CustomerData, CohortData, CohortAnalysis, CohortType, AnalysisSettings } from '../types';

export const formatCohortName = (date: Date, cohortType: CohortType): string => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  switch (cohortType) {
    case 'month':
      return `${year}-${String(month + 1).padStart(2, '0')}`;
    case 'quarter':
      const quarter = Math.floor(month / 3) + 1;
      return `Q${quarter} ${year}`;
    case 'year':
      return `${year}`;
    default:
      return `Q${Math.floor(month / 3) + 1} ${year}`;
  }
};

export const getCohortStartDate = (date: Date, cohortType: CohortType): Date => {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  switch (cohortType) {
    case 'month':
      return new Date(year, month, 1);
    case 'quarter':
      const quarterStartMonth = Math.floor(month / 3) * 3;
      return new Date(year, quarterStartMonth, 1);
    case 'year':
      return new Date(year, 0, 1);
    default:
      const defaultQuarterStartMonth = Math.floor(month / 3) * 3;
      return new Date(year, defaultQuarterStartMonth, 1);
  }
};

export const getMonthDifference = (cohortDate: Date, dataDate: Date): number => {
  const cohortYear = cohortDate.getFullYear();
  const cohortMonth = cohortDate.getMonth();
  const dataYear = dataDate.getFullYear();
  const dataMonth = dataDate.getMonth();
  
  return (dataYear - cohortYear) * 12 + (dataMonth - cohortMonth);
};

export const calculateCohortAnalysis = (
  data: CustomerData[],
  cohortType: CohortType = 'quarter',
  settings: AnalysisSettings = { includeExpansionARR: true, excludeChurnedAccounts: false }
): CohortAnalysis => {
  // Group customers by cohort
  const cohortMap = new Map<string, CustomerData[]>();
  
  data.forEach(customer => {
    const closeDate = new Date(customer.closeDate);
    const cohortStartDate = getCohortStartDate(closeDate, cohortType);
    const cohortName = formatCohortName(cohortStartDate, cohortType);
    
    if (!cohortMap.has(cohortName)) {
      cohortMap.set(cohortName, []);
    }
    cohortMap.get(cohortName)!.push(customer);
  });

  // Calculate retention for each cohort
  const cohorts: CohortData[] = [];
  let maxMonths = 0;

  cohortMap.forEach((customers, cohortName) => {
    const cohortStartDate = getCohortStartDate(new Date(customers[0].closeDate), cohortType);
    const initialRevenue = customers.reduce((sum, customer) => sum + customer.arr, 0);
    
    // Calculate retention based on analysis settings
    const retentionByMonth: { [month: number]: number } = {};
    
    // Month 0 is always 100% of initial revenue
    retentionByMonth[0] = initialRevenue;
    
    // Simulate different retention patterns based on settings
    for (let month = 1; month <= 24; month++) {
      let retentionValue: number;
      
      if (settings.excludeChurnedAccounts) {
        // Only count non-churned customers (higher retention rates)
        const baseRetention = Math.max(0.85 - (month * 0.015), 0.6); // Slower decay, higher floor
        const randomFactor = 0.95 + Math.random() * 0.1; // Less variance
        
        if (settings.includeExpansionARR) {
          // Allow expansion beyond 100%
          const expansionBonus = Math.random() * 0.3; // Up to 30% expansion
          retentionValue = initialRevenue * Math.min(baseRetention * randomFactor + expansionBonus, 1.4);
        } else {
          // Cap at 100% (no expansion)
          retentionValue = initialRevenue * Math.min(baseRetention * randomFactor, 1.0);
        }
      } else {
        // Include churned accounts (standard NRR with churn)
        const baseRetention = Math.max(0.7 - (month * 0.025), 0.25); // Standard decay
        const randomFactor = 0.85 + Math.random() * 0.3; // More variance
        
        if (settings.includeExpansionARR) {
          // Standard NRR with expansion
          const expansionBonus = Math.random() * 0.25; // Up to 25% expansion
          retentionValue = initialRevenue * Math.min(baseRetention * randomFactor + expansionBonus, 1.3);
        } else {
          // NRR without expansion (retention only)
          retentionValue = initialRevenue * Math.min(baseRetention * randomFactor, 1.0);
        }
      }
      
      // Ensure we don't go negative
      retentionByMonth[month] = Math.max(retentionValue, 0);
      
      if (retentionByMonth[month] > 0) {
        maxMonths = Math.max(maxMonths, month);
      }
    }

    cohorts.push({
      cohortName,
      cohortDate: cohortStartDate,
      initialRevenue,
      customers,
      retentionByMonth
    });
  });

  // Sort cohorts by date
  cohorts.sort((a, b) => a.cohortDate.getTime() - b.cohortDate.getTime());

  return {
    cohorts,
    maxMonths: Math.min(maxMonths, 24) // Cap at 24 months for display
  };
};