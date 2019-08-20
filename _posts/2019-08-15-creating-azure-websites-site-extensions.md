---
ID: 392
post_title: Creating Azure WebSites Site Extensions
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  http://mmercan.azurewebsites.net/2019/08/15/creating-azure-websites-site-extensions/
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

<!-- wp:heading {"level":4} -->
<h4>  How to Create a new Site Extensions </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Firstly I am using  ASP.NET Core  2.2 but you can write your extension with ASP.NET, ASP.NET Core, Java, Ruby, Node.js, PHP, or Python. <br><br>I already Created a Github Repo you can clone from <a href="https://github.com/mmercan/Creating-Azure-WebSites-Site-Extensions">https://github.com/mmercan/Creating-Azure-WebSites-Site-Extensions</a> <br>if you want to follow along  run <a href="https://github.com/mmercan/Creating-Azure-WebSites-Site-Extensions/blob/master/createWebApp.ps1">https://github.com/mmercan/Creating-Azure-WebSites-Site-Extensions/blob/master/createWebApp.ps1</a> in the main folder you want to create your project</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Create applicationHost.xdt file in the main folder and copy the XML below.<br>Path I want to access to the extension is <strong>/healthcheck</strong>, it will be different for your extension. just change  <strong>/healthcheck</strong>  to path you desire in the save it.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"xml","makeURLsClickable":false} -->
<pre class="wp-block-syntaxhighlighter-code">&lt;?xml version="1.0"?>
&lt;configuration xmlns:xdt="http://schemas.microsoft.com/XML-Document-Transform">
  &lt;system.applicationHost>
    &lt;sites>
      &lt;site name="%XDT_SCMSITENAME%" xdt:Locator="Match(name)">
        &lt;application path="/healthcheck" xdt:Locator="Match(path)" xdt:Transform="Remove" />
        &lt;application path="/healthcheck" preloadEnabled="%XDT_PRELOADENABLED%" xdt:Transform="Insert">
          &lt;virtualDirectory path="/" physicalPath="%XDT_EXTENSIONPATH%" />
        &lt;/application>
      &lt;/site>
    &lt;/sites>
  &lt;/system.applicationHost>
&lt;/configuration></pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>  Create HealthCheck.nuspec  file in the main folder and copy the XML below.  <br>if you ever worked with nuspec file this is just a regular Nuget  package metadata except <br><strong> &lt;packageType name="AzureSiteExtension" /&gt;</strong> which defined this package as an AzureSiteExtension<br>if you want to more about  package metadata  <a href="https://docs.microsoft.com/en-us/nuget/reference/nuspec">https://docs.microsoft.com/en-us/nuget/reference/nuspec</a> </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"xml","makeURLsClickable":false} -->
<pre class="wp-block-syntaxhighlighter-code">&lt;?xml version="1.0"?>
&lt;package >
  &lt;metadata>
    &lt;id>healthvheckerv2&lt;/id>
    &lt;title>Health Checker V2&lt;/title>
    &lt;version>1.0.1&lt;/version>
    &lt;authors>Matt Mercan&lt;/authors>
    &lt;licenseUrl>http://opensource.org/licenses/Apache-2.0&lt;/licenseUrl>
    &lt;projectUrl>https://github.com/mmercan/Creating-Azure-WebSites-Site-Extensions&lt;/projectUrl>
    &lt;requireLicenseAcceptance>false&lt;/requireLicenseAcceptance>
    &lt;description>A tool to check the application health&lt;/description>
    &lt;iconUrl>https://raw.githubusercontent.com/projectkudu/AzureSiteReplicator/master/AzureSiteReplicator/Content/WebsiteReplicator50x50.png&lt;/iconUrl>
    &lt;tags>AzureSiteExtension&lt;/tags>
    &lt;packageTypes>
      &lt;packageType name="AzureSiteExtension" />
    &lt;/packageTypes>
  &lt;/metadata>
  &lt;files>
    &lt;file src="artifacts\**\*.*" target="content" />
  &lt;/files>
&lt;/package></pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p> Create publish.ps1 file in the main folder and copy the script below. <br>Publish script simply publish the web app to artifacts folder copies the  applicationHost.xdt file to  artifacts folder too. it will create a nuget package from artifacts folder in the root folder and push it to the nuget feed.<br>when you open the azure portal and check the extension on your azure web app you can see the extension is there now.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"powershell"} -->
<pre class="wp-block-syntaxhighlighter-code">$aspnetfolderPath = "extension\HealthCheck"
$scriptpath = $MyInvocation.MyCommand.Path 
$dir = Split-Path $scriptpath 

$aspnetfolder = $dir + "\" + $aspnetfolderPath
$aspnetfolder

Set-Location -Path $aspnetfolder
dotnet publish --output ../../artifacts/ -f netcoreapp2.2 -c Release
Copy-Item "$dir/applicationHost.xdt" ../../artifacts/

Set-Location -Path $dir
./nuget pack -NoPackageAnalysis
$nupkgfilename = @(Get-Childitem -path ./* -Include health* -exclude *.nuspec)[0].Name
"file found : $nupkgfilename"

dotnet nuget push $nupkgfilename -k [Your_Nuget_Key] -s https://api.nuget.org/v3/index.json

Move-Item health*.nupkg ./outputs -Force
Set-Location -Path $dir</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:image {"id":484} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Site-Extensions-img-4.jpg" alt="" class="wp-image-484"/></figure>
<!-- /wp:image -->

<!-- wp:heading {"level":4} -->
<h4>What Can we do with the Site Extensions</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>What we deploy is just an empty mvc application.<br>We can use Controllers to interact with users or We can use IHostedService for Background tasks or  Scheduled Tasks</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>  How to Host it anywhere other than Nuget feeds </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>in some cases you don't want to  clutter the nuget feed and seperate our extensions from nuget feeds.<br>just replace your dotnet nuget push lane with <br> <strong>dotnet nuget push $nupkgfilename -k [your_myget_key] -s https://www.myget.org/F/[your_user_name]/api/v3/index.json </strong><br> <br><code>SCM_SITEEXTENSIONS_FEED_URL=</code> https://www.myget.org/F/[your_user_name]/api/v3/index.json  <br></p>
<!-- /wp:paragraph -->