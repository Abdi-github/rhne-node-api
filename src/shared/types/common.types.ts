export interface PaginationOptions {
  page: number;
  limit: number;
  sort: string;
  search?: string;
  filters?: Record<string, unknown>;
}

export interface PaginationResult {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationResult;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
  pagination?: PaginationResult;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details: unknown[];
  };
}
