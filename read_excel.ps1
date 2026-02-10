$excel = New-Object -ComObject Excel.Application
$excel.Visible = $false
$excel.DisplayAlerts = $false

try {
    $workbook = $excel.Workbooks.Open("c:\우희\02_기획\_2026 기획\북클럽 3.0 기획자료\북클럽3.0_정책 자료\★ 논의사항 정리_260122.xlsx")

    Write-Host "=== SHEET NAMES ==="
    foreach ($worksheet in $workbook.Worksheets) {
        Write-Host $worksheet.Name
    }
    Write-Host ""

    foreach ($worksheet in $workbook.Worksheets) {
        Write-Host "=== SHEET: $($worksheet.Name) ==="

        $usedRange = $worksheet.UsedRange
        $rowCount = $usedRange.Rows.Count
        $colCount = $usedRange.Columns.Count

        Write-Host "Rows: $rowCount, Columns: $colCount"
        Write-Host ""

        for ($row = 1; $row -le $rowCount; $row++) {
            $rowData = @()
            for ($col = 1; $col -le $colCount; $col++) {
                $cellValue = $worksheet.Cells.Item($row, $col).Text
                if ([string]::IsNullOrWhiteSpace($cellValue)) {
                    $cellValue = "[EMPTY]"
                }
                $rowData += $cellValue
            }
            Write-Host "Row $row : $($rowData -join ' | ')"
        }
        Write-Host ""
        Write-Host "----------------------------------------"
        Write-Host ""
    }

    $workbook.Close($false)
}
catch {
    Write-Host "Error: $_"
}
finally {
    $excel.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($excel) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
