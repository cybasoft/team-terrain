# Deployment Guide for Cloudflare Pages

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Bun**: Installed on your system
3. **Git**: Repository should be on GitHub/GitLab/Bitbucket

## Deployment Methods

### Method 1: Automatic Deployment (Recommended)

1. **Connect Repository to Cloudflare Pages**
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Connect to Git"
   - Select your repository

2. **Configure Build Settings**
   ```
   Framework preset: Vite
   Build command: bun run build
   Build output directory: dist
   Root directory: (leave empty)
   ```

3. **Set Environment Variables**
   In Cloudflare Pages dashboard, go to Settings > Environment Variables and add:
   
   ```
   VITE_NODE_ENV=
   VITE_MAPBOX_ACCESS_TOKEN=
   VITE_API_BASE_URL=
   VITE_LOCATION_TRACKER_ENDPOINT=
   VITE_USERS_ENDPOINT=
   VITE_LOGIN_ENDPOINT=
   VITE_API_AUTH_TOKEN=
   VITE_APP_NAME=Employees Map
   VITE_APP_VERSION=1.0.0
   VITE_DEFAULT_MAP_CENTER_LNG=36.8219
   VITE_DEFAULT_MAP_CENTER_LAT=-1.2921
   VITE_DEFAULT_MAP_ZOOM=8
   VITE_MAP_STYLE=mapbox://styles/mapbox/light-v11
   VITE_DEBUG_MODE=false
   VITE_LOG_LEVEL=error
   VITE_ADMIN_EMAILS=
   ```

4. **Deploy**
   - Click "Save and Deploy"
   - Cloudflare will automatically build and deploy your app

### Method 2: Manual Deployment (Using Wrangler CLI)

1. **Install Wrangler CLI** (already done)
   ```bash
   bun add -D wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   bunx wrangler login
   ```

3. **Build and Deploy**
   ```bash
   # Build the project
   bun run build
   
   # Deploy to Cloudflare Pages
   bunx wrangler pages deploy dist --project-name employees-map
   ```

## Post-Deployment Steps

1. **Custom Domain** (Optional)
   - In Cloudflare Pages dashboard, go to Custom domains
   - Add your domain and configure DNS

2. **Security Headers** (Recommended)
   - In Pages dashboard, go to Settings > Functions
   - Add security headers for better protection

3. **Analytics** (Optional)
   - Enable Cloudflare Web Analytics
   - Monitor performance and usage

## Troubleshooting

### Common Issues

1. **Build Fails**
   - Check if all dependencies are installed
   - Verify environment variables are set correctly
   - Check the build logs in Cloudflare dashboard

2. **Environment Variables Not Working**
   - Ensure all VITE_ prefixed variables are set in Cloudflare Pages
   - Variables must be set for both Preview and Production environments

3. **Mapbox Not Loading**
   - Verify VITE_MAPBOX_ACCESS_TOKEN is correct
   - Check Mapbox account quota and permissions

4. **API Calls Failing**
   - Verify VITE_API_BASE_URL and endpoints are correct
   - Check CORS settings on your API server

### Build Commands

```bash
# Development build
bun run build:dev

# Production build
bun run build

# Preview build locally
bun run preview

# Deploy directly
bun run deploy
```

## Performance Optimization

1. **Enable Cloudflare Optimization**
   - Auto Minify: CSS, JavaScript, HTML
   - Brotli Compression
   - Rocket Loader

2. **Cache Settings**
   - Browser Cache TTL: 1 month for static assets
   - Edge Cache TTL: 1 hour for API responses

## Security Considerations

1. **Environment Variables**
   - Never commit `.env` files to version control
   - Use different tokens for development and production
   - Regularly rotate API tokens

2. **HTTPS**
   - Cloudflare Pages automatically provides HTTPS
   - Ensure all API calls use HTTPS

3. **Content Security Policy**
   - Consider adding CSP headers for enhanced security

## Monitoring

1. **Cloudflare Analytics**
   - Monitor page views and performance
   - Track error rates

2. **Real User Monitoring**
   - Enable RUM for better insights
   - Monitor Core Web Vitals

## Support

For issues:
1. Check Cloudflare Pages documentation
2. Review build logs in Cloudflare dashboard
3. Test locally with `bun run preview`
