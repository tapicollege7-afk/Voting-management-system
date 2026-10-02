$ppt = New-Object -ComObject PowerPoint.Application
$ppt.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue
$pres = $ppt.Presentations.Open('E:\Minor project\docs\VotePulse_Seminar_Presentation.pptx', [Microsoft.Office.Core.MsoTriState]::msoTrue, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoFalse)
$pres.Slides.Item(1).Export('E:\Minor project\docs\test_export_slide1.png', 'PNG', 1920, 1080)
$pres.Slides.Item(2).Export('E:\Minor project\docs\test_export_slide2.png', 'PNG', 1920, 1080)
$pres.Close()
$ppt.Quit()
[System.GC]::Collect()
[System.GC]::WaitForPendingFinalizers()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
Write-Host "Exported slide 1 and 2 successfully!"
