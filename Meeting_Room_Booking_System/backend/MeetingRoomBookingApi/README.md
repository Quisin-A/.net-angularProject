# MeetingRoomBookingApi Backend README

## 1) Overview
This backend is an ASP.NET Core Web API for a Meeting Room Booking System.

Main responsibilities:
- User registration and login
- Room management (Admin)
- Booking creation, listing, and cancellation
- User activation/deactivation (Admin)
- Basic request logging and role-based request context

Tech stack:
- .NET 9 (ASP.NET Core Web API)
- Entity Framework Core 9
- SQL Server (LocalDB in current config)
- OpenAPI + Scalar API reference UI

---

## 2) Project Structure (Backend)

- `MeetingRoomBookingApi/`
- `Controllers/`
- `Data/`
- `DTOs/`
- `Middleware/`
- `Migrations/`
- `Models/`
- `Properties/`
- `Program.cs`
- `appsettings.json`
- `appsettings.Development.json`
- `MeetingRoomBookingApi.csproj`
- `MeetingRoomBookingApi.http`
- `bin/` (generated)
- `obj/` (generated)

---

## 3) Core Startup File

### Program.cs
File: `Program.cs`

Purpose:
- Builds and configures the web application pipeline.

What it configures:
- `AddControllers()` to enable API controllers.
- `AddDbContext<ApplicationDbContext>()` with SQL Server connection string from configuration.
- `AddCors()` policy `AllowAngular` for `http://localhost:4200`.
- `AddOpenApi()` for API docs.
- Middleware pipeline order:
  - `RequestLoggingMiddleware`
  - `RoleMiddleware`
  - CORS
  - Controller endpoint mapping
- Development-only docs endpoints:
  - OpenAPI JSON
  - Scalar UI
- `UseHttpsRedirection()`
- A sample `/weatherforecast` endpoint (template endpoint)
- Root redirect to `/scalar`

Pipeline idea:
`Request -> Middleware -> Controller -> DbContext -> Response`

---

## 4) Folder-by-Folder Explanation

## Controllers/
Files:
- `AuthController.cs`
- `RoomsController.cs`
- `BookingsController.cs`
- `UsersController.cs`

Role of this folder:
- Handles HTTP requests and returns HTTP responses.
- Contains endpoint routing and request-level business rules.

### AuthController.cs
- Route base: `api/auth`
- Endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
- Responsibilities:
  - Validates registration input
  - Normalizes email and checks duplicate user
  - Creates user with default role `User`
  - Validates login credentials
  - Blocks inactive users from login

### RoomsController.cs
- Route base: `api/rooms`
- Endpoints:
  - `GET /api/rooms`
  - `POST /api/rooms`
  - `PUT /api/rooms/{id}`
  - `DELETE /api/rooms/{id}`
- Responsibilities:
  - Returns room list for all authenticated users
  - Restricts add/update/delete actions to Admin via role value in `HttpContext.Items["UserRole"]`

### BookingsController.cs
- Route base: `api/bookings`
- Endpoints:
  - `POST /api/bookings`
  - `GET /api/bookings/my/{userId}`
  - `GET /api/bookings`
  - `DELETE /api/bookings/{id}`
- Responsibilities:
  - Validates booking time range (`EndTime > StartTime`)
  - Prevents overlapping room bookings
  - Returns user bookings with room details (`Include`)
  - Returns all bookings for Admin with room and user details
  - Allows cancel:
    - Admin can cancel any booking
    - User can cancel only own booking (checked via `userId` header)

### UsersController.cs
- Route base: `api/users`
- Endpoints:
  - `GET /api/users`
  - `PUT /api/users/disabled/{id}`
  - `PUT /api/users/disable/{id}`
- Responsibilities:
  - Admin-only user list
  - Toggle active/inactive status
  - Optional cleanup of future bookings for deactivated user via query flags:
    - `clearFutureBookings`
    - `clearFuture`

---

## Data/
Files:
- `ApplicationDbContext.cs`

Role of this folder:
- Database context and EF Core mapping entry point.

### ApplicationDbContext.cs
- Inherits from `DbContext`
- Defines table sets:
  - `DbSet<User> Users`
  - `DbSet<Room> Rooms`
  - `DbSet<Booking> Bookings`
- Used by controllers to query and save data.

---

## DTOs/
Files:
- `LoginDto.cs`
- `RegisterDto.cs`

Role of this folder:
- Defines request payload shapes for API operations.
- Helps avoid using entity models directly for external request contracts.

### LoginDto.cs
- Fields:
  - `Email`
  - `Password`

### RegisterDto.cs
- Fields:
  - `Name`
  - `Email`
  - `Password`

---

## Middleware/
Files:
- `RequestLoggingMiddleware.cs`
- `RoleMiddleware.cs`

Role of this folder:
- Cross-cutting logic executed for requests before controllers.

### RequestLoggingMiddleware.cs
- Logs request method/path and response status code to console.
- Useful for simple diagnostics.

### RoleMiddleware.cs
- Reads `role` request header.
- Stores it in `HttpContext.Items["UserRole"]`.
- Controllers read this value for role-based authorization checks.

---

## Models/
Files:
- `User.cs`
- `Room.cs`
- `Booking.cs`

Role of this folder:
- Core domain entities mapped to database tables by EF Core.

### User.cs
- Represents system users.
- Key fields:
  - `Id`, `Name`, `Email`, `Password`, `Role`, `IsActive`

### Room.cs
- Represents meeting rooms.
- Key fields:
  - `Id`, `Name`, `Capacity`, `Location`

### Booking.cs
- Represents room reservations.
- Key fields:
  - `Id`, `RoomId`, `UserId`, `StartTime`, `EndTime`
- Navigation properties:
  - `Room`
  - `User`

---

## Migrations/
Files:
- `20260309121803_InitialCreate.cs`
- `20260309121803_InitialCreate.Designer.cs`
- `ApplicationDbContextModelSnapshot.cs`

Role of this folder:
- Tracks schema changes generated by EF Core migrations.

Notes:
- `InitialCreate` contains first schema creation.
- `Designer` and `ModelSnapshot` are auto-generated and used by EF migration tooling.

---

## Properties/
Files:
- `launchSettings.json`

Role of this folder:
- Local run/debug launch profiles for development.
- Defines app URLs and environment (`Development`).

---

## 5) Configuration Files

### appsettings.json
- Base configuration for all environments.
- Contains:
  - `ConnectionStrings:DefaultConnection`
  - Logging configuration
  - `AllowedHosts`

### appsettings.Development.json
- Development environment overrides.
- Usually used for local-only settings.

---

## 6) Project File

### MeetingRoomBookingApi.csproj
Defines:
- Target framework: `net9.0`
- Nullability and implicit using settings
- Package references:
  - `Microsoft.EntityFrameworkCore`
  - `Microsoft.EntityFrameworkCore.SqlServer`
  - `Microsoft.EntityFrameworkCore.Design`
  - `Microsoft.AspNetCore.OpenApi`
  - `Scalar.AspNetCore`

---

## 7) HTTP Test File

### MeetingRoomBookingApi.http
- Simple API request file for manual endpoint testing in editor.
- Currently includes sample weather endpoint request.

---

## 8) Generated Build Folders (Do Not Edit Manually)

### bin/
- Final compiled outputs (dll, runtime files, copied configs).

### obj/
- Intermediate build and NuGet restore artifacts.

These are generated by build tools and typically excluded from manual edits.

---

## 9) Current Authorization Pattern Used
This project uses a header-based role propagation approach:
- Frontend sends `role` and `userId` headers.
- `RoleMiddleware` stores role in `HttpContext.Items`.
- Controllers check role and user ownership where needed.

Important:
- This is functional for learning/internal usage but is not a full production-grade auth model.
- Production systems usually use JWT/OAuth with claims-based authorization.

---

## 10) End-to-End Request Flow Example
1. User performs action in frontend.
2. Frontend calls backend endpoint.
3. Middleware runs:
   - request logging
   - role extraction
4. Controller validates and authorizes request.
5. Controller uses `ApplicationDbContext` to read/write `Models` in database.
6. Response returned to frontend.

---

## 11) Quick Notes for Future Contributors
- Keep DTOs as API contracts; avoid exposing internal entities unnecessarily.
- Keep authorization checks consistent in controllers.
- Prefer async EF methods (`ToListAsync`, `SaveChangesAsync`) for scalability.
- Never commit secrets in appsettings files.
- Keep migrations in sync with model changes.
