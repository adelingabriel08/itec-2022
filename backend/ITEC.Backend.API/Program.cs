
using ITEC.Backend.API.Middlewares;
using ITEC.Backend.Application;
using ITEC.Backend.Application.Options;
using ITEC.Backend.Persistence;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers().AddNewtonsoftJson(options =>
    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore
); ;
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddPersistence(builder.Configuration.GetConnectionString("itec2022"));
var jwtOptions = new JwtOptions();
builder.Configuration.Bind(nameof(jwtOptions), jwtOptions);
builder.Services.AddApplicationServices(jwtOptions);
builder.Services.Configure<JwtOptions>(
        builder.Configuration.GetSection(nameof(JwtOptions)));
builder.Services.Configure<SendgridOptions>(
        builder.Configuration.GetSection(nameof(SendgridOptions)));
builder.Services.AddCors(o => o.AddDefaultPolicy(o => o.AllowAnyHeader().AllowAnyOrigin().AllowAnyMethod()));
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme. \r\n\r\n 
                      Enter 'Bearer' [space] and then your token in the text input below.
                      \r\n\r\nExample: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            },
                            Scheme = "oauth2",
                            Name = "Bearer",
                            In = ParameterLocation.Header,

                        },
                        new List<string>()
                    }
                });
});
var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.EnablePersistAuthorization();
});
//}notunihack123!

app.UseHttpsRedirection();

app.UseCors();

app.AddApplicationMiddlewares();

app.UseAuthorization();

app.UseMiddleware<ExceptionHandlerMiddleware>();

app.MapControllers();

app.Run();
