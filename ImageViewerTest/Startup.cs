using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;
using System.Net;
using ImageViewerTest.Helpers;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace ImageViewerTest
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();

            services.AddOptions();

            services.Configure<BasePathsOptions>(Configuration.GetSection("BasePathsOptions"));
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMiddleware<LoggingMiddleware>();

            app.UseExceptionHandler(builder =>
            {
                builder.Run(async context =>
                {
                    context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Response.ContentType = "application/json";
                    var contextFeature = context.Features.Get<IExceptionHandlerFeature>();

                    if (contextFeature != null)
                    {
                        string errorMessage = JsonConvert.SerializeObject(new { error = contextFeature.Error.Message });
                        await context.Response.WriteAsync(errorMessage).ConfigureAwait(false);
                    }
                });
            });

            app.UseDefaultFiles(new DefaultFilesOptions
            {
                DefaultFileNames = new List<string>{"pages/folders-viewer.html"}
            });

            app.UseStaticFiles();

            app.UseRouting();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
