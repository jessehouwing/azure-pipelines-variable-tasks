BeforeAll {
    # Mock the VstsTaskSdk module functions
    function Import-Module { param($Name) }
    function Write-VstsTaskWarning { param($Message) }
    function Write-VstsSetResult { param($Result) }
}

Describe "vsts-variable-expand.v3.ps1" {
    BeforeAll {
        $scriptPath = Join-Path $PSScriptRoot "vsts-variable-expand.v3.ps1"
    }

    Context "When the script runs" {
        BeforeAll {
            Mock Import-Module {}
            Mock Write-VstsTaskWarning {}
            Mock Write-VstsSetResult {}
        }

        It "Should show deprecation warning" {
            . $scriptPath

            Should -Invoke Write-VstsTaskWarning -ParameterFilter {
                $Message -like "*no longer required*"
            }
        }

        It "Should set result to SucceededWithIssues" {
            . $scriptPath

            Should -Invoke Write-VstsSetResult -ParameterFilter {
                $Result -eq "SucceededWithIssues"
            }
        }
    }
}
