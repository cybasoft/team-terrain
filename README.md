# Employees Map

## Setup

```
npm i
cp .env.example .env
npm run dev
```

### Required Variables
- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token (get one from [Mapbox](https://account.mapbox.com/access-tokens/))

### Optional Variables
- `VITE_APP_NAME`: Application name (default: "Employees Map")
- `VITE_APP_VERSION`: Application version (default: "1.0.0")
- `VITE_DEFAULT_MAP_CENTER_LNG`: Default map longitude (default: 36.8219 - Nairobi)
- `VITE_DEFAULT_MAP_CENTER_LAT`: Default map latitude (default: -1.2921 - Nairobi)
- `VITE_DEFAULT_MAP_ZOOM`: Default map zoom level (default: 10)
- `VITE_MAP_STYLE`: Mapbox map style (default: "mapbox://styles/mapbox/light-v11")
- `VITE_DEBUG_MODE`: Enable debug mode (default: true in development)
- `VITE_LOG_LEVEL`: Logging level (default: "debug")

### API Configuration
- `VITE_API_BASE_URL`: Base URL for API endpoints
- `VITE_API_AUTH_TOKEN`: Authorization token for API requests (Bearer token)
- `VITE_LOCATION_TRACKER_ENDPOINT`: Location tracker endpoint path
- `VITE_USERS_ENDPOINT`: Users endpoint path

**Note:** The API authorization token is used for authenticating requests to your backend API endpoints. If not provided, requests will be made without authentication headers.
