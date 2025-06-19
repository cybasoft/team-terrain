# Employees Map

## Setup

```
npm i
cp .env.example .env
npm run dev
```

### Required Variables
- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token (get one from [Mapbox](https://account.mapbox.com/access-tokens/))
- `VITE_API_AUTH_TOKEN`: Authorization token for API requests (Bearer token) - **Required for authentication**

### Optional Variables

- `VITE_APP_NAME`: Application name (default: "Employees Map")
- `VITE_APP_VERSION`: Application version (default: "1.0.0")
- `VITE_DEFAULT_MAP_CENTER_LNG`: Default map longitude (default: 36.8219 - Nairobi)
- `VITE_DEFAULT_MAP_CENTER_LAT`: Default map latitude (default: -1.2921 - Nairobi)
- `VITE_DEFAULT_MAP_ZOOM`: Default map zoom level (default: 10)
- `VITE_MAP_STYLE`: Mapbox map style (default: "mapbox://styles/mapbox/light-v11")
- `VITE_DEBUG_MODE`: Enable debug mode (default: true in development)
- `VITE_LOG_LEVEL`: Logging level (default: "debug")
- `VITE_ADMIN_EMAILS`: Comma-separated list of admin email addresses (can move any pin)

### API Configuration

- `VITE_API_BASE_URL`: Base URL for API endpoints
- `VITE_LOCATION_TRACKER_ENDPOINT`: Location tracker endpoint path
- `VITE_USERS_ENDPOINT`: Users endpoint path
- `VITE_LOGIN_ENDPOINT`: Login endpoint path for authentication

## Authentication & Permissions

The application uses **email and password authentication** with role-based permissions:

### Login

- Users must provide both **email** and **password** to log in
- Authentication uses POST request to dedicated login endpoint (`VITE_LOGIN_ENDPOINT`)
- Login credentials are sent securely to the server for validation
- Sessions are persisted in localStorage for convenience
- Fallback authentication is available if API is temporarily unavailable

### Pin Movement Permissions

The app has two levels of access for pin management:

### Pin Creation Permissions

1. **Admin Users**: Can create pins for any user
   - Configured via `VITE_ADMIN_EMAILS` environment variable
   - Comma-separated list of email addresses
   - Example: `admin@company.com,manager@company.com`
   - When clicking the map, can select any unpinned user

2. **Regular Users**: Can only create their own pin
   - Can only pin their own location
   - When clicking the map, dialog opens directly for their user
   - Cannot see or select other users for pinning

### Pin Movement Permissions

1. **Admin Users**: Can move any pin on the map
   - Can drag any existing pin to a new location
   - Visual indicators show admin status

2. **Regular Users**: Can only move their own pin
   - Can only drag their own pin to move their location
   - Other pins appear locked with reduced opacity

### User Interface

- **Admin Badge**: Shows in the header for admin users
- **Pin Colors**: Blue for pinned locations, green for auto-located
- **Pin Status**: Tooltips and popups show lock/unlock status
- **Permission Text**: Header shows current user's capabilities

### Security Features

- **No Password Required for Pinning**: Users are already authenticated, so no additional password verification is needed for pin operations
- **Secure Logging**: Console logs that could leak sensitive user data, coordinates, or authentication information have been removed from production code
- **Permission-Based Access**: All pin creation and movement operations are validated based on user permissions
- **Session Management**: User sessions are securely managed with proper validation

**Note:** The API authorization token is required for fetching user data and validating credentials.
