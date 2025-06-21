/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Configuration
  readonly VITE_NODE_ENV: string
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string

  // Mapbox Configuration
  readonly VITE_MAPBOX_ACCESS_TOKEN: string
  readonly VITE_DEFAULT_MAP_CENTER_LNG: string
  readonly VITE_DEFAULT_MAP_CENTER_LAT: string
  readonly VITE_DEFAULT_MAP_ZOOM: string
  readonly VITE_MAP_STYLE: string

  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_AUTH_TOKEN: string
  readonly VITE_LOCATION_TRACKER_ENDPOINT: string
  readonly VITE_USERS_ENDPOINT: string

  // Development Configuration
  readonly VITE_DEBUG_MODE: string
  readonly VITE_LOG_LEVEL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
