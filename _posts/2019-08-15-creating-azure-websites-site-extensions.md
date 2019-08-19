---
ID: 392
post_title: Creating Azure WebSites Site Extensions
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  https://mmercan.azurewebsites.net/2019/08/15/creating-azure-websites-site-extensions/
published: true
post_date: 2019-08-15 06:38:46
---
<!-- wp:heading {"level":4} -->
<h4>

What is Site Extensions

</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Site extensions are web apps with a metadata file. Hosts with your Azure web apps and can be written with any language Azure web apps support. Site extensions share the same resources with your Azure Web apps, can access to Web Apps file system, Certificate Store, Environment variables etc..  </p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4> Who is this for and  Why Should I use Site Extensions </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p> Site Extensions for anyone who  is trying to extend Azure Web apps capabilities, automate tasks (renew certificates, Minify Resources), add Diagnostic and Monitoring to their Azure Web apps <br><br>Personally I use <br>Azure Let's Encrypt to Automate SSL cert <br>AppDynamics.WindowsAzure.SiteExtension&nbsp; to connect to AppDynamics <br>and 3 private Site Extensions to<br>Combine all Environment variables per Web App to see what settings are applied.<br>Log Aggrigator <br>Running Health-checks on demands and in a scheduled intervals and Showing them in a dashboard</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":462} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Site-Extensions-img-3-1024x344.jpg" alt="" class="wp-image-462"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4>When Should I create a new Site Extension</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Before creating a new site extension, there are already a wide range of extensions available and you can check them from your the azure portal or Kudu's extension page. You can just install and use them (Click your web app in azure portal and select extension on menu or Go Kudu and click Extension button on the right top corner), <br>you may see link to <a href="https://www.siteextensions.net/packages">https://www.siteextensions.net/packages</a>  but last year Microsoft changed the site extension repository and merged in to Nuget and the link is outdated.<br><br><em>As those Extension haven't been validated on their behaviors (Extensions uses Nuget Servers as a repository and , you are taking risk on installing them to your environment as they may have malicious can access everything your web app can access.</em></p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"ids":[457,459]} -->
<ul class="wp-block-gallery columns-2 is-cropped"><li class="blocks-gallery-item"><figure><img src="/wp-content/uploads/2019/08/Site-Extensions-img-1.jpg" alt="" data-id="457" class="wp-image-457"/></figure></li><li class="blocks-gallery-item"><figure><img src="/wp-content/uploads/2019/08/Site-Extensions-img-2.jpg" alt="" data-id="459" data-link="https://mmercan.azurewebsites.net/2019/08/15/creating-azure-websites-site-extensions/site-extensions-img-2/" class="wp-image-459"/></figure></li></ul>
<!-- /wp:gallery -->

<!-- wp:paragraph -->
<p> </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p> How</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>  How to Create a new Site Extensions </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Firstly I am using  ASP.NET Core  2.2 but you can write your extension with ASP.NET, ASP.NET Core, Java, Ruby, Node.js, PHP, or Python. </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"powershell"} -->
<pre class="wp-block-syntaxhighlighter-code">$artifactsFolderName = "artifacts"
$extensionFolderName = "extension"
$outputsFolderName = "outputs"
$projectFolderName = "HealthCheck"
Write-Host "--------------------------------"
$scriptpath = $MyInvocation.MyCommand.Path 
$dir = Split-Path $scriptpath

$appFolder = Join-Path -Path $dir -ChildPath .\$extensionFolderName\$projectFolderName
$testFolder = Join-Path -Path $dir -ChildPath .\$extensionFolderName\$projectFolderName".Tests"
$artifactsFolder = Join-Path -Path $dir -ChildPath .\$artifactsFolderName
$outputsFolder = Join-Path -Path $dir -ChildPath .\$outputsFolderName

#Create Folder Structure 
new-item -type directory -path $appFolder -Force
new-item -type directory -path $testFolder -Force
new-item -type directory -path $artifactsFolder -Force
new-item -type directory -path $outputsFolder -Force

set-location -Path $appFolder
dotnet new mvc

set-location -Path $testFolder
dotnet new xunit

set-location -Path $dir
dotnet new sln
dotnet sln add $appFolder
dotnet sln add $testFolder</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:heading {"level":4} -->
<h4>  How to Host it anywhere other than Nuget feeds </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p><br><br><code>SCM_SITEEXTENSIONS_FEED_URL=https://www.nuget.org/api/v2/</code><br><br></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph -->