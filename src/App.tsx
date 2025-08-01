import React, { useState, useCallback, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import CohortHeatmap from './components/CohortHeatmap';
import Settings from './components/Settings';
import AnalysisSettings from './components/AnalysisSettings';
import { CustomerData, CohortAnalysis, CohortType, HeatmapCell, AnalysisSettings as AnalysisSettingsType } from './types';
import { calculateCohortAnalysis } from './utils/cohortAnalysis';
import { downloadCSV, downloadPNG } from './utils/downloadUtils';

const App: React.FC = () => {
  const [customerData, setCustomerData] = useState<CustomerData[]>([]);
  const [cohortAnalysis, setCohortAnalysis] = useState<CohortAnalysis | null>(null);
  const [cohortType, setCohortType] = useState<CohortType>('quarter');
  const [analysisSettings, setAnalysisSettings] = useState<AnalysisSettingsType>({
    includeExpansionARR: true,
    excludeChurnedAccounts: false
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleDataLoad = useCallback((data: CustomerData[]) => {
    setCustomerData(data);
    setErrors([]);
    
    // Calculate cohort analysis
    const analysis = calculateCohortAnalysis(data, cohortType, analysisSettings);
    setCohortAnalysis(analysis);
  }, [cohortType, analysisSettings]);

  const handleCohortTypeChange = useCallback((newCohortType: CohortType) => {
    setCohortType(newCohortType);
    
    // Recalculate analysis if we have data
    if (customerData.length > 0) {
      const analysis = calculateCohortAnalysis(customerData, newCohortType, analysisSettings);
      setCohortAnalysis(analysis);
    }
  }, [customerData, analysisSettings]);

  const handleAnalysisSettingsChange = useCallback((newSettings: AnalysisSettingsType) => {
    setAnalysisSettings(newSettings);
    
    // Recalculate analysis if we have data
    if (customerData.length > 0) {
      const analysis = calculateCohortAnalysis(customerData, cohortType, newSettings);
      setCohortAnalysis(analysis);
    }
  }, [customerData, cohortType]);

  const handleError = useCallback((newErrors: string[]) => {
    setErrors(newErrors);
  }, []);

  // Helper function to determine if we're showing adjusted NRR
  const isAdjustedNRR = !analysisSettings.includeExpansionARR || analysisSettings.excludeChurnedAccounts;
  const nrrLabel = isAdjustedNRR ? 'Adjusted NRR' : 'Net Revenue Retention (NRR)';

  const handleDownloadCSV = useCallback(() => {
    if (cohortAnalysis) {
      downloadCSV(cohortAnalysis, isAdjustedNRR);
    }
  }, [cohortAnalysis, isAdjustedNRR]);

  const handleDownloadPNG = useCallback(() => {
    downloadPNG('cohort-heatmap');
  }, []);

  const handleCellHover = useCallback((cell: HeatmapCell | null) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    if (cell) {
      // Show immediately on hover
      setHoveredCell(cell);
    }
    // Note: We don't hide immediately on mouse leave anymore
    // Hiding is now handled by the table-level mouse leave event
  }, [hoverTimeout]);

  const handleTableLeave = useCallback(() => {
    // Only hide when leaving the entire table area
    const timeout = setTimeout(() => {
      setHoveredCell(null);
    }, 200);
    setHoverTimeout(timeout);
  }, []);

  const handleTableEnter = useCallback(() => {
    // Cancel hide timeout when re-entering table
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
  }, [hoverTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <div style={{ padding: '20px', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '32px', marginBottom: '20px' }}>
        Cohort Analysis Tool
      </h1>
      <p style={{ color: 'gray', marginBottom: '20px' }}>
        Upload customer data to analyze {nrrLabel} across cohorts
      </p>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* File Upload Section */}
          {!cohortAnalysis && (
            <div className="flex justify-center">
              <FileUpload onDataLoad={handleDataLoad} onError={handleError} />
            </div>
          )}

          {/* Error Display */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    There were {errors.length} error(s) with your upload:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Main Content */}
          {cohortAnalysis && (
            <div className="space-y-6">
              {/* Data Summary */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Data Summary</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-blue-900">
                      {customerData.length}
                    </div>
                    <div className="text-sm text-blue-600">Total Customers</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-900">
                      {cohortAnalysis.cohorts.length}
                    </div>
                    <div className="text-sm text-green-600">Cohorts</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-purple-900">
                      ${Math.round(customerData.reduce((sum, customer) => sum + customer.arr, 0)).toLocaleString()}
                    </div>
                    <div className="text-sm text-purple-600">Total ARR</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-900">
                      {cohortAnalysis.maxMonths}
                    </div>
                    <div className="text-sm text-orange-600">Months Tracked</div>
                  </div>
                </div>
              </div>

              {/* Analysis Settings */}
              <AnalysisSettings
                settings={analysisSettings}
                onSettingsChange={handleAnalysisSettingsChange}
                disabled={false}
              />

              {/* Export Settings */}
              <Settings
                cohortType={cohortType}
                onCohortTypeChange={handleCohortTypeChange}
                onDownloadCSV={handleDownloadCSV}
                onDownloadPNG={handleDownloadPNG}
              />

              {/* Cell Hover Info */}
              {hoveredCell && (
                <div 
                  className="sticky top-4 bg-blue-50 border border-blue-200 rounded-md p-4 shadow-lg z-10"
                  onMouseEnter={() => {
                    // Prevent hiding when hovering over the tooltip itself
                    if (hoverTimeout) {
                      clearTimeout(hoverTimeout);
                      setHoverTimeout(null);
                    }
                  }}
                  onMouseLeave={() => {
                    // Hide when leaving the tooltip
                    const timeout = setTimeout(() => {
                      setHoveredCell(null);
                    }, 100);
                    setHoverTimeout(timeout);
                  }}
                >
                  <h3 className="text-sm font-medium text-blue-800 mb-2">
                    {hoveredCell.cohort} - Month {hoveredCell.month}
                  </h3>
                  <div className="text-sm text-blue-700">
                    <p>Revenue: ${hoveredCell.value.toLocaleString()}</p>
                    <p>Retention Rate: {hoveredCell.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {/* Cohort Heatmap */}
              <div 
                id="cohort-heatmap"
                onMouseEnter={handleTableEnter}
                onMouseLeave={handleTableLeave}
              >
                <CohortHeatmap 
                  analysis={cohortAnalysis} 
                  onCellHover={handleCellHover}
                  isAdjustedNRR={isAdjustedNRR}
                />
              </div>

              {/* Reset Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    setCustomerData([]);
                    setCohortAnalysis(null);
                    setErrors([]);
                    setHoveredCell(null);
                    setAnalysisSettings({
                      includeExpansionARR: true,
                      excludeChurnedAccounts: false
                    });
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Upload New Data
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: '1px solid #e5e7eb', marginTop: '48px', padding: '24px', textAlign: 'center' }}>
        <p style={{ color: 'gray', fontSize: '14px' }}>
          Cohort Analysis Tool - Analyze customer retention and revenue growth with configurable NRR calculations
        </p>
      </footer>
    </div>
  );
};

export default App;