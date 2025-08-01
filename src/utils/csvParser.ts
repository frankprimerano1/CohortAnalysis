import Papa from 'papaparse';
import { CustomerData, TransactionData } from '../types';

export interface CSVParseResult {
  data: CustomerData[];
  errors: string[];
}

export interface TransactionCSVParseResult {
  data: TransactionData[];
  errors: string[];
  isTransactionFormat: boolean;
}

export interface SmartCSVParseResult {
  customerData: CustomerData[];
  transactionData: TransactionData[];
  errors: string[];
  isTransactionFormat: boolean;
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

// Parse transaction-based CSV data
export const parseTransactionCSV = (file: File): Promise<TransactionCSVParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = [];
        const data: TransactionData[] = [];

        results.data.forEach((row: any, index: number) => {
          try {
            const accountId = findFieldValue(row, ['account id', 'accountid', 'account_id', 'customer id', 'customerid', 'customer_id', 'id']);
            const transactionDate = findFieldValue(row, ['transaction date', 'transactiondate', 'transaction_date', 'date', 'event date', 'event_date']);
            const arr = findFieldValue(row, ['arr', 'annual recurring revenue', 'revenue', 'amount', 'value']);
            const transactionType = findFieldValue(row, ['transaction type', 'transactiontype', 'transaction_type', 'type', 'event type', 'event_type', 'action']);
            const previousARR = findFieldValue(row, ['previous arr', 'previousarr', 'previous_arr', 'old arr', 'old_arr']);

            if (!accountId) {
              errors.push(`Row ${index + 2}: Missing Account ID`);
              return;
            }

            if (!transactionDate) {
              errors.push(`Row ${index + 2}: Missing Transaction Date`);
              return;
            }

            if (!arr) {
              errors.push(`Row ${index + 2}: Missing ARR value`);
              return;
            }

            if (!transactionType) {
              errors.push(`Row ${index + 2}: Missing Transaction Type`);
              return;
            }

            // Parse and validate date
            const parsedDate = new Date(transactionDate);
            if (isNaN(parsedDate.getTime())) {
              errors.push(`Row ${index + 2}: Invalid date format: ${transactionDate}`);
              return;
            }

            // Parse and validate ARR
            const parsedArr = parseFloat(String(arr).replace(/[,$]/g, ''));
            if (isNaN(parsedArr) || parsedArr < 0) {
              errors.push(`Row ${index + 2}: Invalid ARR value: ${arr}`);
              return;
            }

            // Validate transaction type
            const validTypes = ['new', 'expansion', 'contraction', 'churn', 'renewal'];
            const normalizedType = String(transactionType).toLowerCase().trim();
            if (!validTypes.includes(normalizedType)) {
              errors.push(`Row ${index + 2}: Invalid transaction type: ${transactionType}. Must be one of: ${validTypes.join(', ')}`);
              return;
            }

            // Parse previous ARR if provided
            let parsedPreviousARR: number | undefined = undefined;
            if (previousARR) {
              const prevArrValue = parseFloat(String(previousARR).replace(/[,$]/g, ''));
              if (!isNaN(prevArrValue)) {
                parsedPreviousARR = prevArrValue;
              }
            }

            data.push({
              accountId: String(accountId),
              transactionDate: parsedDate.toISOString().split('T')[0], // YYYY-MM-DD format
              arr: parsedArr,
              transactionType: normalizedType as TransactionData['transactionType'],
              previousARR: parsedPreviousARR
            });

          } catch (error) {
            errors.push(`Row ${index + 2}: Error processing row - ${error}`);
          }
        });

        resolve({ data, errors, isTransactionFormat: true });
      },
      error: (error) => {
        resolve({ 
          data: [], 
          errors: [`CSV parsing error: ${error.message}`],
          isTransactionFormat: true
        });
      }
    });
  });
};

// Smart parser that detects format and parses accordingly
export const parseSmartCSV = (file: File): Promise<SmartCSVParseResult> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Just read first few rows to detect format
      complete: async (results) => {
        try {
          // Detect format based on headers
          const headers = results.meta.fields || [];
          const lowerHeaders = headers.map(h => h.toLowerCase().trim());
          
          const hasTransactionType = lowerHeaders.some(h => 
            h.includes('transaction') && h.includes('type') ||
            h.includes('event') && h.includes('type') ||
            h === 'type' ||
            h === 'action'
          );
          
          const hasTransactionDate = lowerHeaders.some(h =>
            h.includes('transaction') && h.includes('date') ||
            h.includes('event') && h.includes('date')
          );

          const isTransactionFormat = hasTransactionType || hasTransactionDate;

          if (isTransactionFormat) {
            // Parse as transaction data
            const transactionResult = await parseTransactionCSV(file);
            resolve({
              customerData: [],
              transactionData: transactionResult.data,
              errors: transactionResult.errors,
              isTransactionFormat: true
            });
          } else {
            // Parse as legacy customer data
            const customerResult = await parseCSV(file);
            resolve({
              customerData: customerResult.data,
              transactionData: [],
              errors: customerResult.errors,
              isTransactionFormat: false
            });
          }
        } catch (error) {
          resolve({
            customerData: [],
            transactionData: [],
            errors: [`Error detecting CSV format: ${error}`],
            isTransactionFormat: false
          });
        }
      },
      error: (error) => {
        resolve({
          customerData: [],
          transactionData: [],
          errors: [`CSV parsing error: ${error.message}`],
          isTransactionFormat: false
        });
      }
    });
  });
};

// Generate legacy customer data sample CSV
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

// Generate transaction data sample CSV (for real cohort analysis)
export const generateSampleTransactionCSV = (): string => {
  const headers = ['Account ID', 'Transaction Date', 'ARR', 'Transaction Type', 'Previous ARR'];
  const sampleData = [
    // Customer ACME-001 journey
    ['ACME-001', '2023-01-15', '12000', 'new', ''],
    ['ACME-001', '2023-04-15', '15000', 'expansion', '12000'],
    ['ACME-001', '2023-07-15', '18000', 'expansion', '15000'],
    ['ACME-001', '2024-01-15', '18000', 'renewal', '18000'],
    
    // Customer ACME-002 journey
    ['ACME-002', '2023-01-28', '8500', 'new', ''],
    ['ACME-002', '2023-07-28', '8500', 'renewal', '8500'],
    ['ACME-002', '2023-10-28', '6000', 'contraction', '8500'],
    ['ACME-002', '2024-01-28', '0', 'churn', '6000'],
    
    // Customer ACME-003 journey
    ['ACME-003', '2023-02-10', '15000', 'new', ''],
    ['ACME-003', '2023-05-10', '22000', 'expansion', '15000'],
    ['ACME-003', '2024-02-10', '22000', 'renewal', '22000'],
    
    // Customer ACME-004 journey
    ['ACME-004', '2023-02-22', '6000', 'new', ''],
    ['ACME-004', '2023-08-22', '6000', 'renewal', '6000'],
    ['ACME-004', '2023-11-22', '4500', 'contraction', '6000'],
    
    // Customer ACME-005 journey
    ['ACME-005', '2023-03-05', '22000', 'new', ''],
    ['ACME-005', '2023-06-05', '28000', 'expansion', '22000'],
    ['ACME-005', '2023-09-05', '35000', 'expansion', '28000'],
    ['ACME-005', '2024-03-05', '35000', 'renewal', '35000'],
    
    // Customer ACME-006 journey  
    ['ACME-006', '2023-04-12', '9500', 'new', ''],
    ['ACME-006', '2023-10-12', '9500', 'renewal', '9500'],
    ['ACME-006', '2024-01-12', '12000', 'expansion', '9500'],
    
    // Customer ACME-007 journey
    ['ACME-007', '2023-04-25', '18000', 'new', ''],
    ['ACME-007', '2023-10-25', '18000', 'renewal', '18000'],
    ['ACME-007', '2024-01-25', '0', 'churn', '18000'],
    
    // Customer ACME-008 journey
    ['ACME-008', '2023-05-08', '11000', 'new', ''],
    ['ACME-008', '2023-08-08', '14000', 'expansion', '11000'],
    ['ACME-008', '2023-11-08', '14000', 'renewal', '14000'],
    
    // Customer ACME-009 journey
    ['ACME-009', '2023-06-15', '7500', 'new', ''],
    ['ACME-009', '2023-12-15', '7500', 'renewal', '7500'],
    ['ACME-009', '2024-03-15', '10000', 'expansion', '7500'],
    
    // Customer ACME-010 journey
    ['ACME-010', '2023-07-02', '13500', 'new', ''],
    ['ACME-010', '2024-01-02', '13500', 'renewal', '13500'],
    ['ACME-010', '2024-04-02', '16000', 'expansion', '13500']
  ];

  return [headers, ...sampleData].map(row => row.join(',')).join('\n');
};