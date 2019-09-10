---
ID: 416
post_title: >
  .Net Core Unit Test and Code Coverage in
  Sonarqube
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  https://mmercan.azurewebsites.net/2019/08/15/net-core-unit-test-and-code-coverage-in-sonarqube/
published: true
post_date: 2019-08-15 06:42:13
---
<!-- wp:paragraph -->
<p>While I was working on my side project  <a href="https://github.com/mmercan/sentinel">Sentinel(https://github.com/mmercan/sentinel</a>)  I have several <br>Dotnet Core projects, I have separate docker images for testing and I used dotnet test as below.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"bash"} -->
<pre class="wp-block-syntaxhighlighter-code">RUN dotnet test 
./Sentinel.Api.HealthMonitoring/Sentinel.Api.HealthMonitoring.sln 
/p:CollectCoverage=true 
/p:CoverletOutputFormat=opencover /p:CoverletOutput=/TestResults/</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>They worked quite nicely and having no problem until there are more than one test projects.  When I run it with multiple test projects I could only see the latest test, test coverage. When I dig into it coverage.opencover.xml file in TestResults Folder overridden by each project and last test project coverage will be sent to SonarQube. this wasn't ideal.<br>When I search I find <strong>/p:MergeWith</strong> flag merge coverage of multiple projects Which could solve my problem has one problem it can only work with JSON  and SonarQube expects XML<br><br>My Solution was unconventional but it worked fine for me. <br>The first step, I run the test and merged all test results as JSON (I added logger and results-directory to collect more info to SonarQube)</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">RUN dotnet test 
./Sentinel.Api.HealthMonitoring/Sentinel.Api.HealthMonitoring.sln  
/p:CollectCoverage=true 
/p:CoverletOutput=/TestResults/ 
/p:MergeWith=/TestResults/coverage.json 
--logger=trx 
--results-directory /TestResults/</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>and I created a Folder named " Empty.Tests" and Create a test Project with no test in it, I use it to convert JSON coverage results to XML</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">RUN dotnet test 
./Sentinel.Empty.Tests/Sentinel.Empty.Tests.sln 
/p:CollectCoverage=true 
/p:MergeWith="/TestResults/coverage.json" 
/p:CoverletOutputFormat="opencover" 
/p:CoverletOutput=/TestResults/</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>This Merged JSON coverages and export them as XML in opencover format<br>here is the Full docker test file if you interested<br> <a href="https://github.com/mmercan/sentinel/blob/master/Sentinel.Api.HealthMonitoring/dockerfile-linux-test">https://github.com/mmercan/sentinel/blob/master/Sentinel.Api.HealthMonitoring/dockerfile-linux-test</a> <br>and SonarQube Result Page<br> <a href="https://sonarcloud.io/dashboard?id=Sentinel.Api.HealthMonitoring">https://sonarcloud.io/dashboard?id=Sentinel.Api.HealthMonitoring</a> <br> </p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":517} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/08/Net-Core-Unit-Test-and-Code-Coverage-in-Sonarqube-1-1024x681.jpg" alt="" class="wp-image-517"/></figure>
<!-- /wp:image -->