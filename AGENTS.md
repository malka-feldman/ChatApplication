# Base44 Dev Environment — Chat Application

## Stack
- **Backend:** ASP.NET Core 8 Web API, EF Core 8 (SQL Server), SignalR (`/chatHub`).
- **Frontend:** React 19 + Vite 8 + MUI 9 + `@microsoft/signalr` client.
- **Database:** SQL Server 2022 (compose service `db`).

## Running
```
docker compose -f docker-compose.base44.yml up -d --build
```
- Frontend (web entry point): host port **3000** → Vite dev server (container 5173).
- API: host port **8000** → Kestrel (container 8080). Swagger at `/swagger`.
- SQL Server: internal compose service `db` only (no host port).

## How it boots
1. `db` starts and passes its healthcheck (sqlcmd `SELECT 1`).
2. `api` waits for `db` to be healthy, then: installs `dotnet-ef`, restores
   NuGet packages, runs `dotnet ef database update` (applies the existing
   `InitialCreate` migration), and starts `dotnet watch run` (live reload).
3. `web` runs `npm install` then `vite dev` (live reload).

## Sandbox-specific overrides (gated on `BASE44_PREVIEW_MODE=1`)
- **HTTPS redirection skipped** in `ChatApplication/Program.cs` — the preview
  proxy terminates TLS and forwards plain HTTP to the container. With the flag
  unset, the original `app.UseHttpsRedirection()` runs as before.
- **CORS origin** is read from `CORS_ALLOWED_ORIGIN` env var (set to the
  preview's public frontend URL). Falls back to `http://localhost:5173`.
- **Frontend API base URL** is read from `VITE_API_URL` (`chat-app/src/apiBase.js`).
  Falls back to `https://localhost:7087` (original local-dev URL).
- `DOTNET_USE_POLLING_FILE_WATCHER=1` enables polling-based file watching for
  `dotnet watch` on bind mounts.
- **SignalR long-polling transport** is forced in `chat-app/src/App.jsx` when
  `VITE_API_URL` is set, because the preview proxy doesn't relay websocket/SSE
  upgrades. Locally the default auto-negotiation (websockets first) is preserved.

## Local (non-sandbox) development
- Backend: `dotnet run` (uses `launchSettings.json` `https` profile on port 7087).
- Frontend: `npm install && npm run dev` (port 5173).
- DB: LocalDB via `appsettings.Development.json` connection string.
- No external credentials are required — everything runs locally.
