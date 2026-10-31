# Enhanzer – Full Stack Assignment (Angular + ASP.NET Core 8 + SQL Server)

```
enhanzer/
├─ database/01_create_database.sql      # DB + Location_Details table
├─ backend/EnhanzerApi/                 # ASP.NET Core 8 Web API
└─ frontend/src/                        # Angular source (copy into a fresh Angular CLI project)
```

## 1. Database
Run `database/01_create_database.sql` in SSMS / `sqlcmd -S . -i database/01_create_database.sql`.
Then set `ConnectionStrings:Default` in `backend/EnhanzerApi/appsettings.json`.

## 2. Backend
```bash
cd backend/EnhanzerApi
dotnet user-secrets init
dotnet user-secrets set "Jwt:Key" "a-long-random-secret-at-least-32-characters"
dotnet run --launch-profile https       # note the https port, e.g. https://localhost:7080
```
Swagger: `https://localhost:<port>/swagger`.
CORS allows `http://localhost:4200` (see `Cors:Origins`).

Endpoints
- `POST /api/auth/login` `{ email, password }` -> calls the Enhanzer staging API, saves `User_Locations` into `Location_Details`, returns a JWT + locations.
- `GET  /api/locations` (JWT required) -> locations for the logged-in user (Batch dropdown).

## 3. Frontend (Angular 20+)
```bash
npm i -g @angular/cli
ng new enhanzer-pos --style=css --routing=false --ssr=false
cd enhanzer-pos
# delete the generated src/app/* and src/main.ts, src/styles.css, then copy this repo's frontend/src/* over src/
```
Set `apiUrl` in `src/environments/environment.ts` to the backend HTTPS URL, then:
```bash
ng serve        # http://localhost:4200
```
Login with the credentials from the assignment sample request.

## Notes
- Session: JWT kept in `sessionStorage`; `authGuard` protects `/purchase-bill`; interceptor adds the Bearer token and logs out on 401.
- Calculations: Total Cost = Cost x Qty x (1 - Discount%); Total Selling = Price x Qty; Margin = Price - Cost.
