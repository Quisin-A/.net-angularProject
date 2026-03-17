using Microsoft.EntityFrameworkCore;
using MeetingRoomBookingApi.Data;
using MeetingRoomBookingApi.Middleware;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.HttpOverrides;

//
// AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);
//

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// builder.Services.AddDbContext<ApplicationDbContext>(options =>
//     options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAngular",
//         policy => policy.WithOrigins("http://localhost:4200")
//         .AllowAnyHeader()
//         .AllowAnyMethod());
// });
// builder.Services.AddCors(options =>
// {
//     options.AddPolicy("AllowAngular",
//         policy => policy.WithOrigins("http://localhost:4200")
//         .AllowAnyHeader()
//         .AllowAnyMethod());
// });
builder.Services.AddCors(options =>
{
    // options.AddPolicy("AllowAll",
    //     policy => policy.AllowAnyOrigin()
    //                     .AllowAnyHeader()
    //                     .AllowAnyMethod());
    options.AddPolicy("AllowAll",
        policy => policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod());
});

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();
var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeadersOptions.KnownNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();

app.UseForwardedHeaders(forwardedHeadersOptions);
app.UseMiddleware<RequestLoggingMiddleware>();
//
app.UseMiddleware<RoleMiddleware>();
//

// app.UseCors("AllowAngular");
app.UseCors("AllowAll");
app.MapControllers();

// Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
app.MapOpenApi();
app.MapScalarApiReference();
// app.MapScalarApiReference(options =>
// {
//     options.WithServers(new[]
//     {
//         new Scalar.AspNetCore.ScalarServer
//         {
//             Url = "https://roombook-api2.onrender.com"
//         }
//     });
// });
    
// }

// app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");
app.MapGet("/", () => Results.Redirect("/scalar"));


//
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}
//
app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
