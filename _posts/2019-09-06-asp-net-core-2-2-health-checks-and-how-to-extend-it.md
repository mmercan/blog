---
ID: 606
post_title: >
  ASP.NET Core Health Checks and How to
  extend it.
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  https://mmercan.azurewebsites.net/2019/09/06/asp-net-core-2-2-health-checks-and-how-to-extend-it/
published: true
post_date: 2019-09-06 06:24:44
---
<!-- wp:paragraph -->
<p>10 Years ago I was working on Hospital Information Systems (HIS) with 1000s of clients and Applications dependencies are Oracle Database, and 2 Web Services Provided by Government, Laboratory Information System (LIS) has some serial port and USB connection requirements, and PACS some other but as long as Database is Up and Web Services are running we were gold.</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>Now running hundreds of web services (some Micro, some Macro) and each talking to other services (some are in the same data center and some are in the other side of the world), Databases, Queues, Logging tools, Analytics Tools, Distributed caches, Key-vaults, etc... On top of this, there are also internal issues to check, like having the right files on the file system, Not ceiling CPU and Memory, using the right Configuration - App Settings, making sure all dependencies in dependency injection can create an instance, etc..</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":615} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/ASP-NET-Core-Health-Checks-and-How-to-extend-it-1.png" alt="" class="wp-image-615"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>This can become an effort for a single app but when we put all the Micro-Services all together for all the environments (dev, test, sit, uat, perf, pre-prod prod, etc...), this easily becomes very hard question to answer "Is environment or API healthy" or if we know it is not, what is causing the problem. Providing the right answer to "It works on my machine" can be a bonus too. this example is for .Net Core 2.2 or Above if you are using an older version I put a note at the end of the Post</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4> How Health Check works in Asp.Net Core  </h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>"Microsoft.AspNetCore.Diagnostics.HealthChecks" Nuget package is the main Nuget package you need to add to your project before anything else.<br>After adding the Package and restoring your project, we need to add middleware and dependencies to startup.cs file.<br>services.AddHealthChecks() Adds dependencies required by Healthchecks middleware and returns  <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://github.com/aspnet/Extensions/blob/master/src/HealthChecks/HealthChecks/src/DependencyInjection/HealthChecksBuilder.cs" target="_blank">HealthChecksBuilder</a> which we use to chain our checks.<br><a rel="noreferrer noopener" href="https://github.com/aspnet/Extensions/blob/master/src/HealthChecks/HealthChecks/src/DependencyInjection/HealthChecksBuilder.cs" target="_blank">HealthChecksBuilder</a> have Add Method, which adds <a rel="noreferrer noopener" aria-label="HealthCheckRegistration  (opens in a new tab)" href="https://github.com/aspnet/Extensions/blob/master/src/HealthChecks/Abstractions/src/HealthCheckRegistration.cs" target="_blank">HealthCheckRegistration </a>to a List (using  <a rel="noreferrer noopener" href="https://github.com/aspnet/Extensions/blob/master/src/HealthChecks/HealthChecks/src/HealthCheckServiceOptions.cs" target="_blank">HealthCheckServiceOptions</a>). <br>There are several extension methods accepts different parameters to provide options to add HealthCheck</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddHealthChecks();
    // ...
}

public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    // ...
    app.UseHealthChecks("/Health/isAliveAndWell");
    // ...
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>Adding AddHealthChecks() and UseHealthChecks(URL) will be enough to start HealthCheck,<br>Let's start the Web App and hit the URL specified in UseHealthChecks (/Health/isAliveAndWell).<br>As there is nothing to check, we will get a Healthy message with 200 status code.</p>
<!-- /wp:paragraph -->

<!-- wp:image {"id":630} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/ASP-NET-Core-Health-checks-and-How-to-extend-it-2-1024x458.jpg" alt="" class="wp-image-630"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>Time to Add things to check.<br>There are several extension methods allow us to add health checks. Let's start simple with "AddCheck" Method, provide a unique name and Function to return HealthCheckResult and you have a check  (as below)</p>
<!-- /wp:paragraph -->

<!-- wp:list -->
<ul><li> If everything works as expected, you will get a Healthy message with 200 status code</li><li>If any check you added returns Unhealthy  you should get Unhealthy Message with 503 status code</li><li>If there is a server error on handling your health check request you should get status code 500 </li></ul>
<!-- /wp:list -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddHealthChecks()
    .AddCheck("client", () =>
    {
        using (var client = new HttpClient())
        {
            try
            {
                var responseTask = client.GetAsync("https://auth.myrcan.com");
                responseTask.Wait();
                responseTask.Result.EnsureSuccessStatusCode();
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy(ex.Message, ex);
            }
        }
        return HealthCheckResult.Healthy();
    });  
    // ...
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p> This technique solved our problem but creates a problem of a messy startup.cs file, next step moving the check to another class (as below) we are not changing much on the logic but just separating in its class and adding an extension method to  IHealthChecksBuilder for easy chaining.<br> (I added the URL to the name of the as name needed to be unique and I might want to use this check for multiple URLs)</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This technique solved our problem but creates a problem of a messy startup.cs file, next step moving the check to another class (as below) we are not changing much on the logic but just separating in its class and adding an extension method to  IHealthChecksBuilder for easy chaining.<br>
 (I added the URL to the name of the as name needed to be unique and I might want to use this check for multiple URLs)</p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>This technique solved our problem but creates a problem of a messy startup.cs file, next step moving the check to another class (as below) we are not changing much on the logic but just separating in its class and adding an extension method to  IHealthChecksBuilder for easy chaining.<br>
 (I added the URL to the name of the as name needed to be unique and I might want to use this check for multiple URLs)</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">//HttpGetCheck.cs
// ...
    public static partial class HealthCheckBuilderExtensions
    {
        public static IHealthChecksBuilder AddHttpGetCheck(this IHealthChecksBuilder builder, string url)
        {
            return builder.AddCheck($"DIHealthCheck {url}", new DIHealthCheck(url));
        }
    }
    public class HttpGetCheck: IHealthCheck
    {
        private string url;
        public DIHealthCheck(string url)
        {
            this.url= url;
        }

        public async Task&lt;HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
        {
            using (var client = new HttpClient())
            {
                try
                {
                    var response = await client.GetAsync(url);
                    response.EnsureSuccessStatusCode();
                }
                catch (Exception ex)
                {
                    return HealthCheckResult.Unhealthy(ex.Message, ex);
                }
            }
            return HealthCheckResult.Healthy();
        }
    }
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">public void ConfigureServices(IServiceCollection services)
{
    // ...
    services.AddHealthChecks()
    .AddHttpGetCheck("https://portal.myrcan.com/Health/IsAlive")
    .AddHttpGetCheck("https://product.myrcan.com/Health/IsAlive");
    // ...
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>a single line in Startup is much better and we can move this class to a library and share across projects now.<br>This is almost done except DI is a big part of our development practice and I don't want to create a new instance if I can use DI instead, I also want to add additional details to the Health Check Result using Data object <br>let's change HttpGetCheck.cs class to use dependency injection and add additional data.<br>AddTypeActivatedCheck has a bug with 2 params method on current version that's why I used 4 params version but keep params null.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">    //HttpGetCheck.cs
    // ...
    public static partial class HealthCheckBuilderExtensions
    {
        public static IHealthChecksBuilder AddHttpGetCheck(this IHealthChecksBuilder builder, string url)
        {
            return builder.AddTypeActivatedCheck&lt;HttpGetCheck>($"UrlGetCheck {url}", null, null, url);
        }
    }
    public class HttpGetCheck : IHealthCheck
    {
        private string url;
        private ILogger&lt;HttpGetCheck> logger;

        public HttpGetCheck(ILogger&lt;HttpGetCheck> logger, string url)
        {
            this.url = url;
            this.logger = logger;
            logger.LogCritical("HttpGetCheck Init");
        }

        public async Task&lt;HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
        {
            IDictionary&lt;string, Object> data = new Dictionary&lt;string, object>();
            using (var client = new HttpClient())
            {
                try
                {
                    var response = await client.GetAsync(url);
                    response.EnsureSuccessStatusCode();
                    logger.LogCritical("HttpGetCheck Healthy");
                }
                catch (Exception ex)
                {
                    logger.LogCritical("HttpGetCheck Unhealthy");
                    return HealthCheckResult.Unhealthy(ex.Message, ex);
                }
            }
             ReadOnlyDictionary&lt;string, Object> rodata = new ReadOnlyDictionary&lt;string, object>(data);
             return HealthCheckResult.Healthy($"{url} is Healthy", rodata);
        }
    }
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:image {"id":637} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/ASP-NET-Core-Health-checks-and-How-to-extend-it-3.jpg" alt="" class="wp-image-637"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>We can create more checks or use Nuget packages to add them  <a href="https://www.nuget.org/profiles/Xabaril">Xabaril</a>  has an extensive set of health check NuGet packages you can access them from  <a href="https://www.nuget.org/profiles/Xabaril">https://www.nuget.org/profiles/Xabaril</a> <br>you can also check the source code of them from <a href="https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks/tree/master/src">https://github.com/Xabaril/AspNetCore.Diagnostics.HealthChecks/tree/master/src</a> <br>I also have some of mine (I don't have NuGet packages for them yet tho)  <a href="https://github.com/mmercan/sentinel/tree/master/HealthChecks">https://github.com/mmercan/sentinel/tree/master/HealthChecks</a> </p>
<!-- /wp:paragraph -->

<!-- wp:paragraph -->
<p>generally seeing only Healthy or Unhealthy message won't be enough especially if you are checking a broad set of things you may want to see what is failing.UseHealthChecks have options to configure and one of them is  <strong>ResponseWriter </strong>which can be configured to produce more detailed outputs </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    // ...
    app.UseHealthChecks("/Health/isAliveAndWell")
    {
      ResponseWriter = WriteListResponse,
    });
    // ...
}

public static Task WriteListResponse(HttpContext httpContext, HealthReport result)
{
    httpContext.Response.ContentType = "application/json";
    var json = new JObject(
        new JProperty("status", result.Status.ToString()),
        new JProperty("duration", result.TotalDuration),
        new JProperty("results", new JArray(result.Entries.Select(pair =>
          new JObject(
               new JProperty("name", pair.Key.ToString()),
               new JProperty("status", pair.Value.Status.ToString()),
               new JProperty("description", pair.Value.Description),
               new JProperty("duration", pair.Value.Duration),
               new JProperty("type", pair.Value.Data.FirstOrDefault(p => p.Key == "type").Value),
               new JProperty("data", new JObject(pair.Value.Data.Select(p => new JProperty(p.Key, p.Value)))),
               new JProperty("exception", pair.Value.Exception?.Message)
         )
         ))));
    return httpContext.Response.WriteAsync(json.ToString(Newtonsoft.Json.Formatting.Indented));
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:image {"id":645} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/ASP-NET-Core-Health-checks-and-How-to-extend-it-4-1-1024x476.jpg" alt="" class="wp-image-645"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>we are almost done, rest is just optional things you can do to make it nicer.</p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>Add IsAlive Middleware to have a common URL between APIs to check their accessibilities </h4>
<!-- /wp:heading -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">public void Configure(IApplicationBuilder app, IHostingEnvironment env)
{
    // ...
    app.UseHealthChecks("/Health/isAliveAndWell")
    {
      ResponseWriter = WriteListResponse,
    });
    app.Map("/Health/IsAlive", (ap) =>
    {
        ap.Run(async context =>
        {
            context.Response.ContentType = "application/json";
            await context.Response.WriteAsync("{\"IsAlive\":true}");
        });
    });
    // ...
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:heading {"level":4} -->
<h4>Add Swagger Paths for IsAlive and IsAliveAndWell for API Management or AutoRest etc..</h4>
<!-- /wp:heading -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">            app.UseSwagger(e =>
            {
                e.PreSerializeFilters.Add((doc, req) =>
                {
                    doc.Definitions.Add("HealthReport", HealthReport);
                    doc.Paths.Add("/Health/IsAliveAndWell", new PathItem
                    {
                        Get = new Operation
                        {
                            Tags = new List&lt;string> { "HealthCheck" },
                            Produces = new string[] { "application/json" },
                            Responses = new Dictionary&lt;string, Response>{
                                {"200",new Response{Description="Success",
                                Schema = new Schema{Items=HealthReport}}},
                                {"503",new Response{Description="Failed"}}
                            }
                        }
                    });

                    doc.Paths.Add("/Health/IsAlive", new PathItem
                    {
                        Get = new Operation
                        {
                            Tags = new List&lt;string> { "HealthCheck" },
                            Produces = new string[] { "application/json" },
                            Responses = new Dictionary&lt;string, Response>{
                                {"200",new Response{Description="Success",
                                Schema = new Schema{}}},
                                {"503",new Response{Description="Failed"}}
                            }
                        }
                    });
                });
            });</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:heading {"level":4} -->
<h4>What if I want to Secure the health check with Authentication?</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Authentication is not supported out of the box, but nothing is blocking us to modify the Middleware and check if the user authenticated or not.<br>I already created one for one my project except checking user IsAuthenticated with httpContext.User.Identity.IsAuthenticated and throwing 401 if not everything else same with original class.<br> <a href="https://github.com/mmercan/sentinel/tree/master/HealthChecks/Mercan.HealthChecks.Common/Builder">https://github.com/mmercan/sentinel/tree/master/HealthChecks/Mercan.HealthChecks.Common/Builder</a> </p>
<!-- /wp:paragraph -->

<!-- wp:heading {"level":4} -->
<h4>What if have to use an older .Net Core or Framework?</h4>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>If you are  using .Net Core 2.2 or Above you are lucky you can start running the Health-Check today,<br>If not, think is it hard to update to 2.2 (3.0 is coming too), I know "if it ain't broke, don't fix it" but you also accept the vulnerabilities you are not aware when you write your code.<br><a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://www.cvedetails.com/vulnerability-list/vendor_id-26/product_id-42998/Microsoft-Asp.net-Core.html" target="_blank">https://www.cvedetails.com/vulnerability-list/vendor_id-26/product_id-42998/Microsoft-Asp.net-Core.html</a> <br><br>After seeing the vulnerabilities  and still want to stay with this (like one of my internal project) you can retrofit  Health-Check  libraries to Full Framework or .Net Core 1.0 - 2.1 (if you are interested with retrofit please  write a comment I might add it to GitHub after some clean up )<br>if you are interested in source code of Health Check, you can find them in 2 GitHub repositories<br><a href="https://github.com/aspnet/Extensions/tree/master/src/HealthChecks/HealthChecks">https://github.com/aspnet/Extensions/tree/master/src/HealthChecks/HealthChecks</a> (Main Repo)<br><a href="https://github.com/aspnet/AspNetCore/tree/master/src/Middleware/HealthChecks/src">https://github.com/aspnet/AspNetCore/tree/master/src/Middleware/HealthChecks/src</a> (Asp.Net Core Middleware)<br><br></p>
<!-- /wp:paragraph -->