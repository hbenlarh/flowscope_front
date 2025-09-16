export interface Offer {
    offer_id: number;
    client_id: number;
    name: string;
    description: string;
    url: string;
    file_id: number;
    category_id: number;
    is_active: boolean;
    is_visible: boolean;
    file_name: string;
    file_extension: string;
    file: string; // Base64 string
    category_name?: string; // optional, we'll map it from categories
    upvotes?: number; // number of upvotes
    is_featured?: boolean; // whether the offer is featured
    is_top?: boolean; // whether the offer is marked as top
  }

export interface PaginatedResponse<T> {
  items?: T[];
  offers?: T[];
  data?: T[];
  results?: T[];
  total_items?: number;
  total?: number;
  page_number?: number;
  page_size?: number;
  total_pages?: number;
}

export interface PaginationParams {
  page_number: number;
  page_size: number;
}