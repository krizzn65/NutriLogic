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
 * Export Children Data to Excel with Professional Styling
 * @param {Array} childrenData - Array of children data from API
 * @param {String} posyanduName - Optional posyandu filter name
 */
export function exportChildrenToExcel(childrenData, posyanduName = 'Semua Posyandu') {
    try {
        // Validate input
        if (!childrenData || childrenData.length === 0) {
            throw new Error('Tidak ada data anak untuk diexport');
        }

        // Create workbook
        const wb = XLSX.utils.book_new();

        // ===== SHEET 1: Data Anak (Children Data) =====
        const childrenSheetData = [];

        // Title and metadata
        childrenSheetData.push(['DATA ANAK - SISTEM MONITORING POSYANDU']);
        childrenSheetData.push([`Posyandu: ${posyanduName}`]);
        childrenSheetData.push([`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`]);
        childrenSheetData.push([`Total Data: ${childrenData.length} anak`]);
        childrenSheetData.push([]); // Empty row

        // Headers
        const headers = [
            'No',
            'Nama Lengkap',
            'NIK',
            'Jenis Kelamin',
            'Tanggal Lahir',
            'Usia',
            'BB Lahir (kg)',
            'TB Lahir (cm)',
            'Nama Orang Tua',
            'Posyandu',
            'Status Gizi Terakhir',
            'BB Terakhir (kg)',
            'TB Terakhir (cm)',
            'Tanggal Ukur Terakhir',
            'Status Aktif',
            'Catatan'
        ];
        childrenSheetData.push(headers);

        // Data rows
        childrenData.forEach((child, index) => {
            // Calculate real-time age from birth date
            const ageInMonths = calculateAgeInMonths(child.birth_date);
            const formattedAge = formatAge(ageInMonths);
            
            const row = [
                index + 1,
                child.full_name || '-',
                child.nik || '-',
                child.gender === 'L' ? 'Laki-laki' : child.gender === 'P' ? 'Perempuan' : '-',
                child.birth_date ? new Date(child.birth_date).toLocaleDateString('id-ID') : '-',
                formattedAge,
                child.birth_weight_kg || '-',
                child.birth_height_cm || '-',
                child.parent?.name || child.parent_name || '-',
                child.posyandu?.name || child.posyandu_name || '-',
                formatNutritionalStatus(child.latest_weighing?.nutritional_status || child.latest_status || child.nutritional_status),
                child.latest_weighing?.weight || child.latest_weight || child.weight_kg || '-',
                child.latest_weighing?.height || child.latest_height || child.height_cm || '-',
                child.latest_weighing?.weighing_date ? new Date(child.latest_weighing.weighing_date).toLocaleDateString('id-ID') : (child.latest_measured_at ? new Date(child.latest_measured_at).toLocaleDateString('id-ID') : '-'),
                child.is_active ? 'Aktif' : 'Tidak Aktif',
                child.notes || '-'
            ];
            childrenSheetData.push(row);
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(childrenSheetData);

        // Apply styling
        const range = XLSX.utils.decode_range(ws['!ref']);

        // Title styling (Row 1)
        if (ws['A1']) {
            ws['A1'].s = {
                font: { bold: true, sz: 16, color: { rgb: "1E40AF" } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "DBEAFE" } }
            };
        }

        // Metadata styling (Rows 2-4)
        for (let row = 1; row <= 3; row++) {
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
                    fill: { fgColor: { rgb: "1E40AF" } },
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

        // Data rows styling with nutritional status color coding
        for (let row = headerRow + 1; row <= range.e.r; row++) {
            for (let col = 0; col <= range.e.c; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (ws[cellRef]) {
                    const isStatusColumn = col === 10; // Status Gizi Terakhir column
                    const cellValue = ws[cellRef].v;
                    let fillColor = "FFFFFF"; // Default white

                    // Color coding for nutritional status
                    if (isStatusColumn && cellValue) {
                        const status = cellValue.toLowerCase();
                        if (status.includes('normal') || status.includes('baik')) {
                            fillColor = "D1FAE5"; // Green
                        } else if (status.includes('kurang') || status.includes('kurus')) {
                            fillColor = "FEE2E2"; // Red
                        } else if (status.includes('lebih') || status.includes('gemuk')) {
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
                            wrapText: col === 15 // Wrap text for notes column
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
            { wch: 25 },  // Nama Lengkap
            { wch: 18 },  // NIK
            { wch: 15 },  // Jenis Kelamin
            { wch: 15 },  // Tanggal Lahir
            { wch: 12 },  // Usia
            { wch: 12 },  // BB Lahir
            { wch: 12 },  // TB Lahir
            { wch: 25 },  // Nama Orang Tua
            { wch: 20 },  // Posyandu
            { wch: 20 },  // Status Gizi
            { wch: 12 },  // BB Terakhir
            { wch: 12 },  // TB Terakhir
            { wch: 18 },  // Tanggal Ukur
            { wch: 12 },  // Status Aktif
            { wch: 30 }   // Catatan
        ];

        // Merge title across all columns
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
        ];

        // Set row heights
        ws['!rows'] = [];
        ws['!rows'][0] = { hpt: 25 }; // Title row
        ws['!rows'][headerRow] = { hpt: 35 }; // Header row

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Data Anak');

        // ===== SHEET 2: Statistik Status Gizi =====
        const statsSheetData = [];

        // Calculate statistics
        const stats = calculateNutritionalStats(childrenData);

        statsSheetData.push(['STATISTIK STATUS GIZI ANAK']);
        statsSheetData.push([`Posyandu: ${posyanduName}`]);
        statsSheetData.push([`Total Anak: ${childrenData.length}`]);
        statsSheetData.push([]);

        // Stats table
        statsSheetData.push(['Status Gizi', 'Jumlah', 'Persentase']);
        Object.entries(stats).forEach(([status, count]) => {
            const percentage = childrenData.length > 0 
                ? ((count / childrenData.length) * 100).toFixed(1) 
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

        // Title
        if (wsStats['A1']) {
            wsStats['A1'].s = {
                font: { bold: true, sz: 14, color: { rgb: "1E40AF" } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "DBEAFE" } }
            };
        }

        // Header row
        for (let col = 0; col < 3; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: 4, c: col });
            if (wsStats[cellRef]) {
                wsStats[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "1E40AF" } },
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

        // Data rows
        for (let row = 5; row <= statsRange.e.r; row++) {
            for (let col = 0; col < 3; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (wsStats[cellRef]) {
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
            { wch: 25 },
            { wch: 12 },
            { wch: 15 }
        ];

        wsStats['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }
        ];

        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik Status Gizi');

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `Data_Anak_${posyanduName.replace(/\s+/g, '_')}_${timestamp}.xlsx`;

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
        'sangat_pendek': 'Sangat Pendek'
    };

    return statusMap[status.toLowerCase()] || status;
}

/**
 * Calculate nutritional status statistics
 */
function calculateNutritionalStats(childrenData) {
    const stats = {
        normal: 0,
        kurang: 0,
        sangat_kurang: 0,
        lebih: 0,
        kurus: 0,
        sangat_kurus: 0,
        gemuk: 0,
        pendek: 0,
        sangat_pendek: 0,
        belum_ada_data: 0
    };

    childrenData.forEach(child => {
        const status = (child.latest_status || child.nutritional_status || '').toLowerCase();
        
        if (!status || status === '-') {
            stats.belum_ada_data++;
        } else if (status.includes('normal') || status.includes('baik')) {
            stats.normal++;
        } else if (status.includes('sangat_kurang')) {
            stats.sangat_kurang++;
        } else if (status.includes('kurang')) {
            stats.kurang++;
        } else if (status.includes('sangat_kurus')) {
            stats.sangat_kurus++;
        } else if (status.includes('kurus')) {
            stats.kurus++;
        } else if (status.includes('gemuk')) {
            stats.gemuk++;
        } else if (status.includes('lebih')) {
            stats.lebih++;
        } else if (status.includes('sangat_pendek')) {
            stats.sangat_pendek++;
        } else if (status.includes('pendek')) {
            stats.pendek++;
        } else {
            stats.belum_ada_data++;
        }
    });

    return stats;
}
