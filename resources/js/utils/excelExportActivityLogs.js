import * as XLSX from 'xlsx-js-style';

/**
 * Export Activity Logs to Excel with Professional Styling
 * @param {Array} logsData - Array of activity log data
 * @param {Object} filters - Filter options applied
 */
export function exportActivityLogsToExcel(logsData, filters = {}) {
    try {
        // Validate input
        if (!logsData) {
            throw new Error('Data log aktivitas tidak valid');
        }
        
        if (!Array.isArray(logsData)) {
            throw new Error('Format data log aktivitas tidak valid (harus berupa array)');
        }
        
        if (logsData.length === 0) {
            throw new Error('Tidak ada data log aktivitas untuk diexport');
        }

        // Create workbook
        const wb = XLSX.utils.book_new();
        
        if (!wb) {
            throw new Error('Gagal membuat workbook Excel');
        }

        // ===== SHEET 1: Activity Logs =====
        const logsSheetData = [];
        let currentRow = 0;

        // Title and metadata
        logsSheetData.push(['LOG AKTIVITAS SISTEM - NUTRILOGIC']);
        currentRow++;
        
        // Add filter info if applied
        let filterInfo = [];
        if (filters.action) filterInfo.push(`Aksi: ${filters.action}`);
        if (filters.model) filterInfo.push(`Model: ${filters.model}`);
        if (filters.user_id) filterInfo.push(`User ID: ${filters.user_id}`);
        if (filters.date_from && filters.date_to) {
            filterInfo.push(`Periode: ${new Date(filters.date_from).toLocaleDateString('id-ID')} - ${new Date(filters.date_to).toLocaleDateString('id-ID')}`);
        }
        
        if (filterInfo.length > 0) {
            logsSheetData.push([`Filter: ${filterInfo.join(', ')}`]);
            currentRow++;
        }
        
        logsSheetData.push([`Tanggal Export: ${new Date().toLocaleDateString('id-ID', { 
            day: '2-digit', 
            month: 'long', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })}`]);
        currentRow++;
        
        logsSheetData.push([`Total Data: ${logsData.length} log aktivitas`]);
        currentRow++;
        
        logsSheetData.push([]); // Empty row
        currentRow++;

        // Headers - track the actual row index
        const headerRowIndex = currentRow;
        const headers = [
            'No',
            'Waktu',
            'Tanggal',
            'Jam',
            'User',
            'Role',
            'Aksi',
            'Model',
            'Deskripsi',
            'IP Address',
            'User Agent'
        ];
        logsSheetData.push(headers);
        currentRow++;
        
        // Data rows
        logsData.forEach((log, index) => {
            try {
                if (!log) return;
                
                const createdAt = log.created_at ? new Date(log.created_at) : new Date();
                
                // Validate date
                if (isNaN(createdAt.getTime())) {
                    console.warn(`Invalid date for log at index ${index}`);
                    return;
                }
                
                const row = [
                    index + 1,
                    createdAt.toLocaleString('id-ID', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    createdAt.toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                    }),
                    createdAt.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                    }),
                    log.user?.name || 'System',
                    log.user?.role || '-',
                    formatAction(log.action || 'unknown'),
                    log.model || '-',
                    log.description || '-',
                    log.ip_address || '-',
                    log.user_agent || '-'
                ];
                logsSheetData.push(row);
            } catch (err) {
                console.error(`Error processing log at index ${index}:`, err);
            }
        });

        // Create worksheet
        const ws = XLSX.utils.aoa_to_sheet(logsSheetData);
        
        if (!ws || !ws['!ref']) {
            throw new Error('Gagal membuat worksheet Excel');
        }

        // Apply styling
        const range = XLSX.utils.decode_range(ws['!ref']);
        
        // Title styling (Row 1 = index 0)
        if (ws['A1']) {
            ws['A1'].s = {
                font: { bold: true, sz: 16, color: { rgb: "059669" } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { fgColor: { rgb: "D1FAE5" } }
            };
        }

        // Metadata styling (all rows before header, excluding title and empty row)
        for (let row = 1; row < headerRowIndex; row++) {
            if (row === headerRowIndex - 1) continue; // Skip empty row
            const cellRef = XLSX.utils.encode_cell({ r: row, c: 0 });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { sz: 11 },
                    alignment: { horizontal: 'left' }
                };
            }
        }

        // Header row styling - use the dynamically calculated headerRowIndex
        let headerStyleCount = 0;
        for (let col = 0; col < headers.length; col++) {
            const cellRef = XLSX.utils.encode_cell({ r: headerRowIndex, c: col });
            if (ws[cellRef]) {
                ws[cellRef].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
                    fill: { fgColor: { rgb: "059669" } },
                    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
                    border: {
                        top: { style: 'thin', color: { rgb: "000000" } },
                        bottom: { style: 'thin', color: { rgb: "000000" } },
                        left: { style: 'thin', color: { rgb: "000000" } },
                        right: { style: 'thin', color: { rgb: "000000" } }
                    }
                };
                headerStyleCount++;
            }
        }

        // Data rows styling with action color coding
        let dataRowStyleCount = 0;
        for (let row = headerRowIndex + 1; row <= range.e.r; row++) {
            for (let col = 0; col <= range.e.c; col++) {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                if (ws[cellRef]) {
                    const isActionColumn = col === 6; // Aksi column
                    const cellValue = ws[cellRef].v;
                    let fillColor = "FFFFFF"; // Default white

                    // Color coding for actions
                    if (isActionColumn && cellValue) {
                        const action = cellValue.toLowerCase();
                        if (action.includes('login')) {
                            fillColor = "D1FAE5"; // Green
                        } else if (action.includes('logout')) {
                            fillColor = "F3F4F6"; // Gray
                        } else if (action.includes('create') || action.includes('tambah')) {
                            fillColor = "DBEAFE"; // Blue
                        } else if (action.includes('update') || action.includes('ubah')) {
                            fillColor = "FEF3C7"; // Yellow
                        } else if (action.includes('delete') || action.includes('hapus')) {
                            fillColor = "FEE2E2"; // Red
                        }
                    }

                    ws[cellRef].s = {
                        font: { sz: 10 },
                        fill: { fgColor: { rgb: fillColor } },
                        alignment: { 
                            horizontal: col === 0 ? 'center' : 'left', 
                            vertical: 'center',
                            wrapText: col === 8 || col === 10 // Wrap text for description and user agent
                        },
                        border: {
                            top: { style: 'thin', color: { rgb: "E5E7EB" } },
                            bottom: { style: 'thin', color: { rgb: "E5E7EB" } },
                            left: { style: 'thin', color: { rgb: "E5E7EB" } },
                            right: { style: 'thin', color: { rgb: "E5E7EB" } }
                        }
                    };
                    dataRowStyleCount++;
                }
            }
        }

        // Set column widths
        ws['!cols'] = [
            { wch: 5 },   // No
            { wch: 20 },  // Waktu
            { wch: 18 },  // Tanggal
            { wch: 12 },  // Jam
            { wch: 20 },  // User
            { wch: 12 },  // Role
            { wch: 15 },  // Aksi
            { wch: 15 },  // Model
            { wch: 40 },  // Deskripsi
            { wch: 15 },  // IP Address
            { wch: 30 }   // User Agent
        ];

        // Merge title across all columns
        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }
        ];

        // Set row heights
        ws['!rows'] = [];
        ws['!rows'][0] = { hpt: 25 }; // Title row
        ws['!rows'][headerRowIndex] = { hpt: 40 }; // Header row

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Log Aktivitas');

        // ===== SHEET 2: Statistik =====
        const statsSheetData = [];

        // Calculate statistics
        const stats = calculateActivityStats(logsData);

        statsSheetData.push(['STATISTIK LOG AKTIVITAS']);
        statsSheetData.push([`Total Log: ${logsData.length}`]);
        statsSheetData.push([]);

        // Action Stats
        statsSheetData.push(['STATISTIK BERDASARKAN AKSI']);
        statsSheetData.push(['Aksi', 'Jumlah', 'Persentase']);
        Object.entries(stats.actions).forEach(([action, count]) => {
            const percentage = logsData.length > 0 
                ? ((count / logsData.length) * 100).toFixed(1) 
                : 0;
            statsSheetData.push([
                formatAction(action),
                count,
                `${percentage}%`
            ]);
        });
        statsSheetData.push([]);

        // User Stats (Top 10)
        statsSheetData.push(['TOP 10 USER PALING AKTIF']);
        statsSheetData.push(['User', 'Role', 'Jumlah Aktivitas']);
        stats.topUsers.slice(0, 10).forEach(user => {
            statsSheetData.push([
                user.name,
                user.role,
                user.count
            ]);
        });

        const wsStats = XLSX.utils.aoa_to_sheet(statsSheetData);
        const statsRange = XLSX.utils.decode_range(wsStats['!ref']);

        // Style section titles
        for (let row = 0; row <= statsRange.e.r; row++) {
            const cellA = wsStats[XLSX.utils.encode_cell({ r: row, c: 0 })];
            if (cellA && cellA.v && (
                cellA.v.includes('STATISTIK') || 
                cellA.v.includes('TOP 10')
            )) {
                cellA.s = {
                    font: { bold: true, sz: 12, color: { rgb: "059669" } },
                    alignment: { horizontal: 'center', vertical: 'center' },
                    fill: { fgColor: { rgb: "D1FAE5" } }
                };
                
                // Merge across 3 columns
                if (!wsStats['!merges']) wsStats['!merges'] = [];
                wsStats['!merges'].push({ s: { r: row, c: 0 }, e: { r: row, c: 2 } });
            }
        }

        // Style header rows
        for (let row = 0; row <= statsRange.e.r; row++) {
            const cellA = wsStats[XLSX.utils.encode_cell({ r: row, c: 0 })];
            if (cellA && (cellA.v === 'Aksi' || cellA.v === 'User')) {
                for (let col = 0; col < 3; col++) {
                    const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                    if (wsStats[cellRef]) {
                        wsStats[cellRef].s = {
                            font: { bold: true, color: { rgb: "FFFFFF" } },
                            fill: { fgColor: { rgb: "059669" } },
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
            { wch: 15 },
            { wch: 15 }
        ];

        XLSX.utils.book_append_sheet(wb, wsStats, 'Statistik');

        // Generate filename
        const timestamp = new Date().toISOString().split('T')[0];
        let filename = `Log_Aktivitas_${timestamp}.xlsx`;
        
        // Add filter info to filename if available
        if (filters.action) {
            filename = `Log_Aktivitas_${filters.action}_${timestamp}.xlsx`;
        }

        // Write file with error handling
        try {
            XLSX.writeFile(wb, filename);
        } catch (writeError) {
            console.error('Error writing Excel file:', writeError);
            throw new Error('Gagal menyimpan file Excel. Pastikan tidak ada file dengan nama yang sama yang sedang terbuka.');
        }

        return { success: true, filename };

    } catch (error) {
        console.error('Excel export error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Gagal membuat file Excel';
        
        if (error.message.includes('data')) {
            errorMessage = error.message;
        } else if (error.message.includes('workbook') || error.message.includes('worksheet')) {
            errorMessage = 'Gagal memproses data Excel. Silakan coba lagi.';
        } else if (error.message.includes('menyimpan')) {
            errorMessage = error.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
    }
}

/**
 * Format action for display
 */
function formatAction(action) {
    if (!action || typeof action !== 'string') return '-';
    
    try {
        const actionMap = {
            'login': 'Login',
            'logout': 'Logout',
            'create': 'Tambah Data',
            'update': 'Update Data',
            'delete': 'Hapus Data',
            'view': 'Lihat Data',
            'export': 'Export Data'
        };

        return actionMap[action.toLowerCase()] || action;
    } catch (error) {
        console.error('Error formatting action:', error);
        return action || '-';
    }
}

/**
 * Calculate activity statistics
 */
function calculateActivityStats(logsData) {
    const stats = {
        actions: {},
        topUsers: []
    };

    try {
        if (!logsData || !Array.isArray(logsData) || logsData.length === 0) {
            return stats;
        }

        // Count actions
        logsData.forEach(log => {
            try {
                const action = log.action || 'unknown';
                stats.actions[action] = (stats.actions[action] || 0) + 1;
            } catch (err) {
                console.error('Error counting action:', err);
            }
        });

        // Count user activities
        const userCounts = {};
        logsData.forEach(log => {
            try {
                const userId = log.user?.id || 'system';
                const userName = log.user?.name || 'System';
                const userRole = log.user?.role || '-';
                
                if (!userCounts[userId]) {
                    userCounts[userId] = {
                        name: userName,
                        role: userRole,
                        count: 0
                    };
                }
                userCounts[userId].count++;
            } catch (err) {
                console.error('Error counting user activity:', err);
            }
        });

        // Sort users by count
        stats.topUsers = Object.values(userCounts)
            .sort((a, b) => b.count - a.count);

    } catch (error) {
        console.error('Error calculating statistics:', error);
    }

    return stats;
}
