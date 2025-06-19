// Environment configuration
export const config = {
  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Employees Map',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
    isDevelopment: import.meta.env.VITE_NODE_ENV === 'development',
    isProduction: import.meta.env.VITE_NODE_ENV === 'production',
  },

  // Mapbox Configuration
  mapbox: {
    accessToken: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '',
    defaultCenter: {
      lng: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LNG || '36.8219'),
      lat: parseFloat(import.meta.env.VITE_DEFAULT_MAP_CENTER_LAT || '-1.2921'),
    },
    defaultZoom: parseInt(import.meta.env.VITE_DEFAULT_MAP_ZOOM || '10'),
    mapStyle: import.meta.env.VITE_MAP_STYLE || 'mapbox://styles/mapbox/light-v11',
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'https://n8.cybasoft.com',
    authToken: import.meta.env.VITE_API_AUTH_TOKEN || '',
    endpoints: {
      locationTracker: import.meta.env.VITE_LOCATION_TRACKER_ENDPOINT || '/webhook-test/fa854d30-aefc-4f26-b3d7-e38a1551e448',
      users: import.meta.env.VITE_USERS_ENDPOINT || '/webhook-test/c853c89e-8a9f-49ee-84e6-586c1552c42f',
    },
  },

  // Development Configuration
  debug: {
    enabled: import.meta.env.VITE_DEBUG_MODE === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
} as const;

// Helper function to validate required environment variables
export const validateEnvironment = () => {
  const requiredVars = [
    'VITE_MAPBOX_ACCESS_TOKEN',
    'VITE_API_AUTH_TOKEN', // Now required for authentication
  ];

  const missingRequired = requiredVars.filter(
    (varName) => !import.meta.env[varName] || 
    import.meta.env[varName] === 'your_mapbox_token_here' ||
    import.meta.env[varName] === 'your_api_auth_token_here'
  );

  if (missingRequired.length > 0) {
    console.warn(
      `Missing required environment variables: ${missingRequired.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    );
  }

  return missingRequired.length === 0;
};
