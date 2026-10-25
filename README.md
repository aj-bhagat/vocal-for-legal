# Vocal for Legal

A starter monorepo for the Vocal for Legal advocate website.

## Stack
- `frontend/`: React, TypeScript, Vite
- `backend/VocalForLegal.Api/`: ASP.NET Core Web API targeting .NET 10
- Enquiry submission: API validation + SMTP email (configured with environment variables)

## Prerequisites
Install:
1. **Git** — https://git-scm.com/downloads
2. **Node.js LTS** (includes npm) — https://nodejs.org/
3. **.NET 10 SDK** — https://dotnet.microsoft.com/download/dotnet/10.0
4. **Visual Studio Code** (recommended) — https://code.visualstudio.com/

Check installs in a terminal:
```bash
git --version
node --version
npm --version
dotnet --version
```

## Run locally

Open two terminals from the repository root.

### 1. Start the API
```bash
cd backend/VocalForLegal.Api
dotnet restore
dotnet run
```
The API prints its local HTTP/HTTPS URLs. The frontend defaults to `http://localhost:5080` for the API; if `dotnet run` uses a different port, set `VITE_API_BASE_URL` in `frontend/.env.local` to the actual base URL, for example `http://localhost:5080`.

### 2. Start the frontend
In another terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL Vite prints (usually `http://localhost:5173`).

The site can be browsed without SMTP configuration. Enquiry submissions will be rejected by the API until SMTP is configured; the form will clearly show an error instead of pretending that an enquiry was sent.

## Configure email for enquiries
Set these environment variables before starting the API:
- `Smtp__Host`
- `Smtp__Port` (usually `587`)
- `Smtp__User`
- `Smtp__Password`
- `Smtp__FromEmail`
- `Enquiries__ToEmail`
- `Smtp__EnableSsl` (`true` for TLS/STARTTLS where supported)

Example PowerShell (current terminal only):
```powershell
$env:Smtp__Host="smtp.example.com"
$env:Smtp__Port="587"
$env:Smtp__User="your-smtp-user"
$env:Smtp__Password="your-smtp-password"
$env:Smtp__FromEmail="website@example.com"
$env:Enquiries__ToEmail="advocate@example.com"
$env:Smtp__EnableSsl="true"
dotnet run
```
Do not commit real passwords or production secrets. Use your email provider's approved SMTP/app-password flow and deployment secret settings. Never test the production form with real confidential case details.

## Build checks
```bash
cd frontend
npm install
npm run build
cd ../backend/VocalForLegal.Api
dotnet build
```

## Push this project to your existing GitHub repository
If your GitHub repository is blank and you downloaded/extracted this project locally:
```bash
cd path/to/vocal-for-legal
git init
git add .
git commit -m "Initial Vocal for Legal website"
git branch -M main
git remote add origin https://github.com/aj-bhagat/vocal-for-legal.git
git push -u origin main
```
If `git remote add origin` says the remote already exists, use:
```bash
git remote set-url origin https://github.com/aj-bhagat/vocal-for-legal.git
```
If the repository already contains a README or any commit, inspect it before pushing; do not force-push blindly.

## Before public launch
- Replace all `[Full Name]`, `[City, Maharashtra]`, email, and other placeholders with advocate-approved, accurate details.
- Confirm practice areas and biography with the advocate; remove any area not actually offered.
- Review all website wording and general legal articles for accuracy and compliance with applicable Indian law and Bar Council rules. Do not publish guarantees, rankings, success rates, testimonials, or solicitation claims without proper legal review.
- Publish a real privacy notice and terms reviewed for the actual operator and data flows.
- Configure SMTP and test delivery; add abuse monitoring and operational alerts.
- Configure production HTTPS, CORS, rate limiting, logs, backups/retention, and deployment secrets.
- Update `frontend/public/sitemap.xml` and `frontend/public/robots.txt` with the actual domain before launch.
- Add the domain to Google Search Console and submit the sitemap.
- The starter currently uses a single-page React app. Search engines can index its metadata and content, but for stronger SEO at scale consider prerendering/SSR and unique URLs for individual articles.
