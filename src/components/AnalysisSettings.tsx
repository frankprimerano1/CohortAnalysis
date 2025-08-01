import React from 'react';
import { AnalysisSettings } from '../types';

interface AnalysisSettingsProps {
  settings: AnalysisSettings;
  onSettingsChange: (settings: AnalysisSettings) => void;
  disabled?: boolean;
}

const AnalysisSettingsComponent: React.FC<AnalysisSettingsProps> = ({
  settings,
  onSettingsChange,
  disabled = false
}) => {
  const handleToggle = (key: keyof AnalysisSettings) => {
    onSettingsChange({
      ...settings,
      [key]: !settings[key]
    });
  };

  const isAdjusted = !settings.includeExpansionARR || settings.excludeChurnedAccounts;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            {isAdjusted ? 'Adjusted NRR' : 'Net Revenue Retention'} Analysis Settings
          </h3>
          {isAdjusted && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Adjusted
            </span>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="include-expansion"
                type="checkbox"
                checked={settings.includeExpansionARR}
                onChange={() => handleToggle('includeExpansionARR')}
                disabled={disabled}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="include-expansion" className="font-medium text-gray-700">
                Include Expansion ARR
              </label>
              <p className="text-gray-500">
                Allow revenue growth above 100% from existing customers (upsells, upgrades)
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="exclude-churned"
                type="checkbox"
                checked={settings.excludeChurnedAccounts}
                onChange={() => handleToggle('excludeChurnedAccounts')}
                disabled={disabled}
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="exclude-churned" className="font-medium text-gray-700">
                Exclude Churned Accounts
              </label>
              <p className="text-gray-500">
                Only count non-churned customers in retention calculations (higher retention rates)
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600">
            <p className="mb-1"><strong>Standard NRR:</strong> Includes all customers and expansion revenue</p>
            <p className="mb-1"><strong>Adjusted NRR:</strong> Modified calculation based on selected options</p>
            <p><strong>Note:</strong> These are simulated calculations for demonstration purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisSettingsComponent;