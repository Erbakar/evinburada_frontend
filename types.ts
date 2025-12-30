
export interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  neighborhood: string;
  roomCount: string;
  area: number;
  dealType: 'Kiralık' | 'Satılık';
  inSite: boolean;
  sourceName: 'Hepsiemlak' | 'Emlakjet';
  sourceUrl: string;
  description: string;
  imageUrl: string;
}

export interface SearchFilters {
  location?: string;
  dealType?: 'Kiralık' | 'Satılık';
  roomCount?: string;
  inSite?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
