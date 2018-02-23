[cmdletbinding()]
param(
    [ValidateNotNullOrEmpty()]
    [Parameter(Mandatory=$true)]
    $VariableName,
    [Parameter(Mandatory=$false)]
    $Value = ""
)

Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"
$PSBoundParameters.Keys | %{ Write-Verbose "$_ = $($PSBoundParameters[$_])" }

Write-Output "Setting '$VariableName' to '$Value'."

if ($VariableName -eq "Build.BuildNumber")
{
    Write-Host "##vso[build.updatebuildnumber]$Value"
}
else
{
    Write-Host "##vso[task.setvariable variable=$($VariableName);]$Value"
}

Write-Host "##vso[task.complete result=Succeeded;]DONE"
