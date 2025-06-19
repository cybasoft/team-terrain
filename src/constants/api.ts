
import { config } from '../config/env';

export const API_ENDPOINTS = {
  LOCATION_TRACKER: `${config.api.baseUrl}${config.api.endpoints.locationTracker}`,
  USERS: `${config.api.baseUrl}${config.api.endpoints.users}`
} as const;
