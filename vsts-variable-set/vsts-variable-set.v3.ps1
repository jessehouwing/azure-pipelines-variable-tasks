Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"

$VariableName = Get-VstsInput -name "VariableName"
$Value = Get-VstsInput -name "Value" -default ""
$IsSecret = Get-VstsInput -name "IsSecret" -default $false -AsBool

Write-Output "Setting '$VariableName' to '$Value'."

if ($VariableName -eq "Build.BuildNumber")
{
	Write-VstsUpdateBuildNumber -value $Value
}
else if ($VariableName -eq "Release.Releasename")
{
	Write-VstsUpdateReleaseName -value $Value
}
else
{
	Set-VstsTaskVariable -name $VariableName -value $Value -Secret $IsSecret
}

Write-VstsSetResult -Result "Succeeded" -message "DONE"
