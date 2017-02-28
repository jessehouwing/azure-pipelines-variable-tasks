[cmdletbinding()]
param(
    [ValidateNotNullOrEmpty()]
    [Parameter(Mandatory=$true)]
    $VariableName,
    [Parameter(Mandatory=$false)]
    $Value = "",
    [Parameter(Mandatory=$false)]
    $IfVariable = "",
    [Parameter(Mandatory=$false)]
    $IfValueRegex = ""
)

Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"
$PSBoundParameters.Keys | %{ Write-Verbose "$_ = $($PSBoundParameters[$_])" }

if ($IfVariable -ne "") 
{
    Write-Verbose "Checking if $IfVariable is matched by $IfValueRegex"
    if (-Not($IfVariable -match $IfValueRegex))
    {
        Write-Verbose "Value not set. Could not match if constraint."
        exit
    }
}

Write-Output "Setting '$VariableName' to '$Value'."

if ($VariableName -eq "Build.BuildNumber")
{
    Write-Host "##vso[build.updatebuildnumber;]$Value"
}
else
{
    Write-Host "##vso[task.setvariable variable=$($VariableName);]$Value"
}

Write-Host "##vso[task.complete result=Succeeded;]DONE"