using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace MeetingRoomBookingApi.Middleware
{
    public class RoleMiddleware
    {
        private readonly RequestDelegate _next;

        public RoleMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var role = context.Request.Headers["role"].ToString();

            if (!string.IsNullOrEmpty(role))
            {
                context.Items["UserRole"] = role;
            }

            await _next(context);
        }
    }
}