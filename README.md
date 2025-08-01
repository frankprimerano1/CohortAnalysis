# Cohort Analysis Tool

A React application for analyzing customer retention and Net Revenue Retention (NRR) through cohort analysis. Upload CSV files containing customer data and visualize retention patterns over time with an interactive heatmap.

## Features

- **CSV Upload**: Upload customer data with Account ID, Close Date, and ARR columns
- **Flexible Cohort Grouping**: Group customers by month, quarter, or year
- **Interactive Heatmap**: Color-coded retention visualization with hover details
- **Export Capabilities**: Download results as CSV or PNG
- **Responsive Design**: Clean, modern interface with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## Usage

### 1. Upload Data

Click "Choose CSV File" to upload your customer data. The CSV should contain:

- **Account ID**: Unique customer identifier
- **Close Date**: Customer acquisition date (various formats supported)
- **ARR**: Annual Recurring Revenue (numeric value)

### 2. Download Sample Data

Use the "Download Sample CSV" button to get a template with sample data.

### 3. Configure Settings

- **Cohort Grouping**: Choose between monthly, quarterly, or yearly cohorts
- Default is quarterly cohorts (Q1 2023, Q2 2023, etc.)

### 4. Analyze Results

The heatmap displays:
- **Rows**: Cohorts (grouped by Close Date)
- **Columns**: Retention months (Month 0 = initial revenue)
- **Colors**: Retention rate visualization
  - Green: High retention (80%+)
  - Yellow/Orange: Medium retention (40-79%)
  - Red: Low retention (0-39%)

### 5. Export Data

- **Download CSV**: Export the cohort analysis table
- **Download PNG**: Save the heatmap as an image

## CSV Format Requirements

### Required Columns (case-insensitive):

- **Account ID** (alternatives: Customer ID, ID)
- **Close Date** (alternatives: Date, Created Date, Signup Date)
- **ARR** (alternatives: Revenue, MRR, Amount, Value)

### Example CSV:

```csv
Account ID,Close Date,ARR
CUST-001,2023-01-15,12000
CUST-002,2023-01-28,8500
CUST-003,2023-02-10,15000
```

## Technical Details

### Built With

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **Papa Parse** - CSV parsing
- **html2canvas** - PNG export
- **FileSaver.js** - File downloads

### Project Structure

```
src/
├── components/          # React components
│   ├── FileUpload.tsx   # CSV upload interface
│   ├── CohortHeatmap.tsx # Heatmap visualization
│   └── Settings.tsx     # Configuration controls
├── utils/               # Utility functions
│   ├── csvParser.ts     # CSV parsing logic
│   ├── cohortAnalysis.ts # Cohort calculation
│   └── downloadUtils.ts # Export functionality
├── types.ts             # TypeScript definitions
└── App.tsx              # Main application
```

## Understanding Cohort Analysis

### What is Cohort Analysis?

Cohort analysis groups customers by a shared characteristic (acquisition date) and tracks their behavior over time. This helps identify:

- Customer retention patterns
- Revenue growth or decline
- Product-market fit indicators
- Customer lifecycle trends

### Net Revenue Retention (NRR)

NRR measures the percentage of revenue retained from existing customers over time, including:
- **Retention**: Customers who continue paying
- **Expansion**: Customers who increase their spending
- **Contraction**: Customers who reduce their spending
- **Churn**: Customers who stop paying

### Interpreting the Heatmap

- **Month 0**: Always 100% (baseline revenue)
- **Month 1+**: Percentage of original cohort revenue retained
- **Values >100%**: Revenue expansion (good!)
- **Values <100%**: Revenue contraction or churn

## Notes

- The current version simulates retention data for demonstration purposes
- In a production environment, you would need transaction data over time to calculate actual retention
- The app supports up to 24 months of retention tracking
- All monetary values are displayed in USD format

## License

This project is open source and available under the MIT License.