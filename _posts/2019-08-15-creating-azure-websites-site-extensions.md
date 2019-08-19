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
<h4>

Who is this for

</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p> Site Extensions for anyone who  is trying to extend Azure Web apps capabilities, automate tasks (renew certificates, Minify Resources), add Diagnostic and Monitoring to their Azure Web apps </p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>  When Should I create a new Site Extension</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Before create a new site extension, there are already a wide range of extensions available and you can see them from your the azure portal or Kudu's extension page. You can just install and use them (Click your web app in azure portal and select extension on menu or Go Kudu and click Extension button on the right top corner), <br><a href="https://www.siteextensions.net/packages">https://www.siteextensions.net/packages</a> is outdated.<br><em>As those Extension haven't been validated on their behaviors (Extensions uses Nuget Servers as a repository and , you are taking risk on installing them to your environment as they may have malicious can access everything your web app can access.</em></p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"ids":[457,459]} -->
<ul class="wp-block-gallery columns-2 is-cropped"><li class="blocks-gallery-item"><figure><img src="/wp-content/uploads/2019/08/Site-Extensions-img-1.jpg" alt="" data-id="457" class="wp-image-457"/></figure></li><li class="blocks-gallery-item"><figure><img src="/wp-content/uploads/2019/08/Site-Extensions-img-2.jpg" alt="" data-id="459" data-link="https://mmercan.azurewebsites.net/2019/08/15/creating-azure-websites-site-extensions/site-extensions-img-2/" class="wp-image-459"/></figure></li></ul>
<!-- /wp:gallery -->

<!-- wp:paragraph -->
<p> </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Where Can I find the existed ones</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Who<br> What<br> When<br> Where<br> Why<br> How</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>

If you ever use Kudu on Azure web apps, you already use site extensions. Site extensions are web apps with a metadata file for registration, if you can deploy your code as a web app to azure you can deploy as an extension too.

</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p></p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>. can help us to automate, monitor or diagnose azure web apps.<br>Site Extensions are </p>
<!-- /wp:paragraph -->