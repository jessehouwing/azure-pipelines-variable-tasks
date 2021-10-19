[cmdletbinding()]
param(
    [Parameter(Mandatory=$true)]
    [ValidateNotNullOrEmpty()]
    [string] $VariableNames,
    [ValidateSet("true", "false", "1", "0")]
    [string] $MaxDepth = 5
)

Write-Verbose "Entering script $($MyInvocation.MyCommand.Name)"
Write-Verbose "Parameter Values"
$PSBoundParameters.Keys | %{ Write-Verbose "$_ = $($PSBoundParameters[$_])" }

Write-Verbose "Importing modules"
import-module "Microsoft.TeamFoundation.DistributedTask.Task.Internal"
import-module "Microsoft.TeamFoundation.DistributedTask.Task.Common"

function Expand-Variable{
    param
    (
        [Parameter(Mandatory=$true)]
        [ValidateNotNullOrEmpty()]
        [string] $Variable
    )
    begin
    {
        $value = Get-TaskVariable $distributedTaskContext $Variable
    }   
    process
    {
        do 
        {
            $newValue = $value
            $value = [Microsoft.TeamFoundation.DistributedTask.Agent.Common.ContextExtensions]::ExpandVariables($distributedTaskContext, $newValue)
        } 
        while ($value -ne $newValue)
    }
    end
    {
        return $value
    }
}

function Get-VariableNames{
    param
    (
        [switch] $safe = $false
    )
    begin
    {
        Write-Debug "Entering: Get-Variables"
        
        $type = [Microsoft.TeamFoundation.DistributedTask.Agent.Interfaces.IServiceManager] 
        $variableService = $type.GetMethod("GetService").MakeGenericMethod([Microsoft.TeamFoundation.DistributedTask.Agent.Interfaces.IVariableService]).Invoke($distributedTaskContext, @())
        $dictionary = New-Object "System.Collections.Generic.Dictionary[string,string]" ([System.StringComparer]::OrdinalIgnoreCase)
    }
    process
    {
        if ($safe.IsPresent)
        {
            $variableService.MergeSafeVariables($dictionary)
        }
        else
        {
            $variableService.MergeVariables($dictionary)
        }
    }
    end
    {
        Write-Debug "Leaving: Get-Variables"
        return @($dictionary.Keys)
    }
}

function Expand-Variables
{
    param
    (
        [array] $variables = @()
    )
    begin
    {
        Write-Debug "Entering: Expand-Variables"
    }
    process
    {
        $Variables = $Variables | %{ $_.Trim() }
        
        if ($Variables -contains "*")
        {
            Expand-Variables -variables (Get-VariableNames -safe)
            return;
        }
        else
        {
            for ($i = 0; $i -lt $MaxDepth; $i++)
            {
                foreach ($Variable in $Variables)
                {
                    $Variable = $Variable.Trim()
                
                    if ($Variable -ne "")
                    {
                        Invoke-ExpandVariable $Variable
                    }
                }
            }
        }
    }
    end
    {
        Write-Debug "Leaving: Expand-Variables"
    }
}

function Invoke-ExpandVariable
{
    param
    (
        [string] $name
    )

    begin
    {
        Write-Debug "Entering: Expand variable"
    }
    process
    {
        for ($i = 0; $i -lt $MaxDepth; $i++)
        {
            $currentValue = Get-TaskVariable $distributedTaskContext $Variable
            $newValue = Expand-Variable $Variable

            if ($currentValue -cne $newValue)
            {
                Write-Output "Setting '$Variable' to '$newValue'."
                Write-Host "##vso[task.setvariable variable=$($Variable);]$newValue"
                break
            }
        }
    }
    end
    {
        Write-Debug "Leaving: Expand variable"
    }
}
$Variables = ($VariableNames -split "`r?`n|;|,")

Expand-Variables $Variables

Write-Host "##vso[task.complete result=Succeeded;]DONE"