# TeamTerrain Frontend

React-based frontend application for visualizing and managing employee locations on an interactive Mapbox map.

## Features

- 🗺️ **Interactive Maps**: Powered by Mapbox GL JS with multiple style options
- 📍 **Location Management**: Click-to-pin locations with drag-and-drop editing
- 👥 **User Authentication**: Secure login with role-based permissions
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🔐 **Permission System**: Admin vs user access controls
- 🌍 **Global Mapping**: Support for worldwide locations with city/country display

## Requirements

- Node.js 18+
- Bun (recommended) or npm
- [Mapbox API Token](https://account.mapbox.com/access-tokens/)
- Backend API running (see [backend README](../backend/README.md))

## Installation & Setup

### 1. Install Dependencies

```bash
cd frontend
bun install
# or: npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Mapbox Configuration (REQUIRED)
VITE_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here

# API Configuration (Point to your backend)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_AUTH_TOKEN=your-api-auth-token-change-this

# API Endpoints
VITE_LOCATION_TRACKER_ENDPOINT=/location/update
VITE_USERS_ENDPOINT=/users
VITE_LOGIN_ENDPOINT=/auth/login

# App Settings
VITE_APP_NAME=TeamTerrain
VITE_DEFAULT_MAP_CENTER_LNG=36.8219
VITE_DEFAULT_MAP_CENTER_LAT=-1.2921
VITE_DEFAULT_MAP_ZOOM=6

# Admin Configuration
VITE_ADMIN_EMAILS=admin@teamterrain.com,your.email@company.com
```

### 3. Start Development Server

```bash
bun run dev
# or: npm run dev
```

Frontend runs on `http://localhost:8080`

## Environment Variables

### Required Variables

- **`VITE_MAPBOX_ACCESS_TOKEN`**: Your Mapbox access token ([Get one here](https://account.mapbox.com/access-tokens/))
- **`VITE_API_AUTH_TOKEN`**: Authorization token for API requests (must match backend)

### API Configuration

- **`VITE_API_BASE_URL`**: Backend API base URL
- **`VITE_LOCATION_TRACKER_ENDPOINT`**: Location update endpoint path
- **`VITE_USERS_ENDPOINT`**: Users endpoint path  
- **`VITE_LOGIN_ENDPOINT`**: Authentication endpoint path

### Optional Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_NAME` | Application name | `TeamTerrain` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |
| `VITE_DEFAULT_MAP_CENTER_LNG` | Default longitude | `36.8219` (Nairobi) |
| `VITE_DEFAULT_MAP_CENTER_LAT` | Default latitude | `-1.2921` (Nairobi) |
| `VITE_DEFAULT_MAP_ZOOM` | Default zoom level | `6` |
| `VITE_MAP_STYLE` | Default map style | `streets-v12` |
| `VITE_DEBUG_MODE` | Enable debug logging | `true` |
| `VITE_LOG_LEVEL` | Console log level | `debug` |
| `VITE_ADMIN_EMAILS` | Admin user emails (comma-separated) | `` |

### Map Styles

Available Mapbox map styles (user can switch via UI):

- `mapbox://styles/mapbox/streets-v12` - Street map (default)
- `mapbox://styles/mapbox/light-v11` - Light theme
- `mapbox://styles/mapbox/dark-v11` - Dark theme  
- `mapbox://styles/mapbox/satellite-v9` - Satellite imagery
- `mapbox://styles/mapbox/satellite-streets-v11` - Satellite with streets
- `mapbox://styles/mapbox/navigation-day-v1` - Navigation day mode
- `mapbox://styles/mapbox/navigation-night-v1` - Navigation night mode

## Authentication & Permissions

### Login System

- **Email/Password Authentication**: Users log in with credentials
- **JWT Tokens**: Secure session management with automatic refresh
- **Session Persistence**: Login state maintained across browser sessions
- **Logout**: Clear session and redirect to login

### Permission Levels

**Admin Users** (configured via `VITE_ADMIN_EMAILS`):
- Can view and manage all user locations
- Can create pins for any user by clicking the map
- Can drag any pin to update locations
- Can delete any user's pin
- Admin badge shown in header

**Regular Users**:
- Can only manage their own location pin
- Click map to pin/update their location
- Can only drag their own pin
- Cannot modify other users' pins
- Other pins appear locked with visual indicators

### Security Features

- **Token-based Authentication**: Secure API communication
- **Role-based Access**: Enforced at UI and API level
- **Input Validation**: Client-side form validation
- **Secure Logging**: No sensitive data in console logs

## UI Components & Features

### Map Interface

- **Interactive Map**: Pan, zoom, and click interactions
- **Pin Management**: Click to place, drag to move pins
- **Location Search**: Search for places and coordinates
- **Style Switcher**: Change map appearance
- **Responsive Controls**: Touch-friendly mobile interface

### User Interface

- **User Sidebar**: List of all users with status indicators
- **Login Form**: Clean authentication interface
- **Header Controls**: User info, admin badge, logout
- **Dialogs**: Pin placement and confirmation modals
- **Loading States**: Smooth loading animations

### Map Features

- **Multiple Pin Types**: Different colors for different statuses
- **Tooltips**: Hover for user information
- **Clustering**: Groups nearby pins at low zoom levels
- **Geolocation**: Option to use device location
- **Coordinate Display**: Show lat/lng for precise positioning

## Available Scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |
| `bun run preview` | Preview production build |
| `bun run lint` | Run ESLint |
| `bun run type-check` | Run TypeScript checks |

## Project Structure

```
frontend/src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── AppHeader.tsx    # Header with user info
│   ├── LoginForm.tsx    # Authentication form
│   ├── MapComponent.tsx # Main map interface
│   ├── UserSidebar.tsx  # User list sidebar
│   └── ...
├── hooks/
│   ├── useAuth.ts       # Authentication state
│   ├── useUsers.ts      # User data management
│   ├── useMapbox*.ts    # Map-related hooks
│   └── ...
├── lib/
│   ├── auth.ts          # API authentication
│   ├── coordinates.ts   # Location utilities
│   └── utils.ts         # General utilities
├── types/
│   └── User.ts          # TypeScript definitions
├── config/
│   └── env.ts           # Environment configuration
└── pages/
    ├── Index.tsx        # Main application page
    └── NotFound.tsx     # 404 page
```

## Development Workflow

### 1. Setup Backend First
Ensure the backend is running before starting frontend development:
```bash
# In backend directory
npm run db:migrate
npm run db:seed  
npm start
```

### 2. Start Frontend
```bash
# In frontend directory
bun run dev
```

### 3. Test Authentication
Use default accounts:
- Admin: `admin@teamterrain.com` / `admin123`
- User: `john.doe@teamterrain.com` / `password123`

### 4. Development Features
- **Hot Reload**: Changes automatically refresh
- **TypeScript**: Full type checking
- **ESLint**: Code quality enforcement
- **Tailwind CSS**: Utility-first styling

## Building for Production

### Build Process
```bash
bun run build
```

Output directory: `dist/`

### Environment Variables for Production
- Set production API URLs in `VITE_API_BASE_URL`
- Use production Mapbox token
- Configure production admin emails
- Set `VITE_DEBUG_MODE=false`
- Set `VITE_LOG_LEVEL=error`

### Deployment Options

**Static Hosting (Recommended)**:
- Cloudflare Pages (GitHub Actions included)
- Vercel
- Netlify  
- AWS S3 + CloudFront

**Configuration for Deployment**:
- Ensure `_redirects` file is included for SPA routing
- Set proper environment variables
- Configure CORS on backend for your domain

## Troubleshooting

### Common Issues

**Mapbox Token Errors**
- Verify token is valid and not expired
- Check token has required scopes
- Ensure no leading/trailing spaces

**API Connection Issues**  
- Confirm backend is running on correct port
- Check CORS settings in backend
- Verify API endpoints match backend routes
- Ensure `API_AUTH_TOKEN` matches between frontend/backend

**Authentication Problems**
- Check network requests in browser dev tools
- Verify login credentials with backend test accounts
- Clear localStorage to reset session state

**Map Not Loading**
- Check browser console for Mapbox errors
- Verify internet connection
- Test with different map styles

### Development Tips

**Environment Variables**
- Restart dev server after changing `.env`
- Use `.env.local` for local overrides (gitignored)

**Debugging**
- Set `VITE_DEBUG_MODE=true` for verbose logging
- Use browser dev tools Network tab for API calls
- Check console for validation errors

**Performance**
- Large datasets may need map clustering
- Consider pagination for user lists
- Optimize Mapbox token permissions

## Contributing

1. Follow existing code patterns
2. Use TypeScript strictly
3. Test on both desktop and mobile
4. Update documentation for new features
5. Ensure accessibility standards

## API Integration

This frontend integrates with the TeamTerrain backend API. See [backend README](../backend/README.md) for API documentation.

Key integrations:
- Authentication via `/api/auth/login`
- User data via `/api/users`
- Location updates via `/api/location/update`

## Support

For frontend-specific issues:
1. Check browser console for errors
2. Verify environment variables
3. Test API endpoints directly
4. Check Mapbox token validity

See main [README](../README.md) for general setup instructions.

The application uses **email and password authentication** with role-based permissions:

### Login

- Users must provide both **email** and **password** to log in
- Authentication uses POST request to dedicated login endpoint (`VITE_LOGIN_ENDPOINT`)
- Login credentials are sent securely to the server for validation
- Sessions are persisted in localStorage for convenience
- Fallback authentication is available if API is temporarily unavailable

### Permission Levels

The app has two levels of access for pin management:

1. **Admin Users**: Can create and manage pins for any user
   - Configured via `VITE_ADMIN_EMAILS` environment variable
   - Comma-separated list of email addresses
   - Example: `admin@company.com,manager@company.com`
   - Can create pins for any user when clicking the map
   - Can drag any user's pin to move their location
   - Can delete any user's pin

2. **Regular Users**: Can only manage their own pin
   - Can only pin their own location
   - When clicking the map, dialog opens directly for their user
   - Can only move their own pin
   - Can only delete their own pin
   - Cannot see or select other users for pinning
   - Can only drag their own pin to move their location
   - Other pins appear locked with reduced opacity
   
   **Admin users** can drag any existing pin to a new location and have visual indicators showing their admin status

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

## Features

### Map Features

1. **User Location Pins**: Displays all user locations on an interactive map
2. **Real-time Updates**: Pins are updated in real-time when moved or added
3. **Info Popups**: Click pins to view detailed user information
4. **Map Search**: Search for locations to easily navigate the map
5. **Map Style Switcher**: Change map styles with a single click
   - Access via the gear icon in the header
   - Choose from multiple Mapbox styles: Streets, Light, Dark, Satellite, etc.
   - Style preferences are saved to localStorage
6. **Responsive Design**: Works on desktop and mobile devices

### Pin Movement Permissions

1. **Admin Users**: Can move any pin on the map
   - Visual indicators show admin status
   - Can drag any existing pin to a new location

2. **Regular Users**: Can only move their own pin
   - Other pins appear locked with reduced opacity
   - Can only drag their own pin to move their location
