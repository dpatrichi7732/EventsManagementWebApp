<#
.DESCRIPTION
This script is used to deploy the customized Angular Application to Dynamics 365 Portal instance.
It builds the application and prepares the output files suitable. 
After all the files are built, it asks you to sign in to your Dynamics 365 Marketing instance and it pushes the files to the instance. 

.PARAMETER inputFiles
List of files name that need to be updated.

.EXAMPLE
.\DeployToDynamics365Instance.ps1
.\DeployToDynamics365Instance.ps1 -inputFiles main.es, scripts.es, 1066.json
#>

param(
    [String[]]$inputFiles
)

$websitePath  = (Get-Item $PSScriptRoot).Parent.FullName

$appOutputPath = Join-Path $websitePath "dist/portals-hosted"
$localizationPath = Join-Path $websitePath "Localization"

$files = @{
    # Filename                       WebFile                      MimeType
    'fontawesome-webfont.eot'    = @('fontawesome-webfont.eot',   'application/vnd.ms-fontobject')
    'fontawesome-webfont.svg'    = @('fontawesome-webfont.svg',   'image/svg+xml')
    'fontawesome-webfont.ttf'    = @('fontawesome-webfont.ttf',   'font/ttf')
    'fontawesome-webfont.woff'   = @('fontawesome-webfont.woff',  'application/font-woff')
    'fontawesome-webfont.woff2'  = @('fontawesome-webfont.woff2', 'font/woff2')
    'main.es'                    = @('main.js',                   'application/javascript')
    'polyfills.es'               = @('polyfills.js',              'application/javascript')
    'runtime.es'                 = @('runtime.js',                'application/javascript')
    'scripts.es'                 = @('scripts.js',                'application/javascript')
    'styles.css'                 = @('styles.css',                'text/css')

    '1025.json'                 =  @('1025.json',                 'application/json')
    '1026.json'                 =  @('1026.json',                 'application/json')
    '1027.json'                 =  @('1027.json',                 'application/json')
    '1028.json'                 =  @('1028.json',                 'application/json')
    '1029.json'                 =  @('1029.json',                 'application/json')
    '1030.json'                 =  @('1030.json',                 'application/json')
    '1031.json'                 =  @('1031.json',                 'application/json')
    '1032.json'                 =  @('1032.json',                 'application/json')
    '1033.json'                 =  @('1033.json',                 'application/json')
    '1035.json'                 =  @('1035.json',                 'application/json')
    '1036.json'                 =  @('1036.json',                 'application/json')
    '1037.json'                 =  @('1037.json',                 'application/json')
    '1038.json'                 =  @('1038.json',                 'application/json')
    '1040.json'                 =  @('1040.json',                 'application/json')
    '1041.json'                 =  @('1041.json',                 'application/json')
    '1042.json'                 =  @('1042.json',                 'application/json')
    '1043.json'                 =  @('1043.json',                 'application/json')
    '1044.json'                 =  @('1044.json',                 'application/json')
    '1045.json'                 =  @('1045.json',                 'application/json')
    '1046.json'                 =  @('1046.json',                 'application/json')
    '1048.json'                 =  @('1048.json',                 'application/json')
    '1049.json'                 =  @('1049.json',                 'application/json')
    '1050.json'                 =  @('1050.json',                 'application/json')
    '1051.json'                 =  @('1051.json',                 'application/json')
    '1053.json'                 =  @('1053.json',                 'application/json')
    '1054.json'                 =  @('1054.json',                 'application/json')
    '1055.json'                 =  @('1055.json',                 'application/json')
    '1057.json'                 =  @('1057.json',                 'application/json')
    '1058.json'                 =  @('1058.json',                 'application/json')
    '1060.json'                 =  @('1060.json',                 'application/json')
    '1061.json'                 =  @('1061.json',                 'application/json')
    '1062.json'                 =  @('1062.json',                 'application/json')
    '1063.json'                 =  @('1063.json',                 'application/json')
    '1066.json'                 =  @('1066.json',                 'application/json')
    '1069.json'                 =  @('1069.json',                 'application/json')
    '1110.json'                 =  @('1110.json',                 'application/json')
    '2052.json'                 =  @('2052.json',                 'application/json')
    '2057.json'                 =  @('2057.json',                 'application/json')
    '2070.json'                 =  @('2070.json',                 'application/json')
    '2074.json'                 =  @('2074.json',                 'application/json')
    '3076.json'                 =  @('3076.json',                 'application/json')
    '3081.json'                 =  @('3081.json',                 'application/json')
    '3082.json'                 =  @('3082.json',                 'application/json')
    '3084.json'                 =  @('3084.json',                 'application/json')
    '3098.json'                 =  @('3098.json',                 'application/json')
    '4105.json'                 =  @('4105.json',                 'application/json')
}

function Install-PowershellXrmTools() {
    $xrmPowershellModuleName = "Microsoft.Xrm.Data.PowerShell"
    if (!(Get-Module -ListAvailable $xrmPowershellModuleName)) {
        Write-Information "The module '$xrmPowershellModuleName is not installed. Start installing $xrmPowershellModuleName"
        Install-Module $xrmPowershellModuleName -Scope CurrentUser
    }

    Import-Module $xrmPowershellModuleName;
}

function Build-App()
{
    Push-Location $websitePath

    Invoke-Expression -Command "npm install"
    Invoke-Expression -Command "ng build --prod --output-hashing none --configuration portals-hosted"

    Pop-Location

    # verify success of operation
    if(-not (Test-Path -Path $appOutputPath)){
        throw [System.IO.DirectoryNotFoundException] "The output directory ($appOutputPath) was not generated. The reason for that is most probably that the 'ng build' command failed."
    }
}

function Rename-OutputFiles()
{
    Push-Location $appOutputPath

    Get-ChildItem *.js | Rename-Item -NewName { $_.name -Replace '\.js$','.es' }

    Pop-Location
}

function Connect-ToCrm()
{
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
    return Get-CrmConnection -InteractiveMode
}

function Deploy-OutputFiles([Microsoft.Xrm.Tooling.Connector.CrmServiceClient]$conn)
{
    $filesToUpdate = If ($inputFiles.Length -eq 0) {$files.Keys} Else {$inputFiles}

    ForEach($fileName IN $filesToUpdate)
    {
        if ($files.containsKey($fileName)){
            Deploy-OutputFile $conn $fileName $files[$fileName][0] $files[$fileName][1]
        }
        else {
            $warning = ("The file {0} is not included in the demo event webiste. Please review list of available files in script."  -f $fileName)
            $warning | Write-Warning
        }
    }

    echo 'Updated all files'
}

function Deploy-OutputFile(
    [Microsoft.Xrm.Tooling.Connector.CrmServiceClient]$conn,
    [string]$fileName,
    [string]$webFileName,
    [string]$mimeType
    )
{
    echo ('Updating file {0}' -f $fileName)
    $webFiles = Get-CrmRecords -conn $conn -EntityLogicalName adx_webfile -FilterAttribute adx_name -Op eq -Value $webFileName -Fields adx_name,adx_partialurl -TopCount 1
    if ($webFiles.Count -gt 0)
    {
        $webFile = $webFiles.CrmRecords[0]
        echo 'Updating webfile:'
        echo $webFile.adx_name

        Delete-AnnotationsForWebFile $conn $webFile
        $fileContent = Read-FileContentAsBase64 $fileName
        Add-FileAnnotationToCrmRecord $conn $webFile $fileName $mimeType $fileContent
    }
    else
    {
        echo ('Your installation is missing the web file "{0}", which is used for localization. If you need to support the language indicated by this code, then please download and apply the latest version of the standard event website (this will overwrite any customizations you may have made to the site). For instructions, see https://go.microsoft.com/fwlink/p/?linkid=210480' -f $fileName)
    }

    echo ('Updated file {0}' -f $fileName)
    echo ''
}

function Delete-AnnotationsForWebFile([Microsoft.Xrm.Tooling.Connector.CrmServiceClient]$conn, [PSObject]$webFile)
{
    $annotations = Get-CrmRecords -conn $conn -EntityLogicalName annotation -FilterAttribute objectid -Op eq -Value $webFile.adx_webfileid -Fields filename,filesize,mimetype
    echo ('Deleting annotations for the webfile, found {0} annotations' -f $annotations.Count)

    ForEach ($annotation IN $annotations.CrmRecords)
    {
        Remove-CrmRecord -conn $conn -CrmRecord $annotation
    }
}

function Read-FileContentAsBase64([string]$fileName)
{
    $filePath = Join-Path $appOutputPath $fileName
    return [Convert]::ToBase64String([IO.File]::ReadAllBytes($filePath))
}

function Add-FileAnnotationToCrmRecord(
        [Microsoft.Xrm.Tooling.Connector.CrmServiceClient]$conn,
        [PSObject]$crmRecord,
        [string]$fileName,
        [string]$mimeType,
        [string]$fileContent
    )
{
    $fileNameField = Create-StringField $fileName
    $mimeTypeField = Create-StringField $mimeType
    $fileContentField = Create-StringField $fileContent

    $newFields = New-Object 'System.Collections.Generic.Dictionary[[String], [Microsoft.Xrm.Tooling.Connector.CrmDataTypeWrapper]]'
    $newfields.Add("filename", $fileNameField)
    $newfields.Add("mimetype", $mimeTypeField)
    $newfields.Add("documentbody", $fileContentField)

    $entityLogicalName = $CrmRecord.logicalname
    $entityId = $CrmRecord.($EntityLogicalName + "id")

    try
    {
        $result = $conn.CreateAnnotation($entityLogicalName, $entityId, $newFields, [Guid]::Empty)
		if($result -eq $null)
        {
            throw $conn.LastCrmException
        }
    }
    catch
    {
        throw $conn.LastCrmException
    }
}

function Create-StringField([string]$value)
{
    $stringField = New-Object -TypeName 'Microsoft.Xrm.Tooling.Connector.CrmDataTypeWrapper'
    $stringField.Type = [Microsoft.Xrm.Tooling.Connector.CrmFieldType]::String
    $stringField.Value = $value

    return $stringField
}

Write-Host "Importing required modules .."
Install-PowershellXrmTools

Write-Host "Building the angular app..."
Build-App

Write-Host "Renaming output js files..."
Rename-OutputFiles

Write-Host "Connecting to CRM..."
$conn = Connect-ToCrm

Write-Host "Deploying output files to CRM instance"
Deploy-OutputFiles $conn

