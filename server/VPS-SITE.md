# Standalone VPS website

URL: https://107.172.32.153:2053/

Nginx serves personal-site/ from /var/www/ziwei. The existing API remains on localhost:8793, proxied through /ziwei-api/. All required chart scripts are hosted locally; the backend bundles OldAlmanac data and calls DeepSeek directly. No GitHub request is needed for charting or AI analysis. The optional full almanac and source-code links still point to GitHub.

The active Nginx configuration is /etc/nginx/conf.d/ziwei-api-tls.conf; its version before the static site deployment is saved as /etc/nginx/ziwei-api-tls.conf.before-site. The template is ziwei-site-tls.conf. Validate with nginx -t before reloading Nginx. Do not copy credentials into the web root.

Update static assets by copying index.html, style.css, app.js, ai.js, forecast.js and vendor/ from personal-site/ into /var/www/ziwei. Existing backend update instructions are in vendor/README.md. Keep the IP certificate renewal active. No additional application process is required for the static website.

Visitors can generate charts without an access code. AI requests still require the owner's access code and share the existing request and concurrency limits.
