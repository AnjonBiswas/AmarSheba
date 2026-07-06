export function filterServices(services, labels, query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return services;
  }

  return services.filter((service) => {
    const details = labels.services?.[service.id];
    const content = [
      service.title_en,
      service.title_bn,
      service.description_en,
      service.description_bn,
      service.category,
      details?.title,
      details?.description,
      details?.overview,
      details?.eligibility,
      details?.fees,
      details?.timeline,
      ...(details?.requiredDocuments || []),
      ...(details?.steps || []),
      ...(details?.checklist || []),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return content.includes(normalizedQuery);
  });
}
