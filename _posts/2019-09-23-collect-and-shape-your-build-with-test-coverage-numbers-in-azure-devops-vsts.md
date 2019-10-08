---
ID: 699
post_title: >
  Collect and Shape your Build with Test
  Coverage numbers in Azure DevOps (VSTS)
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  http://mmercan.azurewebsites.net/2019/09/23/collect-and-shape-your-build-with-test-coverage-numbers-in-azure-devops-vsts/
published: true
post_date: 2019-09-23 00:51:01
---
<!-- wp:paragraph -->
<p>I have many builds, and not all use the same tasks (tools) to run the tests. I will try to cover collecting code coverage numbers inside of a build, and failing the build if percentages are lower than expected </p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>dotnet test /p:CollectCoverage=true</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>The usage of dotnet cli is skyrocketed in our pipelines. it is easy and can bu run everywhere including docker images.<br>You can simply add <a rel="noreferrer noopener" aria-label="dotnet-reportgenerator (opens in a new tab)" href="https://danielpalme.github.io/ReportGenerator/" target="_blank">dotnet-reportgenerator</a> to summarize the result and read the  "Line coverage" <br>string. The line should be like  <strong>Line coverage: 68.1%</strong>, just extract the number and compare it with the expected percentage. If it is lower Write-Error, VSTS will catch this as an error and fails the build, otherwise Write-Host to let people know the result. (Bash file is not the best and if you have a better version please share in a comment)<br>this technique can be used anywhere you can add PowerShell or Bash task to your VSTS build and use this or simply add this to your docker image build </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>PowerShell</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"powershell"} -->
<pre class="wp-block-syntaxhighlighter-code">$expectedPercentage = 68.2
dotnet test ./HealthChecks/HealthChecks.sln  /p:CollectCoverage=true /p:CoverletOutput=/TestResults/ /p:MergeWith=/TestResults/coverage.json --logger=trx -r /TestResults/
dotnet test ./Sentinel.Empty.Tests/Sentinel.Empty.Tests.sln /p:CollectCoverage=true /p:MergeWith="/TestResults/coverage.json" /p:CoverletOutputFormat="opencover" /p:CoverletOutput=/TestResults/

dotnet tool install --global dotnet-reportgenerator-globaltool
reportgenerator "-reports:/TestResults/coverage.opencover.xml" "-targetdir:/TestResults/coveragereport" -reporttypes:"HTMLSummary;TextSummary" -assemblyfilters:"+Sentinel.*;+Mercan.*"
$fileName = "/TestResults/coveragereport/Summary.txt"

$fileExist = Test-Path $fileName -PathType Leaf
If ($fileExist -eq $True) { Write-Host "File Found" }
else {
    Write-Error "Coverage file not Found $fileName"
}
(Get-Content $fileName) | 
Foreach-Object {  
    if ($_ -match " Line coverage") {
        $array = $_.Split(':')
        if ($array.count -eq 2) {
            [decimal]$currentPercentage = $array[1].Trim().Trim('%')
            if ($currentPercentage -lt $expectedPercentage) {
                Write-Error "Coverage failed Expected : $expectedPercentage% Current : $currentPercentage%"
            }
            else {
                Write-Host "Coverage succeeded Expected : $expectedPercentage% Current : $currentPercentage%"
            }
        }
        else {
            Write-Host "Coverage file Found and read but Line coverage could not retained"
        }
    }
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>Bash</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"bash"} -->
<pre class="wp-block-syntaxhighlighter-code">expectedPercentage=32.8
dotnet tool install --global dotnet-reportgenerator-globaltool
dotnet test ./HealthChecks/HealthChecks.sln  /p:CollectCoverage=true /p:CoverletOutput=/TestResults/ /p:MergeWith=/TestResults/coverage.json --logger=trx -r /TestResults/
dotnet test ./Sentinel.Empty.Tests/Sentinel.Empty.Tests.sln /p:CollectCoverage=true /p:MergeWith="/TestResults/coverage.json" /p:CoverletOutputFormat="opencover" /p:CoverletOutput=/TestResults/coverage.opencover.xml
reportgenerator "-reports:/TestResults/coverage.opencover.xml" "-targetdir:/TestResults/coveragereport" -reporttypes:"HTMLSummary;TextSummary" -assemblyfilters:"+Sentinel.*;+Mercan.*"

while read line; do 
if [[ $line == *"Line coverage"* ]]; then
percent=${line##*:}
number=${percent::-1}
echo $number
    if (( $(echo "$number $expectedPercentage" | awk '{print ($1 > $2)}') )); then
        echo "In expected range Successed Actual Percentage $number Expected Percentage $expectedPercentage"
    else
    1>&amp;2 echo "Not in expected range Failed Actual Percentage $number Expected Percentage $expectedPercentage"
    fi
fi
done &lt; "/TestResults/coveragereport/Summary.txt"</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:image {"id":713} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/Collect-and-Shape-your-Build-with-Test-Coverage-numbers-in-VSTS-1.jpg" alt="" class="wp-image-713"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4> Azure DevOps (VSTS)  "VSTest" Task </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>If you are using VSTS tasks to build, probably you will have VsTest Task on your pipeline (as it is the default option when you select  ASP.NET Template)<br>VsTask is capable of getting the  Code coverage, but you need to check the option  Code coverage enabled from the task options.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":724} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/Collect-and-Shape-your-Build-with-Test-Coverage-numbers-in-VSTS-4.jpg" alt="" class="wp-image-724"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>if Code coverage is enabled and run your build, you should have a tab for  Code coverage in your build result page you can download the coverage file open in visual studio and see what lines of your code is covered.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":725,"width":467,"height":161} -->
<figure class="wp-block-image is-resized"><img src="/wp-content/uploads/2019/09/Collect-and-Shape-your-Build-with-Test-Coverage-numbers-in-VSTS-5.jpg" alt="" class="wp-image-725" width="467" height="161"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p> Now we need to use VSTS Rest API to get Code coverage numbers and decide the success or the failure of the build. If you are still using tasks on your build, you need to enable <strong> Allow scripts to access the OAuth token</strong> in the agent Job level. If you are using YAML base builds token access is allowed by default. We need to access the token to use in VSTS Rest API for Authentication.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":721} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/Collect-and-Shape-your-Build-with-Test-Coverage-numbers-in-VSTS-3.jpg" alt="" class="wp-image-721"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Before getting into the Script you might want to check the VSTS  <strong>_apis/test/codecoverage</strong> API from <a href="https://docs.microsoft.com/en-us/rest/api/azure/devops/test/code%20coverage/get%20build%20code%20coverage?view=azure-devops-rest-5.1">https://docs.microsoft.com/en-us/rest/api/azure/devops/test/code%20coverage/get%20build%20code%20coverage?view=azure-devops-rest-5.1</a><br>This is the PowerShell script uses an API to get code coverage data for a build. The result we get is a JSON.  modules array contains projects and their <strong>linesNotCovered</strong> and linesCovered integer numbers.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"jscript","lineNumbers":false,"highlightLines":"13,21,21"} -->
<pre class="wp-block-syntaxhighlighter-code">{
  "value": [
    {
      "configuration": {
        "id": 51,
        "flavor": "Debug",
        "platform": "Any CPU",
        "uri": "vstfs:///Build/Build/363",
        "project": {}
      },
      "state": "0",
      "lastError": "",
      "modules": [
        {
          "blockCount": 2,
          "blockData": "Aw==",
          "name": "fabrikamunittests.dll",
          "signature": "c27c5315-b4ec-3748-9751-2a20280c37d5",
          "signatureAge": 1,
          "statistics": {
            "blocksCovered": 2,
            "blocksNotCovered: 4,
            "linesNotCovered":2,
            "linesCovered": 4
          },
          "functions": []
        }
      ],
      "codeCoverageFileUrl": "https://dev.azure.com/fabrikam/Fabrikam-Fiber-TFVC/_api/_build/ItemContent?buildUri=vstfs%3A%2F%2F%2FBuild%2FBuild%2F363&amp;path=%2FBuildCoverage%2FFabrikamUnitTests_20150609.2.Debug.Any%20CPU.51.coverage"
    }
  ],
  "count": 1
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>In Powershell we will request the JSON from VSTS if we can get the result (there is always a possibility to not getting the coverage as there might be nothing to test or coverage check not selected) script will loop through all modules (projects) and add their covered and not covered blocks and calculate the overall coverage if it is less the expected Percentage it will Write-Error and  VSTS task will fail, otherwise it will report the code coverage numbers with Write-Host</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"powershell"} -->
<pre class="wp-block-syntaxhighlighter-code">      $expectedPercent=80
      $coveredBlocks=0
      $skippedBlocks=0
      $totalBlocks=0
      $codeCoveragePercent=0 

      write-host "Build id is $env:BUILD_BUILDID"

      $url = "$($env:SYSTEM_TEAMFOUNDATIONCOLLECTIONURI)$env:SYSTEM_TEAMPROJECTID/_apis/test/codeCoverage?buildId=$($env:BUILD_BUILDID)&amp;flags=1&amp;api-version=5.1-preview.1"
      Write-Host "URL: $url"
      $pipeline = Invoke-RestMethod -Uri $url -Headers @{
        Authorization = "Bearer $env:SYSTEM_ACCESSTOKEN"
      }
      Write-Host "Pipeline = $($pipeline.value | select modules | ConvertTo-Json -Depth 100)"
      
      $Responsemodules = $pipeline.value | select modules
      foreach($module in $Responsemodules.modules)
      {
        $script:coveredBlocks +=  $module.statistics[0].blocksCovered
        $script:skippedBlocks +=  $module.statistics[0].blocksNotCovered
        
        $tempname = $module.name
        $tempTotal =$module.statistics[0].blocksCovered + $module.statistics[0].blocksNotCovered
        $tempCodeCoverage = ($module.statistics[0].blocksCovered * 100.0) / $tempTotal
        write-host "$tempname   % $tempCodeCoverage"
      }

      write-host "======================================================="
      $script:totalBlocks = $script:coveredBlocks + $script:skippedBlocks;
      $codeCoveragePercent = ($script:coveredBlocks * 100.0) / $totalBlocks

      write-host "overall  >>  % $codeCoveragePercent"

      if($codeCoveragePercent -le $expectedPercent){
        Write-Error  "coverage less than %$expectedPercent"
      }</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:heading {"level":4} -->
<h4>SonarQube Quality Gate</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>On SonarQube we can simply access the /api/qualitygates/project_status API with project key and get the result of the quality gate of your project but as analysis is a background task and can take a while, when you hit the API you may get the previous result and you don't want to have that.<br>SonarQube scanners generally create a <strong>report-task.txt</strong> file. This file contains the <strong>ceTaskUrl</strong> which has the field for <strong>anaysisId </strong>to access our unique quality gate result.<br>dotnet core SonarScanner store it in <strong>out\.sonar</strong> folder on the current directory you run the SonarScanner  <br>npm sonar-scanner store it in<strong> .scannerwork</strong> folder  on the current directory you run the sonar-scanner </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>

report-task.txt File

</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"lineNumbers":false,"highlightLines":"7"} -->
<pre class="wp-block-syntaxhighlighter-code">organization=mmercan-github
projectKey=Sentinel.Api.HealthMonitoring
serverUrl=https://sonarcloud.io
serverVersion=8.0.0.884
dashboardUrl=https://sonarcloud.io/dashboard?id=Sentinel.Api.HealthMonitoring
ceTaskId=AW2LcrjNeWHkXTI8--hG
ceTaskUrl=https://sonarcloud.io/api/ce/task?id=AW2LcrjNeWHkXTI8--hG</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>PowerShell simply tries to access the <strong>report-task.txt</strong> file read ceTaskUrl and make a WebRequest to the URL with Authorization header. The result of this request is a JSON with the field name <strong>analysisId</strong>.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"jscript","lineNumbers":false,"highlightLines":"9"} -->
<pre class="wp-block-syntaxhighlighter-code">{ 
   "task":{ 
      "id":"AW2LcrjNeWHkXVU8--hG",
      "type":"REPORT",
      "componentId":"AWyNtuseubB2nFeSSwHh",
      "componentKey":"Sentinel.UI.HealthMonitoring",
      "componentName":"Sentinel.UI.HealthMonitoring",
      "componentQualifier":"TRK",
      "analysisId":"AW2Lcrqhc8gQ3aLgr-Md",
      "status":"SUCCESS",
      "submittedAt":"2019-10-02T09:50:14+0200",
      "submitterLogin":"mmercan@github",
      "startedAt":"2019-10-02T09:50:14+0200",
      "executedAt":"2019-10-02T09:50:19+0200",
      "executionTimeMs":4350,
      "logs":false,
      "hasScannerContext":true,
      "organization":"mmercan-github",
      "warningCount":0,
      "warnings":[ ]
      }
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p><br>We make a second WebRequest to<strong> /api/qualitygates/project_status?analysisId=</strong>$Response.task.analysisId with adding the <strong>analysisId </strong>from the first WebRequest<br>Second  WebRequest also result with a JSON response, if projectStatus.status is "OK" or "NONE" we accept this as a success any other result will cause a double error Write-Error and Write-Output "##vso[task.complete result=Failed;]" this is overkill if you are using the VSTS PowerShell task as it translates Write-Error  to a task fail too.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"powershell","lineNumbers":false,"makeURLsClickable":false} -->
<pre class="wp-block-syntaxhighlighter-code"># Based on: https://github.com/michaelcostabr/SonarQubeBuildBreaker/blob/master/SonarQubeBuildBreaker.ps1
Param (
    [String]
    [Parameter(Mandatory = $true)]
    $SonarToken,

    [String]
    [Parameter(Mandatory = $true)]
    $DotSonarQubeFolder,

    [String]
    [Parameter(Mandatory = $false)]
    $backupServerUrl,

    [String]
    [Parameter(Mandatory = $false)]
    $backupProjectkey

)
$TokenAsBytes = [System.Text.Encoding]::UTF8.GetBytes(("$SonarToken" + ":"))
$Base64Token = [System.Convert]::ToBase64String($TokenAsBytes)
$AuthorizationHeaderValue = [String]::Format("Basic {0}", $Base64Token)
$Headers = @{ 
    Authorization = $AuthorizationHeaderValue; 
    AcceptType    = "application/json"  
}
function GetStatus {
    param (
        [Parameter(Mandatory = $true)] $ServerUrl,
        [Parameter(mandatory = $false)] $analysisId,
        [Parameter(mandatory = $false)] $projectkey
    )
    if ($analysisId) {
        $AnalysisUrl = "{0}/api/qualitygates/project_status?analysisId={1}" -f $ServerUrl, $analysisId #$Response.task.analysisId
    }
    else {
        $AnalysisUrl = "{0}/api/qualitygates/project_status?projectKey={1}" -f $ServerUrl, $projectkey #$Response.task.analysisId
    }
    Write-Host "AnalysisUrl : $AnalysisUrl"
    $ResponseAnalysis = Invoke-WebRequest -Uri $AnalysisUrl -Headers $Headers -UseBasicParsing | ConvertFrom-Json

    Write-Host "ResponseAnalysis"
    $ResponseAnalysis

    Write-Host "ResponseAnalysis Status" $ResponseAnalysis.projectStatus.status
    #return $ResponseAnalysis
    if (($ResponseAnalysis.projectStatus.status -ne 'OK') -and ($ResponseAnalysis.projectStatus.status -ne 'NONE')) {
        $ErrorMsg = "##vso[task.LogIssue type=error;] Quality gate FAILED. Please check it here: {0}/dashboard?id={1}" -f $ServerUrl, $ProjectKey
        Write-Output $ErrorMsg
        Write-Output "##vso[task.complete result=Failed;]"
        Write-Error $ErrorMsg
    }
}

$SonarTaskFile = "$DotSonarQubeFolder\out\.sonar\report-task.txt"

if ([System.IO.File]::Exists($SonarTaskFile)) {

    $ProjectKey = Get-Content -Path $SonarTaskFile | Where-Object { $_ -Match 'projectKey=' }
    $ProjectKey = $ProjectKey -replace "projectKey=" -replace ""
    Write-Host "ProjectKey: $ProjectKey"

    $ServerUrl = Get-Content -Path $SonarTaskFile | Where-Object { $_ -Match 'serverUrl=' }
    $ServerUrl = $ServerUrl.Split('=')[1]
    Write-Host "ServerUrl : $ServerUrl "

    $CeTaskUrl = Get-Content -Path $SonarTaskFile | Where-Object { $_ -Match 'ceTaskUrl=' }
    $CeTaskUrl = $CeTaskUrl -replace "ceTaskUrl=" -replace ""
    Write-Host "CeTaskUrl : $CeTaskUrl"

    $Response = Invoke-WebRequest -Uri $CeTaskUrl -Headers $Headers -UseBasicParsing | ConvertFrom-Json
    Write-Host "analysisId : " $Response.task.analysisId

    Start-Sleep -s 15
    GetStatus -ServerUrl $ServerUrl -analysisId $Response.task.analysisId    
}
else {
    GetStatus -ServerUrl $backupServerUrl -projectkey $backupProjectkey 

}</pre>
<!-- /wp:syntaxhighlighter/code -->