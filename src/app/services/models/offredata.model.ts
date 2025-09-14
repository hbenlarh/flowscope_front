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
    category_name?: string; // optional, we’ll map it from categories
  }