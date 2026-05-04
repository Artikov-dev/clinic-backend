import { PaginationQuery, PaginatedResponse } from '../types';

export const parsePagination = (query: PaginationQuery) => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const offset = (page - 1) * limit;
  const order = query.order === 'asc' ? 'asc' : 'desc';
  return { page, limit, offset, order, search: query.search, sort: query.sort };
};

export const buildPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  },
});
