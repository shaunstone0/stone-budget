// Base API response structure
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Paginated response structure
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Authentication response
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
