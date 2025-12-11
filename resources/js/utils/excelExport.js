import * as XLSX from 'xlsx-js-style';

/**
 * Export System Reports to Excel with Multiple Sheets and Professional Styling
 * 
 * @param {Object} reportData - Data from SystemReports API
 * @param {string} posyanduName - Selected Posyandu name for file naming
 */
export const exportSystemReportsToExcel = (reportData, posyanduName = 'Semua Posyandu') => {
    if (!reportData) {
        console.error('No report data available');
        return;
    }

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Get current date for metadata
    const exportDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // ==================== SHEET 1: Ringkasan & Statistik ====================
    const sheet1Data = [];
    
    // Title and metadata (merged cells)
    sheet1Data.push(['LAPORAN SISTEM NUTRILOGIC']);
    sheet1Data.push(['Posyandu: ' + posyanduName]);
    sheet1Data.push(['Tanggal Export: ' + exportDate]);
    sheet1Data.push([]); // Empty row

    // Ringkasan Data Section
    sheet1Data.push(['RINGKASAN DATA']);
    sheet1Data.push(['Keterangan', 'Jumlah']);
    sheet1Data.push(['Total Posyandu', reportData.summary?.total_posyandu ?? 0]);
    sheet1Data.push(['Total Kader', reportData.summary?.total_kader ?? 0]);
    sheet1Data.push(['Total Orang Tua', reportData.summary?.total_ibu ?? 0]);
    sheet1Data.push(['Total Anak', reportData.summary?.total_anak ?? 0]);
    sheet1Data.push(['Total Penimbangan', reportData.summary?.total_weighings ?? 0]);
    sheet1Data.push([]); // Empty row

    // Statistik Bulanan Section
    sheet1Data.push(['STATISTIK BULANAN']);
    sheet1Data.push(['Bulan', 'Anak Ditimbang', 'Total Penimbangan']);
    
    const growthByPosyandu = reportData.growth_by_posyandu || [];
    growthByPosyandu.forEach(row => {
        sheet1Data.push([
            row.month,
            row.children_count,
            row.weighings_count
        ]);
    });
    
    sheet1Data.push([]); // Empty row

    // Tren Penimbangan Section
    sheet1Data.push(['TREN PENIMBANGAN']);
    sheet1Data.push(['Bulan', 'Jumlah Penimbangan']);
    
    const monthlyTrend = reportData.monthly_trend || [];
    monthlyTrend.forEach(row => {
        sheet1Data.push([
            row.month,
            row.weighings_count
        ]);
    });

    // Create worksheet from data
    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);

    // Styling for Sheet 1
    const sheet1Range = XLSX.utils.decode_range(ws1['!ref']);
    
    // Main title styling (Row 1)
    ws1['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E3A8A" } }, // Dark blue
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Metadata styling (Rows 2-3)
    for (let row = 1; row <= 2; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (ws1[cellAddress]) {
            ws1[cellAddress].s = {
                font: { sz: 11, italic: true },
                alignment: { horizontal: 'left', vertical: 'center' }
            };
        }
    }

    // Header styles function
    const applyHeaderStyle = (cell) => ({
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } }, // Blue 800
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
        }
    });

    // Section title style
    const applySectionTitleStyle = (cell) => ({
        font: { bold: true, sz: 12, color: { rgb: "1E3A8A" } },
        fill: { fgColor: { rgb: "DBEAFE" } }, // Light blue
        alignment: { horizontal: 'left', vertical: 'center' }
    });

    // Data cell style
    const applyDataCellStyle = (cellAddress, isNumber = false) => ({
        alignment: { horizontal: isNumber ? 'center' : 'left', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: "E5E7EB" } },
            bottom: { style: 'thin', color: { rgb: "E5E7EB" } },
            left: { style: 'thin', color: { rgb: "E5E7EB" } },
            right: { style: 'thin', color: { rgb: "E5E7EB" } }
        }
    });

    // Apply section titles
    ['A5', 'A14', 'A14'].forEach((addr, idx) => {
        const rowNum = [4, 13, 13 + growthByPosyandu.length + 3][idx];
        const cell = XLSX.utils.encode_cell({ r: rowNum, c: 0 });
        if (ws1[cell]) {
            ws1[cell].s = applySectionTitleStyle();
        }
    });

    // Apply header and data styles for Ringkasan Data (row 6-12)
    for (let col = 0; col <= 1; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: 5, c: col });
        if (ws1[headerCell]) {
            ws1[headerCell].s = applyHeaderStyle();
        }
    }

    for (let row = 6; row <= 11; row++) {
        for (let col = 0; col <= 1; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws1[cell]) {
                ws1[cell].s = applyDataCellStyle(cell, col === 1);
            }
        }
    }

    // Apply header and data styles for Statistik Bulanan
    const statBulananStartRow = 14;
    for (let col = 0; col <= 2; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: statBulananStartRow, c: col });
        if (ws1[headerCell]) {
            ws1[headerCell].s = applyHeaderStyle();
        }
    }

    for (let row = statBulananStartRow + 1; row < statBulananStartRow + 1 + growthByPosyandu.length; row++) {
        for (let col = 0; col <= 2; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws1[cell]) {
                ws1[cell].s = applyDataCellStyle(cell, col > 0);
            }
        }
    }

    // Apply header and data styles for Tren Penimbangan
    const trenStartRow = statBulananStartRow + growthByPosyandu.length + 3;
    for (let col = 0; col <= 1; col++) {
        const headerCell = XLSX.utils.encode_cell({ r: trenStartRow, c: col });
        if (ws1[headerCell]) {
            ws1[headerCell].s = applyHeaderStyle();
        }
    }

    for (let row = trenStartRow + 1; row < trenStartRow + 1 + monthlyTrend.length; row++) {
        for (let col = 0; col <= 1; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws1[cell]) {
                ws1[cell].s = applyDataCellStyle(cell, col === 1);
            }
        }
    }

    // Merge cells for title
    ws1['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }, // Title
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } }, // Posyandu
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } }  // Date
    ];

    // Set column widths
    ws1['!cols'] = [
        { wch: 25 }, // Column A
        { wch: 20 }, // Column B
        { wch: 20 }  // Column C
    ];

    // ==================== SHEET 2: Analisa Gizi ====================
    const sheet2Data = [];
    
    // Title and metadata
    sheet2Data.push(['ANALISA DISTRIBUSI STATUS GIZI']);
    sheet2Data.push(['Posyandu: ' + posyanduName]);
    sheet2Data.push(['Tanggal Export: ' + exportDate]);
    sheet2Data.push([]);

    // Data header
    sheet2Data.push(['Status Gizi', 'Jumlah Anak']);

    // Status labels mapping
    const statusLabels = {
        normal: 'Normal',
        kurang: 'Kurang',
        sangat_kurang: 'Sangat Kurang',
        pendek: 'Pendek',
        sangat_pendek: 'Sangat Pendek',
        kurus: 'Kurus',
        sangat_kurus: 'Sangat Kurus',
        lebih: 'Lebih',
        gemuk: 'Gemuk'
    };

    const statusDistribution = reportData.status_distribution || {};
    Object.entries(statusDistribution).forEach(([status, count]) => {
        sheet2Data.push([
            statusLabels[status] || status,
            count
        ]);
    });

    // Add total row
    const totalChildren = Object.values(statusDistribution).reduce((a, b) => a + b, 0);
    sheet2Data.push([]);
    sheet2Data.push(['TOTAL ANAK', totalChildren]);

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);

    // Styling for Sheet 2
    const sheet2Range = XLSX.utils.decode_range(ws2['!ref']);

    // Main title
    ws2['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "EA580C" } }, // Orange
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Metadata
    for (let row = 1; row <= 2; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (ws2[cellAddress]) {
            ws2[cellAddress].s = {
                font: { sz: 11, italic: true },
                alignment: { horizontal: 'left', vertical: 'center' }
            };
        }
    }

    // Headers (row 5)
    for (let col = 0; col <= 1; col++) {
        const cell = XLSX.utils.encode_cell({ r: 4, c: col });
        if (ws2[cell]) {
            ws2[cell].s = applyHeaderStyle();
        }
    }

    // Data rows
    const dataRowCount = Object.keys(statusDistribution).length;
    for (let row = 5; row < 5 + dataRowCount; row++) {
        for (let col = 0; col <= 1; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws2[cell]) {
                ws2[cell].s = applyDataCellStyle(cell, col === 1);
            }
        }
    }

    // Total row styling
    const totalRow = 5 + dataRowCount + 1;
    for (let col = 0; col <= 1; col++) {
        const cell = XLSX.utils.encode_cell({ r: totalRow, c: col });
        if (ws2[cell]) {
            ws2[cell].s = {
                font: { bold: true, sz: 11 },
                fill: { fgColor: { rgb: "FEF3C7" } }, // Yellow light
                alignment: { horizontal: col === 0 ? 'left' : 'center', vertical: 'center' },
                border: {
                    top: { style: 'medium', color: { rgb: "000000" } },
                    bottom: { style: 'medium', color: { rgb: "000000" } },
                    left: { style: 'thin', color: { rgb: "000000" } },
                    right: { style: 'thin', color: { rgb: "000000" } }
                }
            };
        }
    }

    // Merge cells
    ws2['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 1 } }
    ];

    // Column widths
    ws2['!cols'] = [
        { wch: 25 },
        { wch: 20 }
    ];

    // ==================== SHEET 3: Raw Data (Placeholder) ====================
    const sheet3Data = [];
    
    sheet3Data.push(['DATA MENTAH - DETAIL ANAK']);
    sheet3Data.push(['Posyandu: ' + posyanduName]);
    sheet3Data.push(['Tanggal Export: ' + exportDate]);
    sheet3Data.push([]);
    sheet3Data.push(['Catatan: Data detail anak dapat ditambahkan melalui endpoint API tambahan']);
    sheet3Data.push([]);
    sheet3Data.push(['Nama Anak', 'Tanggal Lahir', 'Jenis Kelamin', 'Berat Badan (kg)', 'Tinggi Badan (cm)', 'Status Gizi']);

    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);

    // Styling for Sheet 3
    ws3['A1'].s = {
        font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "059669" } }, // Green
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Metadata
    for (let row = 1; row <= 2; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (ws3[cellAddress]) {
            ws3[cellAddress].s = {
                font: { sz: 11, italic: true },
                alignment: { horizontal: 'left', vertical: 'center' }
            };
        }
    }

    // Note styling
    const noteCell = ws3['A5'];
    if (noteCell) {
        noteCell.s = {
            font: { italic: true, sz: 10, color: { rgb: "6B7280" } },
            alignment: { horizontal: 'left', vertical: 'center' }
        };
    }

    // Headers
    for (let col = 0; col <= 5; col++) {
        const cell = XLSX.utils.encode_cell({ r: 6, c: col });
        if (ws3[cell]) {
            ws3[cell].s = applyHeaderStyle();
        }
    }

    ws3['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 5 } },
        { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } }
    ];

    ws3['!cols'] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 15 },
        { wch: 18 },
        { wch: 18 },
        { wch: 20 }
    ];

    // Add worksheets to workbook
    XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan & Statistik');
    XLSX.utils.book_append_sheet(wb, ws2, 'Analisa Gizi');
    XLSX.utils.book_append_sheet(wb, ws3, 'Raw Data');

    // Generate filename
    const sanitizedPosyandu = posyanduName.replace(/[^a-z0-9]/gi, '_');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Laporan_NutriLogic_${sanitizedPosyandu}_${timestamp}.xlsx`;

    // Write file
    XLSX.writeFile(wb, filename);
};

/**
 * Export Kader Children Data to Excel with Professional Formatting
 * 
 * @param {Array} children - Array of children data from Kader
 * @param {string} posyanduName - Posyandu name
 */
export const exportKaderChildrenToExcel = (children, posyanduName = 'Posyandu') => {
    if (!children || children.length === 0) {
        console.error('No children data available');
        alert('Tidak ada data anak untuk diekspor');
        return;
    }

    const wb = XLSX.utils.book_new();
    const exportDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // Prepare data with headers
    const sheetData = [];
    
    // Title rows
    sheetData.push(['DATA ANAK - ' + posyanduName.toUpperCase()]);
    sheetData.push(['Tanggal Export: ' + exportDate]);
    sheetData.push(['Total Anak: ' + children.length]);
    sheetData.push([]); // Empty row

    // Headers
    sheetData.push([
        'No',
        'Nama Lengkap',
        'NIK',
        'Tanggal Lahir',
        'Usia (Bulan)',
        'Jenis Kelamin',
        'Nama Orang Tua',
        'Kontak Orang Tua',
        'Berat Lahir (kg)',
        'Tinggi Lahir (cm)',
        'Status Gizi Terakhir',
        'Tanggal Timbang Terakhir'
    ]);

    // Data rows
    children.forEach((child, index) => {
        const latestWeighing = child.weighing_logs?.[0] || child.latest_weighing;
        const birthDate = new Date(child.birth_date);
        const ageMonths = Math.floor((new Date() - birthDate) / (1000 * 60 * 60 * 24 * 30.44));
        
        sheetData.push([
            index + 1,
            child.full_name || '-',
            child.nik || '-',
            new Date(child.birth_date).toLocaleDateString('id-ID'),
            ageMonths,
            child.gender === 'L' ? 'Laki-laki' : 'Perempuan',
            child.parent?.name || '-',
            child.parent?.phone || '-',
            child.birth_weight_kg || '-',
            child.birth_height_cm || '-',
            latestWeighing?.nutritional_status || 'Belum ada data',
            latestWeighing?.measured_at ? new Date(latestWeighing.measured_at).toLocaleDateString('id-ID') : '-'
        ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // Styling
    const headerStyle = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
        border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
        }
    };

    const titleStyle = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E3A8A" } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    // Apply title styling
    ws['A1'].s = titleStyle;
    ws['A2'].s = { font: { sz: 10, italic: true }, alignment: { horizontal: 'left' } };
    ws['A3'].s = { font: { sz: 10, bold: true }, alignment: { horizontal: 'left' } };

    // Apply header styling (row 5, index 4)
    for (let col = 0; col < 12; col++) {
        const cell = XLSX.utils.encode_cell({ r: 4, c: col });
        if (ws[cell]) {
            ws[cell].s = headerStyle;
        }
    }

    // Apply data cell borders and alignment
    for (let row = 5; row < sheetData.length; row++) {
        for (let col = 0; col < 12; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws[cell]) {
                ws[cell].s = {
                    alignment: { 
                        horizontal: col === 0 || col === 4 || col === 8 || col === 9 ? 'center' : 'left',
                        vertical: 'center' 
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: "E5E7EB" } },
                        bottom: { style: 'thin', color: { rgb: "E5E7EB" } },
                        left: { style: 'thin', color: { rgb: "E5E7EB" } },
                        right: { style: 'thin', color: { rgb: "E5E7EB" } }
                    }
                };
            }
        }
    }

    // Merge title cells
    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } }
    ];

    // Set column widths
    ws['!cols'] = [
        { wch: 5 },   // No
        { wch: 20 },  // Nama
        { wch: 18 },  // NIK
        { wch: 15 },  // Tanggal Lahir
        { wch: 12 },  // Usia
        { wch: 14 },  // Gender
        { wch: 20 },  // Orang Tua
        { wch: 15 },  // Kontak
        { wch: 12 },  // Berat Lahir
        { wch: 12 },  // Tinggi Lahir
        { wch: 20 },  // Status Gizi
        { wch: 18 }   // Tanggal Timbang
    ];

    // Set row heights
    ws['!rows'] = [
        { hpt: 25 }, // Title
        { hpt: 18 }, // Date
        { hpt: 18 }, // Count
        { hpt: 10 }, // Empty
        { hpt: 30 }  // Headers
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Data Anak');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Data_Anak_${posyanduName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
};

/**
 * Export Kader Weighing History to Excel with Formatted Charts-Ready Sheet
 * 
 * @param {Array} weighings - Array of weighing records
 * @param {string} posyanduName - Posyandu name
 * @param {Object} dateRange - { from, to } date range
 */
export const exportKaderWeighingsToExcel = (weighings, posyanduName = 'Posyandu', dateRange = {}) => {
    if (!weighings || weighings.length === 0) {
        console.error('No weighing data available');
        alert('Tidak ada data penimbangan untuk diekspor');
        return;
    }

    const wb = XLSX.utils.book_new();
    const exportDate = new Date().toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

    // ==================== SHEET 1: Ringkasan ====================
    const summaryData = [];
    summaryData.push(['LAPORAN PENIMBANGAN - ' + posyanduName.toUpperCase()]);
    summaryData.push(['Tanggal Export: ' + exportDate]);
    
    if (dateRange.from && dateRange.to) {
        summaryData.push([
            `Periode: ${new Date(dateRange.from).toLocaleDateString('id-ID')} - ${new Date(dateRange.to).toLocaleDateString('id-ID')}`
        ]);
    }
    
    summaryData.push(['Total Penimbangan: ' + weighings.length]);
    summaryData.push([]); // Empty row

    // Count by status
    const statusCount = {};
    weighings.forEach(w => {
        const status = w.data?.nutritional_status || w.nutritional_status || 'Tidak Diketahui';
        statusCount[status] = (statusCount[status] || 0) + 1;
    });

    summaryData.push(['DISTRIBUSI STATUS GIZI']);
    summaryData.push(['Status Gizi', 'Jumlah', 'Persentase']);
    Object.entries(statusCount).forEach(([status, count]) => {
        const percentage = ((count / weighings.length) * 100).toFixed(1) + '%';
        const statusLabel = {
            'normal': 'Normal',
            'kurang': 'Kurang',
            'sangat_kurang': 'Sangat Kurang',
            'pendek': 'Pendek (Stunting)',
            'sangat_pendek': 'Sangat Pendek',
            'kurus': 'Kurus (Wasting)',
            'sangat_kurus': 'Sangat Kurus',
            'lebih': 'Lebih',
            'gemuk': 'Gemuk'
        }[status] || status;
        
        summaryData.push([statusLabel, count, percentage]);
    });

    const ws1 = XLSX.utils.aoa_to_sheet(summaryData);

    // Styling for summary sheet
    const titleStyle = {
        font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E3A8A" } },
        alignment: { horizontal: 'center', vertical: 'center' }
    };

    const headerStyle = {
        font: { bold: true, sz: 11, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "1E40AF" } },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: {
            top: { style: 'thin', color: { rgb: "000000" } },
            bottom: { style: 'thin', color: { rgb: "000000" } },
            left: { style: 'thin', color: { rgb: "000000" } },
            right: { style: 'thin', color: { rgb: "000000" } }
        }
    };

    ws1['A1'].s = titleStyle;
    ws1['A6'].s = { font: { bold: true, sz: 12 }, fill: { fgColor: { rgb: "DBEAFE" } }, alignment: { horizontal: 'left' } };

    // Header styling for status table
    ['A7', 'B7', 'C7'].forEach(cell => {
        if (ws1[cell]) ws1[cell].s = headerStyle;
    });

    // Data styling
    const dataRowStart = 7;
    const dataRowEnd = 7 + Object.keys(statusCount).length;
    for (let row = dataRowStart; row < dataRowEnd; row++) {
        ['A', 'B', 'C'].forEach((col, colIdx) => {
            const cell = col + (row + 1);
            if (ws1[cell]) {
                ws1[cell].s = {
                    alignment: { horizontal: colIdx === 0 ? 'left' : 'center', vertical: 'center' },
                    border: {
                        top: { style: 'thin', color: { rgb: "E5E7EB" } },
                        bottom: { style: 'thin', color: { rgb: "E5E7EB" } },
                        left: { style: 'thin', color: { rgb: "E5E7EB" } },
                        right: { style: 'thin', color: { rgb: "E5E7EB" } }
                    }
                };
            }
        });
    }

    ws1['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 2 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 2 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 2 } }
    ];

    ws1['!cols'] = [{ wch: 25 }, { wch: 12 }, { wch: 15 }];

    // ==================== SHEET 2: Raw Data ====================
    const rawData = [];
    rawData.push(['DATA PENIMBANGAN LENGKAP']);
    rawData.push(['Posyandu: ' + posyanduName]);
    rawData.push(['Tanggal Export: ' + exportDate]);
    rawData.push([]); // Empty row

    rawData.push([
        'No',
        'Tanggal Penimbangan',
        'Waktu',
        'Nama Anak',
        'Jenis Kelamin',
        'Usia (Bulan)',
        'Berat (kg)',
        'Tinggi (cm)',
        'Lingkar Lengan (cm)',
        'Lingkar Kepala (cm)',
        'Status Gizi',
        'Catatan'
    ]);

    weighings.forEach((w, index) => {
        const datetime = w.datetime || w.measured_at;
        const date = new Date(datetime);
        const childGender = w.child_gender || w.child?.gender;
        const data = w.data || w;
        
        rawData.push([
            index + 1,
            date.toLocaleDateString('id-ID'),
            date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            w.child_name || w.child?.full_name || '-',
            childGender === 'L' ? 'Laki-laki' : 'Perempuan',
            w.child?.age_in_months || '-',
            data.weight_kg || '-',
            data.height_cm || '-',
            data.muac_cm || '-',
            data.head_circumference_cm || '-',
            data.nutritional_status || '-',
            data.notes || '-'
        ]);
    });

    const ws2 = XLSX.utils.aoa_to_sheet(rawData);

    // Raw data styling
    ws2['A1'].s = titleStyle;
    
    // Headers
    for (let col = 0; col < 12; col++) {
        const cell = XLSX.utils.encode_cell({ r: 4, c: col });
        if (ws2[cell]) ws2[cell].s = headerStyle;
    }

    // Data cells
    for (let row = 5; row < rawData.length; row++) {
        for (let col = 0; col < 12; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            if (ws2[cell]) {
                ws2[cell].s = {
                    alignment: { 
                        horizontal: [0, 5, 6, 7, 8, 9].includes(col) ? 'center' : 'left',
                        vertical: 'center'
                    },
                    border: {
                        top: { style: 'thin', color: { rgb: "E5E7EB" } },
                        bottom: { style: 'thin', color: { rgb: "E5E7EB" } },
                        left: { style: 'thin', color: { rgb: "E5E7EB" } },
                        right: { style: 'thin', color: { rgb: "E5E7EB" } }
                    }
                };
            }
        }
    }

    ws2['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 11 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 11 } }
    ];

    ws2['!cols'] = [
        { wch: 5 },   // No
        { wch: 15 },  // Tanggal
        { wch: 8 },   // Waktu
        { wch: 20 },  // Nama
        { wch: 14 },  // Gender
        { wch: 12 },  // Usia
        { wch: 10 },  // Berat
        { wch: 10 },  // Tinggi
        { wch: 14 },  // LILA
        { wch: 14 },  // Kepala
        { wch: 20 },  // Status
        { wch: 30 }   // Catatan
    ];

    // Add sheets to workbook
    XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');
    XLSX.utils.book_append_sheet(wb, ws2, 'Data Penimbangan');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Riwayat_Penimbangan_${posyanduName.replace(/[^a-z0-9]/gi, '_')}_${timestamp}.xlsx`;
    
    XLSX.writeFile(wb, filename);
};

