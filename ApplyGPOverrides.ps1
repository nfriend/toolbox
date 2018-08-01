# This file resets some of the more annoying settings enforced by Group Policy
# Run this file as administrator.

# This function detects if a registry value exists
# from https://stackoverflow.com/a/5652674/1063392
Function Test-RegistryValue {
    param(
        [Alias("PSPath")]
        [Parameter(Position = 0, Mandatory = $true, ValueFromPipeline = $true, ValueFromPipelineByPropertyName = $true)]
        [String]$Path
        ,
        [Parameter(Position = 1, Mandatory = $true)]
        [String]$Name
        ,
        [Switch]$PassThru
    ) 

    process {
        if (Test-Path $Path) {
            $Key = Get-Item -LiteralPath $Path
            if ($Key.GetValue($Name, $null) -ne $null) {
                if ($PassThru) {
                    Get-ItemProperty $Path $Name
                } else {
                    $true
                }
            } else {
                $false
            }
        } else {
            $false
        }
    }
}

# Allow Chrome's syncing ability
New-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Google\Chrome" -Name "SyncDisabled" -Value 0 -PropertyType DWORD -Force | Out-Null

# Hide the home button
New-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Google\Chrome" -Name "ShowHomeButton" -Value 0 -PropertyType DWORD -Force | Out-Null

# Remove the "Startup URLs" which opens new tabs when Chrome is started
If (Test-RegistryValue -Path "HKLM:\SOFTWARE\Policies\Google\Chrome\RestoreOnStartupURLs" -Name "1") {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Google\Chrome\RestoreOnStartupURLs" -Name "1" -Force | Out-Null
}
If (Test-RegistryValue -Path "HKLM:\SOFTWARE\Policies\Google\Chrome\RestoreOnStartupURLs" -Name "2") {
    Remove-ItemProperty -Path "HKLM:\SOFTWARE\Policies\Google\Chrome\RestoreOnStartupURLs" -Name "2" -Force | Out-Null
}