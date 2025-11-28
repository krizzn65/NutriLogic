# PowerShell Script to Add Shimmer Loading to Remaining Files
# Run this in PowerShell from project root: d:\Aplikasi\NutriLogic

$basePath = "d:\Aplikasi\NutriLogic\resources\js\components\konten"

# Define file-skeleton mappings
$fileMappings = @{
    # List Pages
    'KonsultasiKader.jsx'       = 'GenericListSkeleton'
    'JadwalPosyandu.jsx'        = 'GenericListSkeleton'
    'AnakPrioritas.jsx'         = 'GenericListSkeleton'
    'UserManagement.jsx'        = 'GenericListSkeleton'
    'PosyanduManagement.jsx'    = 'GenericListSkeleton'
    'ContentManagement.jsx'     = 'GenericListSkeleton'
    'ActivityLogs.jsx'          = 'GenericListSkeleton'
    'SystemReports.jsx'         = 'GenericListSkeleton'
    'BroadcastKader.jsx'        = 'GenericListSkeleton'
    
    # Detail Pages
    'DataAnakDetail.jsx'        = 'GenericDetailSkeleton'
    'DetailAnakKader.jsx'       = 'GenericDetailSkeleton'
    'ConsultationDetail.jsx'    = 'GenericDetailSkeleton'
    'DetailKonsultasiKader.jsx' = 'GenericDetailSkeleton'
    'ProfilKader.jsx'           = 'GenericDetailSkeleton'
    'AdminProfile.jsx'          = 'GenericDetailSkeleton'
    
    # Form Pages
    'TambahAnakForm.jsx'        = 'GenericFormSkeleton'
    'EditAnakForm.jsx'          = 'GenericFormSkeleton'
    'TambahAnakKaderForm.jsx'   = 'GenericFormSkeleton'
    'EditAnakKaderForm.jsx'     = 'GenericFormSkeleton'
    'CreateConsultation.jsx'    = 'GenericFormSkeleton'
    'TambahJadwalForm.jsx'      = 'GenericFormSkeleton'
    
    # Special Pages
    'ChildrenMonitoring.jsx'    = 'ChildrenMonitoringSkeleton'
    'PenimbanganMassal.jsx'     = 'PenimbanganMassalSkeleton'
    'LaporanKader.jsx'          = 'LaporanKaderSkeleton'
    'SystemSettings.jsx'        = 'SystemSettingsSkeleton'
}

$updated = 0
$skipped = 0
$errors = 0

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Shimmer Loading Batch Update Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($file in $fileMappings.Keys) {
    $skeleton = $fileMappings[$file]
    $filePath = Join-Path $basePath $file
    
    Write-Host "Processing: $file" -NoNewline
    
    if (-not (Test-Path $filePath)) {
        Write-Host " [NOT FOUND]" -ForegroundColor Yellow
        $errors++
        continue
    }
    
    try {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Check if already has skeleton
        if ($content -match $skeleton) {
            Write-Host " [SKIP - Already has skeleton]" -ForegroundColor Gray
            $skipped++
            continue
        }
        
        # Add import after last import statement
        $importLine = "import $skeleton from `"../loading/$skeleton`";`n"
        
        # Find position after last import
        if ($content -match '(?s)(import .+? from .+?;)\s*\n(?!import)') {
            $content = $content -replace '(import .+? from .+?;)(\s*\n)(?!import)', "`$1`$2$importLine"
        }
        
        # Replace loading state patterns
        # Pattern 1: Simple loading with spinner
        $pattern1 = '(?s)if \(loading\) \{[\s\S]*?<div className="animate-spin.*?</div>[\s\S]*?</div>[\s\S]*?</div>[\s\S]*?\);[\s\S]*?\}'
        $replacement1 = "if (loading) {`n        return <$skeleton />;"
        $content = $content -replace $pattern1, $replacement1 + "`n    }"
        
        # Pattern 2: Loading with && condition
        $pattern2 = '(?s)if \(loading && .+?\) \{[\s\S]*?<div className="animate-spin.*?</div>[\s\S]*?</div>[\s\S]*?</div>[\s\S]*?\);[\s\S]*?\}'
        $replacement2 = "if (loading && children.length === 0) {`n        return <$skeleton />;"
        $content = $content -replace $pattern2, $replacement2 + "`n    }"
        
        # Pattern 3: Simple return with message
        $pattern3 = '(?s)if \(loading\) \{[\s\S]*?return \([\s\S]*?Memuat.*?</div>[\s\S]*?\);[\s\S]*?\}'
        $content = $content -replace $pattern3, "if (loading) {`n        return <$skeleton />;" + "`n    }"
        
        # Save file
        Set-Content $filePath -Value $content -NoNewline -Encoding UTF8
        
        Write-Host " [UPDATED]" -ForegroundColor Green
        $updated++
        
    }
    catch {
        Write-Host " [ERROR: $($_.Exception.Message)]" -ForegroundColor Red
        $errors++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Updated: $updated files" -ForegroundColor Green
Write-Host "  Skipped: $skipped files" -ForegroundColor Gray
Write-Host "  Errors:  $errors files" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Cyan

if ($updated -gt 0) {
    Write-Host "Successfully updated $updated files!" -ForegroundColor Green
    Write-Host "`nNext steps:" -ForegroundColor Yellow
    Write-Host "1. Check npm run dev terminal for any errors"
    Write-Host "2. Test the pages in browser"
    Write-Host "3. Verify shimmer loading appears correctly"
}
