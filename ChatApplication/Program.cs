using ChatApp.Services;
using ChatApplication.Data;
using ChatApplication.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

builder.Services.AddDbContext<ChatAppDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<MessageService>();
builder.Services.AddSignalR();

var allowedOrigins =
    builder.Configuration["CORS_ALLOWED_ORIGIN"]
        ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? new[] { "http://localhost:5173" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy
            .WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS redirection is skipped in the Base44 sandbox (the preview proxy
// terminates TLS and forwards plain HTTP to the container). Outside the
// sandbox the original behaviour is preserved.
if (Environment.GetEnvironmentVariable("BASE44_PREVIEW_MODE") != "1")
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.UseCors("ReactPolicy");

app.MapControllers();

app.MapHub<ChatHub>("/chatHub");

app.Run();
