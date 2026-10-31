using EnhanzerApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace EnhanzerApi.Middleware;

public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
{
    public async Task InvokeAsync(HttpContext ctx)
    {
        try { await next(ctx); }
        catch (OperationCanceledException) when (ctx.RequestAborted.IsCancellationRequested) { }
        catch (Exception ex)
        {
            var (status, title, detail) = ex switch
            {
                AuthenticationFailedException => (401, "Authentication failed", ex.Message),
                HttpRequestException or TaskCanceledException =>
                    (502, "Upstream service unavailable", "The authentication service could not be reached. Please try again."),
                _ => (500, "Server error", "Something went wrong. Please try again later.")
            };
            if (status >= 500) logger.LogError(ex, "Unhandled exception");

            ctx.Response.StatusCode = status;
            await ctx.Response.WriteAsJsonAsync(new ProblemDetails { Status = status, Title = title, Detail = detail });
        }
    }
}
