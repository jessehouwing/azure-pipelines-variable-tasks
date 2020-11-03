import-module .\ps_modules\vststasksdk\vststasksdk.psd1

Write-VstsTaskWarning -Message "Expand Variable task is no longer required. The 2.0 agent will automatically expand variables."
Write-VstsSetResult -Result "SucceededWithIssues"