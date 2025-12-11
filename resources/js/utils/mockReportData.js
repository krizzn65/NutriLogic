/**
 * Test Data for Excel Export Feature
 * Use this data to test the export functionality
 */

export const mockReportData = {
    summary: {
        total_posyandu: 5,
        total_kader: 12,
        total_ibu: 45,
        total_anak: 78,
        total_weighings: 234
    },
    growth_by_posyandu: [
        { month: 'Jan 2025', children_count: 15, weighings_count: 45 },
        { month: 'Feb 2025', children_count: 18, weighings_count: 52 },
        { month: 'Mar 2025', children_count: 20, weighings_count: 58 },
        { month: 'Apr 2025', children_count: 22, weighings_count: 64 },
        { month: 'Mei 2025', children_count: 25, weighings_count: 70 },
        { month: 'Jun 2025', children_count: 23, weighings_count: 67 },
        { month: 'Jul 2025', children_count: 24, weighings_count: 68 },
        { month: 'Agu 2025', children_count: 26, weighings_count: 72 },
        { month: 'Sep 2025', children_count: 28, weighings_count: 75 },
        { month: 'Okt 2025', children_count: 27, weighings_count: 74 },
        { month: 'Nov 2025', children_count: 29, weighings_count: 78 },
        { month: 'Des 2025', children_count: 30, weighings_count: 80 }
    ],
    monthly_trend: [
        { month: 'Jan 2025', weighings_count: 45 },
        { month: 'Feb 2025', weighings_count: 52 },
        { month: 'Mar 2025', weighings_count: 58 },
        { month: 'Apr 2025', weighings_count: 64 },
        { month: 'Mei 2025', weighings_count: 70 },
        { month: 'Jun 2025', weighings_count: 67 },
        { month: 'Jul 2025', weighings_count: 68 },
        { month: 'Agu 2025', weighings_count: 72 },
        { month: 'Sep 2025', weighings_count: 75 },
        { month: 'Okt 2025', weighings_count: 74 },
        { month: 'Nov 2025', weighings_count: 78 },
        { month: 'Des 2025', weighings_count: 80 }
    ],
    status_distribution: {
        normal: 45,
        kurang: 8,
        sangat_kurang: 3,
        pendek: 6,
        sangat_pendek: 2,
        kurus: 5,
        sangat_kurus: 1,
        lebih: 4,
        gemuk: 4
    }
};

/**
 * How to test:
 * 
 * 1. Open browser console
 * 2. Import the test data and export function:
 *    import { mockReportData } from './mockReportData';
 *    import { exportSystemReportsToExcel } from './excelExport';
 * 
 * 3. Run the export:
 *    exportSystemReportsToExcel(mockReportData, 'Posyandu Test');
 * 
 * 4. File should download automatically
 * 
 * 5. Verify:
 *    ✅ 3 sheets created
 *    ✅ Headers are blue with white text
 *    ✅ Data is properly aligned
 *    ✅ Borders on all cells
 *    ✅ Column widths are appropriate
 *    ✅ Title and metadata at top of each sheet
 */

// Alternative: Test directly in component
export const testExportInComponent = () => {
    // Untuk testing export Excel dengan mock data
    const { exportSystemReportsToExcel } = require('../../utils/excelExport');
    exportSystemReportsToExcel(mockReportData, 'Test Posyandu');
};
