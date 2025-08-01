import React from 'react';
import { CohortAnalysis, HeatmapCell } from '../types';

interface CohortHeatmapProps {
  analysis: CohortAnalysis;
  onCellHover?: (cell: HeatmapCell | null) => void;
  isAdjustedNRR?: boolean;
}

const CohortHeatmap: React.FC<CohortHeatmapProps> = ({ analysis, onCellHover, isAdjustedNRR = false }) => {
  const { cohorts, maxMonths } = analysis;

  if (cohorts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No cohort data to display
      </div>
    );
  }

  const getRetentionColor = (percentage: number): string => {
    if (percentage >= 100) return 'bg-green-500'; // 100%+ (expansion)
    if (percentage >= 80) return 'bg-green-400';  // 80-99%
    if (percentage >= 60) return 'bg-yellow-400'; // 60-79%
    if (percentage >= 40) return 'bg-orange-400'; // 40-59%
    if (percentage >= 20) return 'bg-red-400';    // 20-39%
    if (percentage > 0) return 'bg-red-500';      // 1-19%
    return 'bg-gray-200';                         // 0%
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="w-full overflow-x-auto bg-white rounded-lg shadow-lg">
      <div className="min-w-max">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 border-r border-gray-200">
                Cohort
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              {Array.from({ length: maxMonths + 1 }, (_, month) => (
                <th
                  key={month}
                  className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {month === 0 ? 'Initial' : `Month ${month}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {cohorts.map((cohort, cohortIndex) => (
              <tr key={cohort.cohortName} className={cohortIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 sticky left-0 bg-inherit border-r border-gray-200">
                  {cohort.cohortName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700 text-center">
                  {cohort.customers.length}
                </td>
                {Array.from({ length: maxMonths + 1 }, (_, month) => {
                  const retentionValue = cohort.retentionByMonth[month] || 0;
                  const percentage = month === 0 ? 100 : (retentionValue / cohort.initialRevenue) * 100;
                  const colorClass = getRetentionColor(percentage);

                  const cell: HeatmapCell = {
                    cohort: cohort.cohortName,
                    month,
                    value: retentionValue,
                    percentage
                  };

                  return (
                    <td
                      key={month}
                      className="px-1 py-1 relative"
                      onMouseEnter={() => onCellHover?.(cell)}
                    >
                      <div
                        className={`
                          heatmap-cell w-full h-12 rounded flex flex-col items-center justify-center text-xs font-medium text-white cursor-pointer
                          ${colorClass}
                        `}
                        title={`${cohort.cohortName} - Month ${month}\nRevenue: ${formatCurrency(retentionValue)}\nRetention: ${formatPercentage(percentage)}`}
                        style={{ pointerEvents: 'auto' }}
                      >
                        <div className="text-xs leading-tight">
                          {formatPercentage(percentage)}
                        </div>
                        <div className="text-xs leading-tight opacity-90">
                          {formatCurrency(retentionValue)}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {isAdjustedNRR ? 'Adjusted NRR' : 'NRR'} Rate Legend
        </h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>100%+ (Expansion)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>80-99%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>60-79%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span>40-59%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-400 rounded"></div>
            <span>20-39%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>1-19%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded"></div>
            <span>0% (Churned)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CohortHeatmap;