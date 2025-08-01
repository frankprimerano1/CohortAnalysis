import Papa from 'papaparse';
import { CustomerData } from '../types';

export interface CSVParseResult {
  data: CustomerData[];
  errors: string[];
}

export const parseCSV = (file: File): Promise<CSVParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const data: CustomerData[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            // Try to match common field names (case insensitive)
            const accountId = findFieldValue(row, ['account id', 'accountid', 'account_id', 'customer id', 'customerid', 'customer_id', 'id']);
            const closeDate = findFieldValue(row, ['close date', 'closedate', 'close_date', 'date', 'created date', 'created_date', 'signup date', 'signup_date']);
            const arr = findFieldValue(row, ['arr', 'annual recurring revenue', 'revenue', 'mrr', 'monthly recurring revenue', 'amount', 'value']);

            if (!accountId) {
              errors.push(`Row ${index + 2}: Missing Account ID`);
              return;
            }

            if (!closeDate) {
              errors.push(`Row ${index + 2}: Missing Close Date`);
              return;
            }

            if (!arr) {
              errors.push(`Row ${index + 2}: Missing ARR/Revenue value`);
              return;
            }

            // Parse and validate date
            const parsedDate = new Date(closeDate);
            if (isNaN(parsedDate.getTime())) {
              errors.push(`Row ${index + 2}: Invalid date format: ${closeDate}`);
              return;
            }

            // Parse and validate ARR
            const parsedArr = parseFloat(String(arr).replace(/[,$]/g, ''));
            if (isNaN(parsedArr) || parsedArr < 0) {
              errors.push(`Row ${index + 2}: Invalid ARR value: ${arr}`);
              return;
            }

            data.push({
              accountId: String(accountId),
              closeDate: parsedDate.toISOString().split('T')[0], // YYYY-MM-DD format
              arr: parsedArr
            });

          } catch (error) {
            errors.push(`Row ${index + 2}: Error processing row - ${error}`);
          }
        });

        resolve({ data, errors });
      },
      error: (error) => {
        resolve({ 
          data: [], 
          errors: [`CSV parsing error: ${error.message}`] 
        });
      }
    });
  });
};

const findFieldValue = (row: any, possibleNames: string[]): string | null => {
  const keys = Object.keys(row);
  
  for (const name of possibleNames) {
    // Try exact match first
    if (row[name] !== undefined && row[name] !== null && row[name] !== '') {
      return String(row[name]).trim();
    }
    
    // Try case-insensitive match
    const matchingKey = keys.find(key => 
      key.toLowerCase().trim() === name.toLowerCase().trim()
    );
    
    if (matchingKey && row[matchingKey] !== undefined && row[matchingKey] !== null && row[matchingKey] !== '') {
      return String(row[matchingKey]).trim();
    }
  }
  
  return null;
};

export const generateSampleCSV = (): string => {
  const headers = ['Account ID', 'Close Date', 'ARR'];
  const sampleData = [
    ['CUST-001', '2023-01-15', '12000'],
    ['CUST-002', '2023-01-28', '8500'],
    ['CUST-003', '2023-02-10', '15000'],
    ['CUST-004', '2023-02-22', '6000'],
    ['CUST-005', '2023-03-05', '22000'],
    ['CUST-006', '2023-04-12', '9500'],
    ['CUST-007', '2023-04-25', '18000'],
    ['CUST-008', '2023-05-08', '11000'],
    ['CUST-009', '2023-06-15', '7500'],
    ['CUST-010', '2023-07-02', '13500']
  ];

  return [headers, ...sampleData].map(row => row.join(',')).join('\n');
};