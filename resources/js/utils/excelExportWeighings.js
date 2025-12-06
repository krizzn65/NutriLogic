import * as XLSX from 'xlsx-js-style';

/**
 * Calculate age in months from birth date (real-time)
 */
function calculateAgeInMonths(birthDate) {
    if (!birthDate) return 0;
    
    const birth = new Date(birthDate);
    const now = new Date();
    
    const years = now.getFullYear() - birth.getFullYear();
    const months = now.getMonth() - birth.getMonth();
    const days = now.getDate() - birth.getDate();
    
    let totalMonths = years * 12 + months;
    
    // Adjust if the current day hasn't reached the birth day yet
    if (days < 0) {
        totalMonths--;
    }
    
    return Math.max(0, totalMonths);
}

/**
 * Format age in months to readable string (e.g., "2 tahun 3 bulan")
 */
function formatAge(ageInMonths) {
    if (!ageInMonths || ageInMonths < 1) {
        return 'Kurang dari 1 bulan';
    } else if (ageInMonths < 12) {
        return `${Math.floor(ageInMonths)} bulan`;
    } else {
        const years = Math.floor(ageInMonths / 12);
        const months = Math.floor(ageInMonths % 12);
        if (months === 0) {
            return `${years} tahun`;
        } else {
            return `${years} tahun ${months} bulan`;
        }
    }
}

/**
 * Export Weighing Data to Excel with Professional Styling
 * @param {Array} weighingData - Array of weighing data from API
 * @param {String} posyanduName - Optional posyandu filter name
 * @param {Object} filters - Filter options (dateFrom, dateTo)
 */
export function exportWeighingsToExcel(weighingData, posyanduName = 'Semua Posyandu', filters = {}) {
    try {
        // Validate input
        if (!weighingData || weighingData.length === 0) {
            throw new Error('Tidak ada data penimbangan untuk diexport');
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // ===== SHEET 1: Data Penimbangan (Weighing Data) =====
        const weighingSheetData = [];

        // Title and metadata
        weighingSheetData.push(['DATA PENIMBANGAN - SISTEM MONITORING POSYANDU']);
        weighingSheetData.push([`Posyandu: ${posyanduName}`]);
        
        // Add date range if filtered
        if (filters.dateFrom && filters.dateTo) {
            weighingSheetData.push([`Periode: ${new Date(filters.dateFrom).toLocaleDateString('id-ID')} - ${new Date(filters.dateTo).toLocaleDateString('id-ID')}`]);
        }
        
        weighingSheetData.push([`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`]);
        weighingSheetData.push([`Total Data: ${weighingData.length} penimbangan`]);
        weighingSheetData.push([]); // Empty row

        // Headers
        const headers = [
            'No',
            'Tanggal Ukur',
            'Nama Anak',
            'Usia',
            'Jenis Kelamin',
            'Berat Badan (kg)',
            'Tinggi Badan (cm)',
            'Lingkar Kepala (cm)',
            'LILA (cm)',
            'Status Gizi BB/U',
            'Status Gizi TB/U',
            'Status Gizi BB/TB',
            'Status Gizi IMT/U',
            'Status Gizi LILA',
            'Posyandu',
            'Nama Orang Tua',
            'Catatan'
        ];
        weighingSheetData.push(headers);

        // Data rows
        weighingData.forEach((weighing, index) => {
            // Calculate real-time age from birth date
            const childBirthDate = weighing.child?.birth_date || weighing.birth_date;
            const ageInMonths = calculateAgeInMonths(childBirthDate);
            const formattedAge = formatAge(ageInMonths);
            
            const row = [
                index + 1,
                weighing.measured_at ? new Date(weighing.measured_at).toLocaleDateString('id-ID') : '-',
                weighing.child?.full_name || weighing.child_name || '-',
                formattedAge,
                (weighing.child?.gender || weighing.gender) === 'L' ? 'Laki-laki' : (weighing.child?.gender || weighing.gender) === 'P' ? 'Perempuan' : '-',
                weighing.weight_kg || '-',
                weighing.height_cm || '-',
                weighing.head_circumference_cm || '-',
                weighing.muac_cm || '-',
                formatNutritionalStatus(weighing.bb_u_status || weighing.nutritional_status),
                formatNutritionalStatus(weighing.tb_u_status),
                formatNutritionalStatus(weighing.bb_tb_status),
                formatNutritionalStatus(weighing.imt_u_status),
                formatNutritionalStatus(weighing.muac_status),
                weighing.child?.posyandu?.name || weighing.posyandu_name || '-',
                weighing.child?.parent?.name || weighing.parent_name || '-',
                weighing.notes || '-'
            ];
            weighingSheetData.push(row);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(weighingSheetData);

        // Apply styling
        const range = XLSX.utils.decode_range(ws['!ref']);

        // Title styling (Row 1)
        if (ws['A1']) {
            ws['A1'].s = {
                font: { bold: true, sz: 16, color: { rgb: "7C3AED" } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "EDE9FE" } }
            };
        }

        // Metadata styling (Rows 2-5)
        for (let row = 1; row <= 4; row++) {
            const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { sz: 11 },
                    alignment: { horizontal: 'left' }
                };
            }
        }

        // Header row styling (Row 6 - after empty row)
        const headerRow = 5;
        for (let col = 0; col < headers.length; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: headerRow, c: col });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                    fill: { fgColor: { rgb: "7C3AED" } },
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: {
                        top: { style: 'thin', color: { rgb: "000000" } },
                        bottom: { style: 'thin', color: { rgb: "000000" } },
                        left: { style: 'thin', color: { rgb: "000000" } },
                        right: { style: 'thin', color: { rgb: "000000" } }
                    }
                };
            }
        }

        // Data rows styling with status color coding
        for (let row = headerRow + 1; row <= range.e.r; row++) {
            for (let col = 0; col <= range.e.c; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (ws[cellRef]) {
                    const isStatusColumn = col >= 9 && col <= 13; // Status columns
                    const cellValue = ws[cellRef].v;
                    let fillColor = "FFFFFF"; // Default white

                    // Color coding for nutritional status
                    if (isStatusColumn && cellValue) {
                        const status = cellValue.toLowerCase();
                        if (status.includes('normal') || status.includes('baik')) {
                            fillColor = "D1FAE5"; // Green
                        } else if (status.includes('kurang') || status.includes('kurus')) {
                            fillColor = "FEE2E2"; // Red
                        } else if (status.includes('lebih') || status.includes('gemuk') || status.includes('obesitas')) {
                            fillColor = "FEF3C7"; // Yellow
                        } else if (status.includes('pendek')) {
                            fillColor = "DBEAFE"; // Blue
                        }
                    }

                    ws[cellRef].s = {
                        font: { sz: 10 },
                        fill: { fgColor: { rgb: fillColor } },
                        alignment: { 
                            horizontal: col === 0 ? 'center' : 'left', 
                            vertical: 'center',
                            wrapText: col === 16 // Wrap text for notes column
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

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },   // No
            { wch: 15 },  // Tanggal Ukur
            { wch: 25 },  // Nama Anak
            { wch: 15 },  // Usia
            { wch: 15 },  // Jenis Kelamin
            { wch: 12 },  // BB
            { wch: 12 },  // TB
            { wch: 15 },  // Lingkar Kepala
            { wch: 12 },  // LILA
            { wch: 18 },  // Status BB/U
            { wch: 18 },  // Status TB/U
            { wch: 18 },  // Status BB/TB
            { wch: 18 },  // Status IMT/U
            { wch: 18 },  // Status LILA
            { wch: 20 },  // Posyandu
            { wch: 25 },  // Nama Orang Tua
            { wch: 30 }   // Catatan
        ];

        // Merge title across all columns
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
        ];

        // Set row heights
        ws['!rows'] = [];
        ws['!rows'][0] = { hpt: 25 }; // Title row
        ws['!rows'][headerRow] = { hpt: 40 }; // Header row

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data Penimbangan');

        // ===== SHEET 2: Statistik Status Gizi =====
        const statsSheetData = [];

        // Calculate statistics
        const stats = calculateNutritionalStats(weighingData);

        statsSheetData.push(['STATISTIK STATUS GIZI PENIMBANGAN']);
        statsSheetData.push([`Posyandu: ${posyanduName}`]);
        if (filters.dateFrom && filters.dateTo) {
            statsSheetData.push([`Periode: ${new Date(filters.dateFrom).toLocaleDateString('id-ID')} - ${new Date(filters.dateTo).toLocaleDateString('id-ID')}`]);
        }
        statsSheetData.push([`Total Penimbangan: ${weighingData.length}`]);
        statsSheetData.push([]);

        // BB/U Stats
        statsSheetData.push(['STATUS GIZI BERAT BADAN MENURUT UMUR (BB/U)']);
        statsSheetData.push(['Status', 'Jumlah', 'Persentase']);
        Object.entries(stats.bb_u).forEach(([status, count]) => {
            const percentage = weighingData.length > 0 
                ? ((count / weighingData.length) * 100).toFixed(1) 
                : 0;
            statsSheetData.push([
                formatNutritionalStatus(status),
                count,
                `${percentage}%`
            ]);
        });
        statsSheetData.push([]);

        // TB/U Stats
        statsSheetData.push(['STATUS GIZI TINGGI BADAN MENURUT UMUR (TB/U)']);
        statsSheetData.push(['Status', 'Jumlah', 'Persentase']);
        Object.entries(stats.tb_u).forEach(([status, count]) => {
            const percentage = weighingData.length > 0 
                ? ((count / weighingData.length) * 100).toFixed(1) 
                : 0;
            statsSheetData.push([
                formatNutritionalStatus(status),
                count,
                `${percentage}%`
            ]);
        });
        statsSheetData.push([]);

        // BB/TB Stats
        statsSheetData.push(['STATUS GIZI BERAT BADAN MENURUT TINGGI BADAN (BB/TB)']);
        statsSheetData.push(['Status', 'Jumlah', 'Persentase']);
        Object.entries(stats.bb_tb).forEach(([status, count]) => {
            const percentage = weighingData.length > 0 
                ? ((count / weighingData.length) * 100).toFixed(1) 
                : 0;
            statsSheetData.push([
                formatNutritionalStatus(status),
                count,
                `${percentage}%`
            ]);
        });

        const wsStats = XLSX.utils.aoa_to_sheet(statsSheetData);

        // Apply styling to stats sheet
        const statsRange = XLSX.utils.decode_range(wsStats['!ref']);

        // Style all section titles
        let currentRow = 0;
        for (let row = 0; row <= statsRange.e.r; row++) {
            const cellA = wsStats[XLSX.utils.encode_cell({ r: row, c: 0 })];
            if (cellA && cellA.v && (
                cellA.v.includes('STATISTIK') || 
                cellA.v.includes('STATUS GIZI BERAT') ||
                cellA.v.includes('STATUS GIZI TINGGI')
            )) {
                cellA.s = {
                    font: { bold: true, sz: 12, color: { rgb: "7C3AED" } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    fill: { fgColor: { rgb: "EDE9FE" } }
                };
                
                // Merge across 3 columns
                if (!wsStats['!merges']) wsStats['!merges'] = [];
                wsStats['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 2 } });
            }
        }

        // Style header rows (Status, Jumlah, Persentase)
        for (let row = 0; row <= statsRange.e.r; row++) {
            const cellA = wsStats[XLSX.utils.encode_cell({ r: row, c: 0 })];
            if (cellA && cellA.v === 'Status') {
                for (let col = 0; col < 3; col++) {
                    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                    if (wsStats[cellRef]) {
                        wsStats[cellRef].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "7C3AED" } },
                            alignment: { horizontal: 'center', vertical: 'center' },
                            border: {
                                top: { style: 'thin', color: { rgb: "000000" } },
                                bottom: { style: 'thin', color: { rgb: "000000" } },
                                left: { style: 'thin', color: { rgb: "000000" } },
                                right: { style: 'thin', color: { rgb: "000000" } }
                            }
                        };
                    }
                }
            }
        }

        // Style data rows
        for (let row = 0; row <= statsRange.e.r; row++) {
            for (let col = 0; col < 3; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (wsStats[cellRef] && wsStats[cellRef].s === undefined) {
                    wsStats[cellRef].s = {
                        alignment: { horizontal: col === 0 ? 'left' : 'center', vertical: 'center' },
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

        wsStats['!cols'] = [
            { wch: 30 },
            { wch: 12 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik Status Gizi');

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        let filename = `Data_Penimbangan_${posyanduName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;
        
        if (filters.dateFrom && filters.dateTo) {
            const dateRange = `${filters.dateFrom}_${filters.dateTo}`;
            filename = `Data_Penimbangan_${posyanduName.replace(/\s+/g, '_')}_${dateRange}.xlsx`;
        }

        // Write file
        XLSX.writeFile(wb, filename);

        return { success: true, filename };

    } catch (error) {
        console.error('Excel export error:', error);
        throw new Error(error.message || 'Gagal membuat file Excel');
    }
}

/**
 * Format nutritional status for display
 */
function formatNutritionalStatus(status) {
    if (!status || status === '-') return 'Belum Ada Data';
    
    const statusMap = {
        'normal': 'Normal',
        'baik': 'Baik',
        'kurang': 'Gizi Kurang',
        'sangat_kurang': 'Gizi Sangat Kurang',
        'lebih': 'Gizi Lebih',
        'obesitas': 'Obesitas',
        'kurus': 'Kurus',
        'sangat_kurus': 'Sangat Kurus',
        'gemuk': 'Gemuk',
        'pendek': 'Pendek',
        'sangat_pendek': 'Sangat Pendek',
        'berisiko_pendek': 'Berisiko Pendek',
        'tinggi': 'Tinggi'
    };

    return statusMap[status.toLowerCase()] || status;
}

/**
 * Calculate nutritional status statistics
 */
function calculateNutritionalStats(weighingData) {
    const stats = {
        bb_u: {
            normal: 0,
            kurang: 0,
            sangat_kurang: 0,
            lebih: 0,
            belum_ada_data: 0
        },
        tb_u: {
            normal: 0,
            pendek: 0,
            sangat_pendek: 0,
            tinggi: 0,
            belum_ada_data: 0
        },
        bb_tb: {
            normal: 0,
            kurus: 0,
            sangat_kurus: 0,
            gemuk: 0,
            obesitas: 0,
            belum_ada_data: 0
        }
    };

    weighingData.forEach(weighing => {
        // BB/U Status
        const bbUStatus = (weighing.bb_u_status || weighing.nutritional_status || '').toLowerCase();
        if (!bbUStatus || bbUStatus === '-') {
            stats.bb_u.belum_ada_data++;
        } else if (bbUStatus.includes('normal')) {
            stats.bb_u.normal++;
        } else if (bbUStatus.includes('sangat_kurang')) {
            stats.bb_u.sangat_kurang++;
        } else if (bbUStatus.includes('kurang')) {
            stats.bb_u.kurang++;
        } else if (bbUStatus.includes('lebih')) {
            stats.bb_u.lebih++;
        } else {
            stats.bb_u.belum_ada_data++;
        }

        // TB/U Status
        const tbUStatus = (weighing.tb_u_status || '').toLowerCase();
        if (!tbUStatus || tbUStatus === '-') {
            stats.tb_u.belum_ada_data++;
        } else if (tbUStatus.includes('normal')) {
            stats.tb_u.normal++;
        } else if (tbUStatus.includes('sangat_pendek')) {
            stats.tb_u.sangat_pendek++;
        } else if (tbUStatus.includes('pendek')) {
            stats.tb_u.pendek++;
        } else if (tbUStatus.includes('tinggi')) {
            stats.tb_u.tinggi++;
        } else {
            stats.tb_u.belum_ada_data++;
        }

        // BB/TB Status
        const bbTbStatus = (weighing.bb_tb_status || '').toLowerCase();
        if (!bbTbStatus || bbTbStatus === '-') {
            stats.bb_tb.belum_ada_data++;
        } else if (bbTbStatus.includes('normal')) {
            stats.bb_tb.normal++;
        } else if (bbTbStatus.includes('sangat_kurus')) {
            stats.bb_tb.sangat_kurus++;
        } else if (bbTbStatus.includes('kurus')) {
            stats.bb_tb.kurus++;
        } else if (bbTbStatus.includes('obesitas')) {
            stats.bb_tb.obesitas++;
        } else if (bbTbStatus.includes('gemuk')) {
            stats.bb_tb.gemuk++;
        } else {
            stats.bb_tb.belum_ada_data++;
        }
    });

    return stats;
}
