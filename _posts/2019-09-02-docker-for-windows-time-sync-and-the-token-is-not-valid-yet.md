---
ID: 569
post_title: 'Docker for Windows Time Sync and &#8220;The token is not valid yet&#8221;'
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  https://mmercan.azurewebsites.net/2019/09/02/docker-for-windows-time-sync-and-the-token-is-not-valid-yet/
published: true
post_date: 2019-09-02 10:51:18
---
<!-- wp:paragraph -->
<p>Last night I spent a few hours trying to figure out what is wrong with my JWT token as I was getting <br>401 Error when I try to access my Apis when I run them locally in Docker for Windows <br>when I click the response header I saw <br><strong><em> WWW-Authenticate  : Bearer error="invalid_token", error_description="The token is not valid yet" </em></strong><br>I got in to full diagnose mode to understand what is going on, <br>I start running Postman requests, <br>app runs fine in AKS with the same JWT token,<br>app runs fine when I run it locally on my machine (not in docker just dotnet run on my loptop) with the same JWT</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":575} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/docker-invalid-token-2-1-1024x324.jpg" alt="" class="wp-image-575"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p><strong><em>The token is not valid yet</em></strong>, I had experience something like this before on my Ops days when date-time between PCs were out of whack. I added a method to a controller to justify my suspicion </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">        [Route("datenow")]
        public string DateNow()
        {
            return DateTime.Now.ToLongDateString() + " " + DateTime.Now.ToLongTimeString();
        }</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>and got back  "Thursday, 29 August 2019 11:08:24" <br>When for  Linux containers, docker for Windows runs a Virtual Machine to supply the Linux (you can also run Windows Containers config and run Linux images with as windows subsystem too)  </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>in my case date time sync is not working. I open Hyper-V Manager<br>Select <strong>DockerDesktopVM</strong> (in old system name was MobyLinuxVM) right Click and Select <strong>Settings</strong><br>click <strong>Integration Services</strong> from left menu, if <strong>Time synchronization </strong>not checked, check it and Click Apply and OK,<br>if it is Checked, first unchecked <strong>Time synchronization</strong>  Click Apply, Check again  <strong>Time synchronization</strong>  Apply Again and Click OK.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":577} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/docker-invalid-token-3-1024x758.jpg" alt="" class="wp-image-577"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>when I run the time method again  <strong>"Monday, 02 September 2019 11:20:22" </strong>I got the right time and authentication start working again.</p>
<!-- /wp:paragraph -->