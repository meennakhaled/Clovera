# Backend integration (ASP.NET Core Web API)

Everything below is a **proposed contract**. None of these endpoints exist yet. The frontend only calls them when `VITE_USE_MOCK_API=false`.

All requests go through `src/services/apiClient.js`, which prefixes `VITE_API_BASE_URL` (for example `https://localhost:7000/api`). Paths below are relative to that base. JSON in, JSON out.

## 1. Authentication endpoints

| Feature | Method and path | Auth required | Frontend status |
|---|---|---|---|
| Register | `POST /auth/register` | No | Wired. Mock when `VITE_USE_MOCK_API=true` |
| Login | `POST /auth/login` | No | Wired. Mock when `VITE_USE_MOCK_API=true` |
| Google sign-in | `POST /auth/google` | No | Wired. **Never mocked** |
| Current user | `GET /auth/me` | Yes | Wired. Used to restore a session on page load |
| Logout | `POST /auth/logout` | Yes | Wired. Local sign-out still happens if it fails |
| Forgot password | `POST /auth/forgot-password` | No | **Not wired.** The link shows a message |

### Register: `POST /auth/register`
```json
{ "username": "mariam", "email": "mariam@example.com", "password": "Passw0rd1", "confirmPassword": "Passw0rd1" }
```
Success `200/201`: `{ "accessToken": "…", "user": { "id": "…", "name": "mariam", "email": "mariam@example.com", "avatarUrl": null } }`.
If you prefer email confirmation first, return `201` with **no `user`**; the frontend then sends the person to Login with "Account created. Log in to continue."
Errors: `409` if the email exists; `400` with ProblemDetails `errors` (below).

### Login: `POST /auth/login`
Request `{ "email": "…", "password": "…" }`. Success is the same shape as register. Wrong credentials: `401` (the UI shows "Email or password is incorrect.").

### Google: `POST /auth/google`
Request `{ "code": "<one-time auth code>", "redirectUri": "postmessage" }`. Success: same shape as login.

The frontend uses Google's **authorization code popup flow** (`initCodeClient`). The browser only gets a one-time code; it is not proof of identity. The backend must:
1. Exchange the code at `https://oauth2.googleapis.com/token` with `client_id`, **`client_secret`** (server only), `grant_type=authorization_code` and `redirect_uri=postmessage`.
2. Validate the returned `id_token` (for example `GoogleJsonWebSignature.ValidateAsync(idToken, new() { Audience = new[] { clientId } })` from `Google.Apis.Auth`).
3. Find or create the user by the verified email / `sub` in SQL Server (EF Core), then issue its own token or cookie.

Google Cloud Console setup: create an OAuth client of type **Web application**; add `http://localhost:5173` (and your production origin) under **Authorized JavaScript origins**; put the client ID in `VITE_GOOGLE_CLIENT_ID` and the client ID + secret in the backend's configuration or user secrets.

### Current user: `GET /auth/me`
Returns `{ "id": "…", "name": "…", "email": "…", "avatarUrl": null }` (a `{ "user": {…} }` wrapper is also accepted). `401` when signed out.

### Error format
Use ASP.NET Core `ProblemDetails`. The client reads `detail`, `message` or `title` for the message, and `errors` for field messages:
```json
{ "title": "Validation failed", "status": 400, "errors": { "Email": ["Email is already in use."], "Password": ["Too weak."] } }
```
Keys are matched to form fields by name (`Email` → `email`).

## 2. Sessions: choose one

- **httpOnly cookie (recommended).** The API sets a `Secure; HttpOnly; SameSite` cookie. The client already sends `credentials: 'include'`. You can omit `accessToken`. Note: `AuthContext` currently only restores a session at load when a token is in `sessionStorage`; for cookie-only sessions, change its initial status to `'loading'` so it always calls `/auth/me`.
- **Bearer JWT.** Return `accessToken`; the client keeps it in `sessionStorage` and sends `Authorization: Bearer …`. Simpler, but readable by any script on the page.

## 3. CORS (Program.cs)
```csharp
builder.Services.AddCors(o => o.AddPolicy("Clovera", p => p
    .WithOrigins("http://localhost:5173")   // add your production origin
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));
// ...
app.UseCors("Clovera");
```
For local HTTPS, trust the dev certificate (`dotnet dev-certs https --trust`).

## 4. Moving off demo mode
1. Set `VITE_USE_MOCK_API=false` in `.env`.
2. Delete `src/services/mock/` and the `env.useMockApi` branches in `src/services/authService.js`.
3. Confirm the response shapes above (or adjust `authService.js`; it is the only place that knows them).

## 5. Navigation features without a screen (planned only)
These nav items currently show "coming soon". The routes below are suggestions for when you build them; the frontend does not call them.

| Nav item | Suggested endpoint | Method |
|---|---|---|
| Plant Shop | `/products`, `/products/{id}` | GET |
| Plant Care Chatbot | `/chatbot/messages` | POST |
| Find Your Perfect Plant | `/recommendations/plants` | POST |
| Plant Personality Test | `/personality-quiz/results` | POST |

To add a screen: create the page, add its route in `src/App.jsx`, and in `src/config/navigation.js` replace `placeholder: true` with `to: ROUTES.…`.
