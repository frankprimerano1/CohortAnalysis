import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { CohortAnalysis } from '../types';

export const downloadCSV = (analysis: CohortAnalysis, isAdjustedNRR: boolean = false): void => {
  const { cohorts, maxMonths } = analysis;
  
  if (cohorts.length === 0) {
    alert('No data to download');
    return;
  }

  // Create CSV headers
  const nrrLabel = isAdjustedNRR ? 'Adjusted NRR' : 'NRR';
  const headers = ['Cohort', 'Customer Count', 'Initial Revenue'];
  for (let month = 0; month <= maxMonths; month++) {
    headers.push(month === 0 ? `Month 0 ${nrrLabel} (%)` : `Month ${month} ${nrrLabel} (%)`);
    headers.push(month === 0 ? 'Month 0 Revenue ($)' : `Month ${month} Revenue ($)`);
  }

  // Create CSV rows
  const rows = cohorts.map(cohort => {
    const row = [
      cohort.cohortName,
      cohort.customers.length.toString(),
      cohort.initialRevenue.toFixed(2)
    ];

    for (let month = 0; month <= maxMonths; month++) {
      const retentionValue = cohort.retentionByMonth[month] || 0;
      const percentage = month === 0 ? 100 : (retentionValue / cohort.initialRevenue) * 100;
      
      row.push(percentage.toFixed(1));
      row.push(retentionValue.toFixed(2));
    }

    return row;
  });

  // Combine headers and data
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const prefix = isAdjustedNRR ? 'adjusted-nrr' : 'nrr';
  const fileName = `cohort-${prefix}-analysis-${new Date().toISOString().split('T')[0]}.csv`;
  saveAs(blob, fileName);
};

export const downloadPNG = async (elementId: string): Promise<void> => {
  const element = document.getElementById(elementId);
  
  if (!element) {
    alert('Unable to find chart element for download');
    return;
  }

  try {
    // Temporarily modify the element for better screenshot
    const originalStyle = element.style.cssText;
    element.style.backgroundColor = 'white';
    element.style.padding = '20px';
    element.style.borderRadius = '8px';

    const canvas = await html2canvas(element, {
      backgroundColor: 'white',
      scale: 2, // Higher resolution
      useCORS: true,
      logging: false,
      height: element.scrollHeight,
      width: element.scrollWidth
    });

    // Restore original styles
    element.style.cssText = originalStyle;

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const fileName = `cohort-heatmap-${new Date().toISOString().split('T')[0]}.png`;
        saveAs(blob, fileName);
      }
    }, 'image/png');

  } catch (error) {
    console.error('Error generating PNG:', error);
    alert('Error generating PNG. Please try again.');
  }
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};