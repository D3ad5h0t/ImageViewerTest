using System;
using System.Diagnostics;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Serilog;

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

            var messageSb = new StringBuilder();
            var start = Stopwatch.GetTimestamp();

            await next(httpContext);
            var elapsedMs = GetElapsedMilliseconds(start, Stopwatch.GetTimestamp());

            var statusCode = httpContext.Response?.StatusCode;
            var message = $"HTTP {httpContext.Request.Method} {GetPath(httpContext)} responded {statusCode} in {elapsedMs:0.0000} ms";
            messageSb.Append(message);

            if (statusCode > 499)
            {
                var exceptionFeature = httpContext.Features.Get<IExceptionHandlerPathFeature>();
                var errorMessage = exceptionFeature.Error.Message;
                var details = exceptionFeature.Error.StackTrace;
                messageSb.Append("\n").Append(errorMessage).Append("\n").Append(details).Append("\n");

                Log.Fatal(messageSb.ToString());
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
