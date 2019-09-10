---
ID: 443
post_title: >
  Authorize with Multiple schemes in
  ASP.NET Core
author: mmercan
post_excerpt: ""
layout: post
permalink: >
  https://mmercan.azurewebsites.net/2019/08/18/authorize-with-a-multiple-schemes-in-asp-net-core/
published: true
post_date: 2019-08-18 06:35:49
---
<!-- wp:paragraph -->
<p>This is going to be a long post as I discover the process step by step and the pitfalls I fell along the way.<br>My APIs had a single schema to authenticate Azure AD users this worked well for a long time </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code"> services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
                cfg.Authority = Configuration["AzureAd:Instance"] + "/" + Configuration["AzureAD:TenantId"];
                cfg.Audience = Configuration["AzureAd:ClientId"];
            });</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>But API exposed need to be consume by not just the employees but also by the authenticated customers which manage by Security token service  (STS) server (they could be combined but requirement is having two providers one for employees and other for customers)  this time default schema (AddJwtBearer without a name) will not work as there will be multiple Schema to authenticate</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">            //Startup.cs
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer("azure", cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
                cfg.Authority = Configuration["AzureAd:Instance"] + "/" + Configuration["AzureAD:TenantId"];
                cfg.Audience = Configuration["AzureAd:ClientId"];
            })
            .AddJwtBearer("sts", cfg =>
            {
                cfg.TokenValidationParameters = tokenValidationParameters;
            });</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">        //ProductController.cs
        [Authorize]
        public IActionResult Get()
        {
            try
            {
                var items = mongoProductRepo.GetAll().ToList();
                logger.LogCritical("MongoCount " + items.Count().ToString());
                return Ok(items);
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to execute GET" + ex.Message);
                return BadRequest();
            }
        }</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:image {"id":583} -->
<figure class="wp-block-image"><img src="/wp-content/uploads/2019/09/Authorize-with-Multiple-schemes-in-ASP-NET-Core-1024x697.jpg" alt="" class="wp-image-583"/></figure>
<!-- /wp:image -->

<!-- wp:paragraph -->
<p>After having multiple Schema to authenticate, I start getting Errors from APIs. They don't know what Schema to use as there is no default Schema anymore. Adding  AuthenticationSchemes to  Authorize attribute to solve the problem for a while.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">        //ProductController.cs
        [Authorize(AuthenticationSchemes = "azure")]
        public IActionResult Get()
        {
            try
            {
                var items = productRepo.GetAll().ToList();
                return Ok(items);
            }
            catch (Exception ex)
            {
                logger.LogError("Failed to execute GET" + ex.Message);
                return BadRequest();
            }
        }</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>I ended up having another set for API which consumes by all Schemas and keeping AuthenticationSchemes on  Authorize was not the best solution.<br>Line below solved the problem of putting AuthenticationSchemes on Authorize attribute<br><strong><em>options.DefaultPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().AddAuthenticationSchemes("azure", "sts").Build(); </em></strong></p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer("azure", cfg =>
            {
                cfg.RequireHttpsMetadata = false;
                cfg.SaveToken = true;
                cfg.Authority = Configuration["AzureAd:Instance"] + "/" + Configuration["AzureAD:TenantId"];
                cfg.Audience = Configuration["AzureAd:ClientId"];
            })
            .AddJwtBearer("sts", cfg =>
            {
                cfg.TokenValidationParameters = tokenValidationParameters;
            });
            // use both jwt schemas interchangeably  https://stackoverflow.com/questions/49694383/use-multiple-jwt-bearer-authentication
             services.AddAuthorization(options =>
             {
                 options.DefaultPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().AddAuthenticationSchemes("azure", "sts").Build();
             });</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>I was done till I need a Middleware which will block if user is not authenticated and Provide HealthCheck details if user is authenticated.<br>I got 401 from the middleware even I provided the JWT token, the same token let me authenticate with [Authorize] but when I check  User.Identity.IsAuthenticated in a Method without  [Authorize] attribute I got False in controllers too.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code -->
<pre class="wp-block-syntaxhighlighter-code">        public async Task InvokeAsync(HttpContext httpContext)
        {
            if (httpContext == null)
            {
                throw new ArgumentNullException(nameof(httpContext));
            }
            if (!httpContext.User.Identity.IsAuthenticated)
            {
                httpContext.Response.StatusCode = 401;
            }
            else
            {
                //Full login of the real action
            }</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>and found <br> <a rel="noreferrer noopener" aria-label=" (opens in a new tab)" href="https://github.com/aspnet/AspNetCore/blob/62351067ff4c1401556725b401478e648b66acdc/src/Security/Authentication/Core/src/AuthenticationMiddleware.cs" target="_blank">https://github.com/aspnet/AspNetCore/blob/62351067ff4c1401556725b401478e648b66acdc/src/Security/Authentication/Core/src/AuthenticationMiddleware.cs</a> <br>this is how UseAuthentication Worked. if you check the code you will see  and as we don't have a Default Authenticate Scheme  UseAuthentication  Middleware is useless for our Middleware and all other middlewares tries to use User or IsAuthenticated Properties. </p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">            var defaultAuthenticate = await Schemes.GetDefaultAuthenticateSchemeAsync();
            if (defaultAuthenticate != null)
            {
                var result = await context.AuthenticateAsync(defaultAuthenticate.Name);
                if (result?.Principal != null)
                {
                    context.User = result.Principal;
                }
            }</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:paragraph -->
<p>you can see a Middleware I wrote to fill that gap, it is not perfect and cost more resources to compute but it works. Instead of calling Schemes.GetDefaultAuthenticateSchemeAsync() it calls Schemes.GetAllSchemesAsync() and loop through all Schemas and try to Authenticate you on with each schema name.</p>
<!-- /wp:paragraph -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">// AllAuthenticationMiddleware.cs
using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Mercan.Common.AspNetCore.Middlewares
{
    public class AllAuthenticationMiddleware
    {
        private readonly RequestDelegate _next;
        public AllAuthenticationMiddleware(RequestDelegate next, IAuthenticationSchemeProvider schemes, ILogger&lt;AllAuthenticationMiddleware> logger)
        {
            if (next == null){throw new ArgumentNullException(nameof(next));}
            if (schemes == null) { throw new ArgumentNullException(nameof(schemes));}
            if (logger == null){ throw new ArgumentNullException(nameof(logger));}
            this.logger = logger;
            _next = next;
            Schemes = schemes;
        }

        public AllAuthenticationMiddleware(IAuthenticationSchemeProvider schemes)
        {
            this.Schemes = schemes;
        }
        public IAuthenticationSchemeProvider Schemes { get; set; }
        ILogger&lt;AllAuthenticationMiddleware> logger;

        public async Task Invoke(HttpContext context)
        {
            context.Features.Set&lt;IAuthenticationFeature>(new AuthenticationFeature
            {
                OriginalPath = context.Request.Path,
                OriginalPathBase = context.Request.PathBase
            });

            // Give any IAuthenticationRequestHandler schemes a chance to handle the request
            var handlers = context.RequestServices.GetRequiredService&lt;IAuthenticationHandlerProvider>();
            foreach (var scheme in await Schemes.GetAllSchemesAsync())
            {
                var handler = await handlers.GetHandlerAsync(context, scheme.Name) as IAuthenticationRequestHandler;
                if (handler != null &amp;&amp; await handler.HandleRequestAsync())
                {
                    return;
                }
                var result = await context.AuthenticateAsync(scheme.Name);
                if (result != null &amp;&amp; result.Principal != null &amp;&amp; context != null)
                {
                    context.User = result.Principal;
                }
            }
            await _next(context);         
        }
    }
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">// AllAuthAppBuilderExtensions.cs
using System;
using Microsoft.AspNetCore.Authentication;
using Mercan.Common.AspNetCore;
using Mercan.Common.AspNetCore.Middlewares;

namespace Microsoft.AspNetCore.Builder
{
    public static class AuthAppBuilderExtensions
    {
        public static IApplicationBuilder UseAllAuthentication(this IApplicationBuilder app)
        {
            if (app == null)
            {
                throw new ArgumentNullException(nameof(app));
            }
            return app.UseMiddleware&lt;AllAuthenticationMiddleware>();
        }
    }
}</pre>
<!-- /wp:syntaxhighlighter/code -->

<!-- wp:syntaxhighlighter/code {"language":"csharp"} -->
<pre class="wp-block-syntaxhighlighter-code">startup.cs 
 public void Configure(IApplicationBuilder app, ILoggerFactory loggerFactory, IApiVersionDescriptionProvider provider)
        {
//.....
app.UseAllAuthentication();
//....
}</pre>
<!-- /wp:syntaxhighlighter/code -->