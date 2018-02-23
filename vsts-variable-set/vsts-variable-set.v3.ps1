Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"

$VariableName = Get-VstsInput -name "VariableName"
$Value = Get-VstsInput -name "Value" -default ""

Write-Output "Setting '$VariableName' to '$Value'."

if ($VariableName -eq "Build.BuildNumber")
{
	Write-VstsUpdateBuildNumber -value $Value
}
else
{
	Set-VstsTaskVariable -name $VariableName -value $Value
}

Write-VstsSetResult -Result "Succeeded" -message "DONE"
