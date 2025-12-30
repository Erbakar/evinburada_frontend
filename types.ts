
export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  neighborhood: string;
  roomCount: string;
  area: number;
  dealType: 'Kiralık' | 'Satılık' | 'Günlük Kiralık';
  inSite: boolean;
  sourceName: 'Hepsiemlak' | 'Emlakjet';
  sourceUrl: string;
  description: string;
  imageUrl: string;
  createdAt: string; // ISO date string
}

export interface SearchFilters {
  locations?: string[];
  dealType?: 'Kiralık' | 'Satılık' | 'Günlük Kiralık';
  roomCount?: string;
  inSite?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
