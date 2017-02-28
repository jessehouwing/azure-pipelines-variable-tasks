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
    $IfValueRegex = "",
    [Parameter(Mandatory=$false)]
    $AlternativeValue = "",
    [Parameter(Mandatory=$false)]
    $applyConstraint = "",
    [Parameter(Mandatory=$false)]
    $applyAlternativeValue = ""
)

Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"
$PSBoundParameters.Keys | %{ Write-Verbose "$_ = $($PSBoundParameters[$_])" }

if ($applyConstraint.ToUpper() -eq "TRUE") 
{
    Write-Verbose "Checking if $IfVariable is matched by $IfValueRegex"
    if (-Not($IfVariable -match $IfValueRegex))
    {
        if ($applyAlternativeValue -eq "FALSE")
        {
            Write-Verbose "Value not set. Could not match if constraint."
            exit
        } else {            
            Write-Verbose "Using alternative value. Could not match if constraint."
            $Value = $AlternativeValue;
        }
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