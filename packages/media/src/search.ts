export interface CloudinarySearchFilters {
  projectId?: string;
  siteId?: string;
  trustMin?: number;
  activity?: string;
  resourceType?: "image" | "video";
  fromDate?: string;
  toDate?: string;
}

export function buildCloudinarySearchExpression(
  textQuery?: string,
  filters: CloudinarySearchFilters = {}
): string {
  const parts: string[] = [];

  parts.push(`resource_type:${filters.resourceType || "image"}`);

  if (filters.projectId) {
    parts.push(`metadata.sk_project="${filters.projectId}"`);
  }
  if (filters.siteId) {
    parts.push(`metadata.sk_site="${filters.siteId}"`);
  }
  if (filters.trustMin !== undefined) {
    parts.push(`metadata.sk_trust>=${filters.trustMin}`);
  }
  if (filters.activity) {
    parts.push(`tags:sk:activity:${filters.activity}`);
  }
  if (textQuery && textQuery.trim()) {
    parts.push(textQuery.trim());
  }

  return parts.join(" AND ");
}
