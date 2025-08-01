import React, { useRef, useState } from 'react';
import { parseCSV, generateSampleCSV } from '../utils/csvParser';
import { CustomerData } from '../types';

interface FileUploadProps {
  onDataLoad: (data: CustomerData[]) => void;
  onError: (errors: string[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoad, onError }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      onError(['Please select a CSV file']);
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const result = await parseCSV(file);
      
      if (result.errors.length > 0) {
        onError(result.errors);
      }
      
      if (result.data.length > 0) {
        onDataLoad(result.data);
      } else {
        onError(['No valid data found in the CSV file']);
      }
    } catch (error) {
      onError([`Error processing file: ${error}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sample-customer-data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-gray-400 transition-colors">
        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 48 48">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" />
            </svg>
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload Customer Data
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Upload a CSV file with Account ID, Close Date, and ARR columns
            </p>
            
            {fileName && (
              <p className="text-sm text-blue-600 mb-2">
                Selected: {fileName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              {isLoading ? 'Processing...' : 'Choose CSV File'}
            </button>
            
            <button
              onClick={handleDownloadSample}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
            >
              Download Sample CSV
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Expected CSV columns (case insensitive):</p>
        <ul className="list-disc list-inside mt-1 space-y-1">
          <li><strong>Account ID:</strong> Customer identifier</li>
          <li><strong>Close Date:</strong> Customer acquisition date</li>
          <li><strong>ARR:</strong> Annual Recurring Revenue</li>
        </ul>
      </div>
    </div>
  );
};

export default FileUpload;