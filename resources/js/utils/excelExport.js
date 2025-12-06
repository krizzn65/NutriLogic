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

    console.log(`✅ Excel file exported successfully: ${filename}`);
};
