import React from 'react';
import { CohortType } from '../types';

interface SettingsProps {
  cohortType: CohortType;
  onCohortTypeChange: (type: CohortType) => void;
  onDownloadCSV: () => void;
  onDownloadPNG: () => void;
  disabled?: boolean;
}

const Settings: React.FC<SettingsProps> = ({
  cohortType,
  onCohortTypeChange,
  onDownloadCSV,
  onDownloadPNG,
  disabled = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex flex-col gap-2">
            <label htmlFor="cohort-type" className="text-sm font-medium text-gray-700">
              Cohort Grouping
            </label>
            <select
              id="cohort-type"
              value={cohortType}
              onChange={(e) => onCohortTypeChange(e.target.value as CohortType)}
              disabled={disabled}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="month">Monthly Cohorts</option>
              <option value="quarter">Quarterly Cohorts</option>
              <option value="year">Yearly Cohorts</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={onDownloadCSV}
            disabled={disabled}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            Download CSV
          </button>
          <button
            onClick={onDownloadPNG}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md transition-colors"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;