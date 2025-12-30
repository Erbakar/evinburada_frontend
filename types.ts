
export interface Listing {
  id: string;
  title: string;
  price: number;
  province: string; // İl
  location: string; // İlçe
  neighborhood: string; // Mahalle
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
  province?: string;
  district?: string;
  neighborhoods?: string[];
  dealType?: 'Kiralık' | 'Satılık' | 'Günlük Kiralık';
  roomCount?: string;
  inSite?: boolean;
  minPrice?: number;
  maxPrice?: number;
  // Geriye dönük uyumluluk veya AI için genel aramalar:
  locations?: string[]; 
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
