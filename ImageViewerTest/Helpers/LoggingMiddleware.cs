using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Logging;
using Serilog;
using ILogger = Serilog.ILogger;

namespace ImageViewerTest.Helpers
{
    public class LoggingMiddleware
    {
        private readonly RequestDelegate next;

        public LoggingMiddleware(RequestDelegate next)
        {
            this.next = next ?? throw new ArgumentNullException(nameof(next));
        }

        public async Task Invoke(HttpContext httpContext)
        {
            if (httpContext == null)
            {
                throw new ArgumentNullException(nameof(httpContext));
            }

            var start = Stopwatch.GetTimestamp();

            await next(httpContext);
            var elapsedMs = GetElapsedMilliseconds(start, Stopwatch.GetTimestamp());

            var statusCode = httpContext.Response?.StatusCode;
            var message = $"HTTP {httpContext.Request.Method} {GetPath(httpContext)} responded {statusCode} in {elapsedMs:0.0000} ms";

            if (statusCode > 499)
            {
                Log.Fatal(message);
            }
            else if(statusCode > 399 && statusCode < 500)
            {
                Log.Error(message);
            }
            else
            {
                Log.Information(message);
            }
        }

        private static double GetElapsedMilliseconds(long start, long stop)
        {
            var ms = (stop - start) * 1000 / (double)Stopwatch.Frequency;
            return ms;
        }

        private static string GetPath(HttpContext httpContext)
        {
            var path = httpContext.Features.Get<IHttpRequestFeature>()?.RawTarget ??
                             httpContext.Request.Path.ToString();
            return path;
        }
    }
}
