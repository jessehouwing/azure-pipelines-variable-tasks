BeforeAll {
    # Mock the VstsTaskSdk functions
    function Get-VstsInput { param($name, $default, [switch]$AsBool) }
    function Write-VstsUpdateBuildNumber { param($value) }
    function Set-VstsTaskVariable { param($name, $value, [bool]$Secret) }
    function Write-VstsSetResult { param($Result, $message) }
    function Write-VstsTaskWarning { param($Message) }
}

Describe "vsts-variable-set.v3.ps1" {
    BeforeAll {
        $scriptPath = Join-Path $PSScriptRoot "vsts-variable-set.v3.ps1"
    }

    Context "When setting a regular variable" {
        BeforeAll {
            Mock Get-VstsInput {
                switch ($name) {
                    "VariableName" { return "MyVariable" }
                    "Value"        { return "MyValue" }
                    "IsSecret"     { return $false }
                    default        { return $default }
                }
            }
            Mock Set-VstsTaskVariable {}
            Mock Write-VstsSetResult {}
        }

        It "Should call Set-VstsTaskVariable with correct parameters" {
            . $scriptPath

            Should -Invoke Set-VstsTaskVariable -ParameterFilter {
                $name -eq "MyVariable" -and $value -eq "MyValue" -and $Secret -eq $false
            }
        }

        It "Should set result to Succeeded" {
            . $scriptPath

            Should -Invoke Write-VstsSetResult -ParameterFilter {
                $Result -eq "Succeeded"
            }
        }
    }

    Context "When setting Build.BuildNumber" {
        BeforeAll {
            Mock Get-VstsInput {
                switch ($name) {
                    "VariableName" { return "Build.BuildNumber" }
                    "Value"        { return "1.2.3" }
                    "IsSecret"     { return $false }
                    default        { return $default }
                }
            }
            Mock Write-VstsUpdateBuildNumber {}
            Mock Write-VstsSetResult {}
        }

        It "Should call Write-VstsUpdateBuildNumber" {
            . $scriptPath

            Should -Invoke Write-VstsUpdateBuildNumber -ParameterFilter {
                $value -eq "1.2.3"
            }
        }
    }

    Context "When setting a secret variable" {
        BeforeAll {
            Mock Get-VstsInput {
                switch ($name) {
                    "VariableName" { return "SecretVar" }
                    "Value"        { return "secret-value" }
                    "IsSecret"     { return $true }
                    default        { return $default }
                }
            }
            Mock Set-VstsTaskVariable {}
            Mock Write-VstsSetResult {}
        }

        It "Should call Set-VstsTaskVariable with Secret flag" {
            . $scriptPath

            Should -Invoke Set-VstsTaskVariable -ParameterFilter {
                $name -eq "SecretVar" -and $value -eq "secret-value" -and $Secret -eq $true
            }
        }
    }
}
