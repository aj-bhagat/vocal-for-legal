# Deployment notes

Suggested first deployment:
- Frontend: static hosting that supports Vite build output (`frontend/dist`)
- Backend: ASP.NET Core hosting with HTTPS and environment-variable secrets
- Configure the frontend `VITE_API_BASE_URL` to the deployed API URL at build time.
- Configure API `Cors__AllowedOrigins` as the exact production frontend origin(s), not `*`.
- Configure SMTP and recipient email using the hosting provider's secret/environment-variable settings.
- Use HTTPS only in production and test CORS, email delivery, rate limiting, validation, and error handling.
- Add the deployed domain to Google Search Console and submit `/sitemap.xml`.

Do not store SMTP passwords in source control. Do not deploy with placeholder advocate details.
