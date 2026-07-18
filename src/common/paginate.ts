export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  max?: number,
): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
}

export function paginate<T>(
  items: T[],
  page?: string,
  limit?: string,
): Paginated<T> {
  const safeLimit = parsePositiveInt(limit, DEFAULT_LIMIT, MAX_LIMIT);
  const safePage = parsePositiveInt(page, 1);
  const start = (safePage - 1) * safeLimit;

  return {
    data: items.slice(start, start + safeLimit),
    total: items.length,
    page: safePage,
    limit: safeLimit,
  };
}
