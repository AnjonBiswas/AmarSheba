import { emergencyServices } from '../data/emergencyServices.js';
import { ADMIN_STORAGE_KEYS, readJson, writeJson } from './adminStorage.js';

export const EMERGENCY_FAVORITES_KEY = 'amarsheba_emergency_favorites';

export function readEmergencyServices() {
  return readJson(ADMIN_STORAGE_KEYS.emergencyServices, emergencyServices);
}

export function writeEmergencyServices(services) {
  writeJson(ADMIN_STORAGE_KEYS.emergencyServices, services);
}

export function readEmergencyFavorites() {
  return readJson(EMERGENCY_FAVORITES_KEY, []);
}

export function writeEmergencyFavorites(favorites) {
  writeJson(EMERGENCY_FAVORITES_KEY, favorites);
}

export function getLocalizedEmergency(service, locale) {
  return {
    ...service,
    displayName: locale === 'bn' ? service.nameBn || service.name : service.name,
    displayDescription: locale === 'bn' ? service.descriptionBn || service.description : service.description,
  };
}
