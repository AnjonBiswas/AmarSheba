export const services = [
  {
    id: 'identity',
    accent: 'bg-sheba-600',
    officialLink: 'https://services.nidw.gov.bd/',
    related: ['passport', 'tax', 'probashi'],
  },
  {
    id: 'passport',
    accent: 'bg-river',
    officialLink: 'https://www.epassport.gov.bd/',
    related: ['identity', 'probashi', 'police'],
  },
  {
    id: 'driving-license',
    accent: 'bg-harvest',
    officialLink: 'https://bsp.brta.gov.bd/',
    related: ['identity', 'police', 'tax'],
  },
  {
    id: 'land',
    accent: 'bg-sheba-700',
    officialLink: 'https://land.gov.bd/',
    related: ['court', 'tax', 'identity'],
  },
  {
    id: 'court',
    accent: 'bg-slate-700',
    officialLink: 'https://www.judiciary.gov.bd/',
    related: ['land', 'police', 'identity'],
  },
  {
    id: 'police',
    accent: 'bg-clay',
    officialLink: 'https://www.police.gov.bd/',
    related: ['court', 'passport', 'identity'],
  },
  {
    id: 'tax',
    accent: 'bg-emerald-700',
    officialLink: 'https://etaxnbr.gov.bd/',
    related: ['identity', 'trade-license', 'land'],
  },
  {
    id: 'trade-license',
    accent: 'bg-cyan-700',
    officialLink: 'https://bangladesh.gov.bd/',
    related: ['tax', 'identity', 'utility'],
  },
  {
    id: 'education',
    accent: 'bg-indigo-700',
    officialLink: 'https://educationboard.gov.bd/',
    related: ['identity', 'jobs', 'social-welfare'],
  },
  {
    id: 'health',
    accent: 'bg-rose-700',
    officialLink: 'https://www.dghs.gov.bd/',
    related: ['identity', 'social-welfare', 'utility'],
  },
  {
    id: 'jobs',
    accent: 'bg-violet-700',
    officialLink: 'https://bmet.gov.bd/',
    related: ['education', 'probashi', 'identity'],
  },
  {
    id: 'utility',
    accent: 'bg-yellow-600',
    officialLink: 'https://bangladesh.gov.bd/',
    related: ['identity', 'land', 'trade-license'],
  },
  {
    id: 'social-welfare',
    accent: 'bg-pink-700',
    officialLink: 'https://dss.gov.bd/',
    related: ['identity', 'health', 'education'],
  },
  {
    id: 'probashi',
    accent: 'bg-teal-700',
    officialLink: 'https://probashi.gov.bd/',
    related: ['passport', 'jobs', 'identity'],
  },
];

export function getServiceById(serviceId) {
  return services.find((service) => service.id === serviceId);
}
