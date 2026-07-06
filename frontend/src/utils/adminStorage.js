export const ADMIN_STORAGE_KEYS = {
  serviceOverrides: 'amarsheba_service_overrides',
  notices: 'amarsheba_notices',
  faqs: 'amarsheba_custom_faqs',
  customReplies: 'amarsheba_custom_replies',
  emergencyServices: 'amarsheba_emergency_services',
};

export function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createLocalId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getServiceOverride(serviceId) {
  const overrides = readJson(ADMIN_STORAGE_KEYS.serviceOverrides, {});
  return overrides[serviceId] || {};
}

export function getServiceContent(serviceId, translations) {
  const base = translations.services[serviceId];
  const override = getServiceOverride(serviceId);

  if (!base) {
    return null;
  }

  return {
    ...base,
    title: override.title || base.title,
    description: override.description || base.description,
  };
}

export function getCustomFaqs(serviceId) {
  const faqs = readJson(ADMIN_STORAGE_KEYS.faqs, {});
  return faqs[serviceId] || [];
}

