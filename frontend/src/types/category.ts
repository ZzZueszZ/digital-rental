export interface CategoryResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  code: string;
  name: string;
  description?: string;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryCriteria {
  keyword?: string;
  activeOnly?: boolean;
}
