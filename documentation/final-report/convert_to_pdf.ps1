param(
    [string]$DocxPath = "C:\Projects\MMS\KJIT_Media_Management_System_Final_Project_Report.docx",
    [string]$PdfPath = "C:\Projects\MMS\KJIT_Media_Management_System_Final_Project_Report.pdf"
)

Write-Host "Starting Word COM conversion from $DocxPath to $PdfPath..."
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = [Microsoft.Office.Interop.Word.WdAlertLevel]::wdAlertsNone

try {
    $doc = $word.Documents.Open($DocxPath)
    Write-Host "Updating document fields..."
    foreach ($field in $doc.Fields) {
        try { $field.Update() } catch {}
    }
    
    # 17 represents wdFormatPDF
    Write-Host "Exporting to PDF format..."
    $doc.SaveAs([ref]$PdfPath, [ref]17)
    
    # Also save a copy to documentation/final-report
    $copyPath = "C:\Projects\MMS\documentation\final-report\KJIT_Media_Management_System_Final_Project_Report.pdf"
    $doc.SaveAs([ref]$copyPath, [ref]17)

    $pageCount = $doc.ComputeStatistics(2) # 2 = wdStatisticPages
    Write-Host "Document Total Pages: $pageCount"
    
    $doc.Close([ref]0)
    Write-Host "PDF successfully created at $PdfPath and $copyPath"
} catch {
    Write-Error $_
} finally {
    try { $word.Quit() } catch {}
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()
}
