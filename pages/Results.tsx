
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, SearchFilters } from '../types';

interface ResultsProps {
  listings: Listing[];
  filters: SearchFilters;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const Results: React.FC<ResultsProps> = ({ listings, filters }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const sortedListings = useMemo(() => {
    const sorted = [...listings];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }, [listings, sortBy]);

  return (
    <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 py-8">
      {/* Category Icons (Airbnb style placeholder) */}
      <div className="flex items-center gap-10 overflow-x-auto hide-scrollbar mb-10 border-b border-slate-100 pb-4">
        {['Yeni', 'Lüks', 'Site İçi', 'Sahil', 'Dubleks', 'Stüdyo', 'Trend'].map((cat, i) => (
          <div key={i} className="flex flex-col items-center gap-2 opacity-60 hover:opacity-100 cursor-pointer transition-opacity border-b-2 border-transparent hover:border-slate-300 pb-2 flex-shrink-0">
             <div className="w-6 h-6 bg-slate-200 rounded-md"></div>
             <span className="text-xs font-semibold whitespace-nowrap">{cat}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-3 flex-shrink-0 pl-10">
           <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors text-xs font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Filtreler
           </div>
           <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="appearance-none px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer text-xs font-semibold bg-white pr-8 focus:outline-none"
           >
             <option value="newest">En Yeni İlanlar</option>
             <option value="price-asc">Fiyat (Önce Düşük)</option>
             <option value="price-desc">Fiyat (Önce Yüksek)</option>
           </select>
        </div>
      </div>

      {sortedListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {sortedListings.map((listing) => (
            <div 
              key={listing.id} 
              onClick={() => navigate(`/details/${listing.id}`)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-slate-100">
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button className="absolute top-3 right-3 text-white/90 hover:text-white hover:scale-110 transition-all">
                  <svg className="w-6 h-6 drop-shadow-md" fill="rgba(0,0,0,0.5)" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </button>
                {listing.inSite && (
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold text-slate-900">
                    SİTE İÇİNDE
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[15px] line-clamp-1">{listing.neighborhood}, {listing.location}</h3>
                  <div className="flex items-center gap-1 text-sm">
                    <svg className="w-3.5 h-3.5 text-slate-900" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="font-normal text-slate-900">4.9</span>
                  </div>
                </div>
                <p className="text-slate-500 text-sm">{listing.roomCount} • {listing.area} m²</p>
                <p className="text-slate-500 text-sm">İlan tarihi: {new Date(listing.createdAt).toLocaleDateString('tr-TR')}</p>
                <div className="pt-1 flex items-baseline gap-1">
                  <span className="font-bold text-[15px]">{listing.price.toLocaleString('tr-TR')} TL</span>
                  <span className="text-sm font-normal text-slate-900">/{listing.dealType === 'Kiralık' ? 'ay' : 'toplam'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-[32px] bg-slate-50">
          <h2 className="text-2xl font-bold mb-2">Eşleşen sonuç yok</h2>
          <p className="text-slate-500">Kriterlerinizi değiştirmeyi veya yapay zeka ile tekrar konuşmayı deneyin.</p>
          <button onClick={() => navigate('/')} className="mt-8 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all">Aramayı Sıfırla</button>
        </div>
      )}
    </div>
  );
};

export default Results;
