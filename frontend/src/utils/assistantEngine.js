import { ADMIN_STORAGE_KEYS, readJson } from './adminStorage.js';

const serviceKeywords = {
  identity: ['identity', 'nid', 'national id', 'voter', 'id card', 'পরিচয়', 'এনআইডি', 'জাতীয় পরিচয়', 'ভোটার'],
  passport: ['passport', 'e-passport', 'epassport', 'renew passport', 'পাসপোর্ট', 'ই-পাসপোর্ট'],
  'driving-license': ['driving', 'license', 'licence', 'brta', 'learner', 'ড্রাইভিং', 'লাইসেন্স', 'বিআরটিএ', 'লার্নার'],
  land: ['land', 'mutation', 'khatian', 'tax khajna', 'ভূমি', 'জমি', 'নামজারি', 'খতিয়ান', 'খাজনা'],
  court: ['court', 'case', 'judiciary', 'legal', 'certified copy', 'আদালত', 'মামলা', 'কোর্ট', 'আইন'],
  police: ['police', 'gd', 'clearance', 'complaint', 'পুলিশ', 'জিডি', 'ক্লিয়ারেন্স', 'অভিযোগ'],
  tax: ['tax', 'tin', 'e-tin', 'return', 'nbr', 'কর', 'ট্যাক্স', 'টিআইএন', 'রিটার্ন'],
  'trade-license': ['trade license', 'business license', 'city corporation', 'ট্রেড লাইসেন্স', 'ব্যবসা লাইসেন্স'],
  education: ['education', 'exam', 'result', 'certificate', 'scholarship', 'শিক্ষা', 'পরীক্ষা', 'ফলাফল', 'সনদ', 'বৃত্তি'],
  health: ['health', 'hospital', 'vaccine', 'doctor', 'medical', 'স্বাস্থ্য', 'হাসপাতাল', 'টিকা', 'চিকিৎসা'],
  jobs: ['job', 'jobs', 'career', 'training', 'bmet', 'চাকরি', 'জব', 'প্রশিক্ষণ', 'কর্মসংস্থান'],
  utility: ['utility', 'electricity', 'gas', 'water', 'bill', 'meter', 'বিদ্যুৎ', 'গ্যাস', 'পানি', 'বিল', 'মিটার'],
  'social-welfare': ['welfare', 'allowance', 'disability', 'elderly', 'ভাতা', 'প্রতিবন্ধী', 'সমাজসেবা', 'সামাজিক'],
  probashi: ['probashi', 'overseas', 'migrant', 'expatriate', 'migration', 'প্রবাসী', 'বিদেশ', 'অভিবাসন'],
};

const intentKeywords = {
  documents: ['document', 'documents', 'paper', 'papers', 'required', 'কাগজ', 'ডকুমেন্ট', 'লাগবে', 'প্রয়োজন'],
  fees: ['fee', 'fees', 'cost', 'payment', 'charge', 'ফি', 'খরচ', 'টাকা', 'পেমেন্ট'],
  timeline: ['time', 'timeline', 'long', 'days', 'deadline', 'সময়', 'কতদিন', 'সময়সীমা'],
  eligibility: ['eligible', 'eligibility', 'who can', 'যোগ্য', 'যোগ্যতা', 'কারা'],
  steps: ['step', 'steps', 'how', 'apply', 'guide', 'process', 'ধাপ', 'কিভাবে', 'আবেদন', 'প্রক্রিয়া'],
  checklist: ['checklist', 'prepare', 'ready', 'চেকলিস্ট', 'প্রস্তুতি'],
  officialLink: ['official', 'link', 'portal', 'website', 'অফিসিয়াল', 'লিংক', 'পোর্টাল', 'ওয়েবসাইট'],
};

function normalize(value) {
  return value.toLowerCase().trim();
}

function findServiceId(message) {
  const normalized = normalize(message);

  return Object.entries(serviceKeywords).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  )?.[0];
}

function findIntent(message) {
  const normalized = normalize(message);

  return Object.entries(intentKeywords).find(([, keywords]) =>
    keywords.some((keyword) => normalized.includes(keyword)),
  )?.[0] || 'overview';
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

export function generateAssistantReply(message, translations, services, locale) {
  const customReply = readJson(ADMIN_STORAGE_KEYS.customReplies, []).find((item) => {
    const keyword = normalize(item.keyword || '');
    return keyword && normalize(message).includes(keyword);
  });

  if (customReply?.reply) {
    return customReply.reply;
  }

  const serviceId = findServiceId(message);

  if (!serviceId) {
    const sampleServices = services
      .slice(0, 6)
      .map((service) => translations.services[service.id]?.title)
      .filter(Boolean)
      .join(', ');

    return translations.assistant.fallback.replace('{services}', sampleServices);
  }

  const service = services.find((item) => item.id === serviceId);
  const details = translations.services[serviceId];
  const intent = findIntent(message);
  const labels = translations.serviceDetails;
  const officialLine = `${labels.officialLink}: ${service.officialLink}`;

  const responseMap = {
    overview: `${details.title}\n\n${details.overview}\n\n${officialLine}`,
    documents: `${details.title} - ${labels.requiredDocuments}\n${formatList(details.requiredDocuments)}\n\n${translations.assistant.verifyOfficial}`,
    fees: `${details.title} - ${labels.fees}\n${details.fees}\n\n${translations.assistant.verifyOfficial}`,
    timeline: `${details.title} - ${labels.timeline}\n${details.timeline}\n\n${translations.assistant.verifyOfficial}`,
    eligibility: `${details.title} - ${labels.eligibility}\n${details.eligibility}`,
    steps: `${details.title} - ${labels.steps}\n${formatList(details.steps)}`,
    checklist: `${details.title} - ${labels.checklist}\n${formatList(details.checklist)}`,
    officialLink: `${details.title}\n${officialLine}`,
  };

  const related = service.related
    .map((relatedId) => translations.services[relatedId]?.title)
    .filter(Boolean)
    .join(', ');
  const relatedLabel = locale === 'bn' ? 'সম্পর্কিত সেবা' : 'Related services';

  return `${responseMap[intent]}\n\n${relatedLabel}: ${related}`;
}
