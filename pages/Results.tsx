
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, SearchFilters } from '../types';

interface ResultsProps {
  listings: Listing[];
  filters: SearchFilters;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const DISTRICTS = ['Beylikdüzü', 'Şişli'];
const NEIGHBORHOODS: Record<string, string[]> = {
  'Beylikdüzü': ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'],
  'Şişli': ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ']
};
const ROOM_COUNTS = ['1+0', '1+1', '2+1', '3+1', '4+1', '4+2'];

const Results: React.FC<ResultsProps> = ({ listings, filters }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [activeDistrict, setActiveDistrict] = useState<string>('Beylikdüzü');

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const toggleNeighborhood = (name: string) => {
    setLocalFilters(prev => {
      const locations = prev.locations || [];
      if (locations.includes(name)) {
        return { ...prev, locations: locations.filter(l => l !== name) };
      } else {
        return { ...prev, locations: [...locations, name] };
      }
    });
  };

  const setDealType = (type: any) => {
    setLocalFilters(prev => ({ ...prev, dealType: prev.dealType === type ? undefined : type }));
  };

  const toggleRoomCount = (count: string) => {
    setLocalFilters(prev => ({ ...prev, roomCount: prev.roomCount === count ? undefined : count }));
  };

  const toggleInSite = () => {
    setLocalFilters(prev => ({ ...prev, inSite: !prev.inSite }));
  };

  const handlePriceChange = (type: 'min' | 'max', val: string) => {
    const num = val ? parseInt(val) : undefined;
    setLocalFilters(prev => ({ ...prev, [type === 'min' ? 'minPrice' : 'maxPrice']: num }));
  };

  const filteredListings = useMemo(() => {
    return listings.filter(listing => {
      let match = true;
      if (localFilters.dealType && listing.dealType !== localFilters.dealType) match = false;
      if (localFilters.roomCount && !listing.roomCount.includes(localFilters.roomCount)) match = false;
      if (localFilters.inSite !== undefined && localFilters.inSite && !listing.inSite) match = false;
      if (localFilters.minPrice !== undefined && listing.price < localFilters.minPrice) match = false;
      if (localFilters.maxPrice !== undefined && listing.price > localFilters.maxPrice) match = false;
      if (localFilters.locations && localFilters.locations.length > 0) {
        if (!localFilters.locations.some(loc => 
          listing.neighborhood.toLowerCase().includes(loc.toLowerCase()) ||
          listing.location.toLowerCase().includes(loc.toLowerCase())
        )) match = false;
      }
      return match;
    });
  }, [listings, localFilters]);

  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    switch (sortBy) {
      case 'newest': return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      default: return sorted;
    }
  }, [filteredListings, sortBy]);

  const SidebarContent = () => (
    <div className="space-y-8 p-1">
      <div>
        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">Konum</h4>
        <div className="flex gap-1 mb-4">
          {DISTRICTS.map(d => (
            <button 
              key={d} 
              onClick={() => setActiveDistrict(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeDistrict === d ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="max-h-48 overflow-y-auto pr-2 space-y-1 scrollbar-thin scrollbar-thumb-orange-200">
          {NEIGHBORHOODS[activeDistrict].map(n => (
            <label key={n} className="flex items-center gap-3 cursor-pointer group py-1">
              <input type="checkbox" checked={localFilters.locations?.includes(n) || false} onChange={() => toggleNeighborhood(n)} className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 cursor-pointer" />
              <span className="text-sm text-slate-600 group-hover:text-orange-600 transition-colors">{n}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">İlan Tipi</h4>
        <div className="grid grid-cols-1 gap-2">
          {['Satılık', 'Kiralık', 'Günlük Kiralık'].map(type => (
            <button 
              key={type}
              onClick={() => setDealType(type)}
              className={`py-2 px-3 text-xs font-bold rounded-lg border text-left transition-all ${localFilters.dealType === type ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-orange-200'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">Fiyat</h4>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={localFilters.minPrice || ''} onChange={(e) => handlePriceChange('min', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-orange-500" />
          <input type="number" placeholder="Max" value={localFilters.maxPrice || ''} onChange={(e) => handlePriceChange('max', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-orange-500" />
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm mb-4 uppercase tracking-wider text-slate-400">Oda Sayısı</h4>
        <div className="grid grid-cols-3 gap-2">
          {ROOM_COUNTS.map(rc => (
            <button key={rc} onClick={() => toggleRoomCount(rc)} className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${localFilters.roomCount === rc ? 'bg-orange-500 border-orange-500 text-white' : 'bg-white border-slate-200 text-slate-600'}`}>{rc}</button>
          ))}
        </div>
      </div>

      <button onClick={() => setLocalFilters({})} className="w-full py-3 text-sm font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition-all">Sıfırla</button>
    </div>
  );

  return (
    <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 py-8">
      <div className="md:hidden flex gap-4 mb-6">
        <button onClick={() => setIsMobileFilterOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm">Filtrele</button>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm">
          <option value="newest">En Yeni</option>
          <option value="price-asc">Artan Fiyat</option>
          <option value="price-desc">Azalan Fiyat</option>
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="hidden md:block w-72 shrink-0">
          <div className="sticky top-28 overflow-y-auto max-h-[calc(100vh-140px)] pr-4 hide-scrollbar">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">Filtrele</h2>
            <SidebarContent />
          </div>
        </aside>

        <main className="flex-grow">
          <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="text-sm font-medium text-slate-500"><span className="font-bold text-slate-900">{sortedListings.length}</span> ilan bulundu</div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-bold bg-white focus:outline-none">
              <option value="newest">En Yeni İlanlar</option>
              <option value="price-asc">Fiyat (Önce Düşük)</option>
              <option value="price-desc">Fiyat (Önce Yüksek)</option>
            </select>
          </div>

          {sortedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
              {sortedListings.map((listing) => (
                <div key={listing.id} onClick={() => navigate(`/details/${listing.id}`)} className="cursor-pointer group flex flex-col">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4 bg-slate-100 shadow-sm border border-slate-100">
                    <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute top-3 right-3"><button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center text-slate-400 hover:text-orange-500"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></button></div>
                    {listing.dealType === 'Günlük Kiralık' && <div className="absolute top-3 left-3 bg-purple-600 text-white px-3 py-1 rounded-lg text-[10px] font-black shadow-lg">GÜNLÜK</div>}
                    <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded-md text-[10px] text-white font-bold">{listing.location}</div>
                  </div>
                  <div className="flex-grow space-y-1.5 px-1">
                    <h3 className="font-extrabold text-[15px] leading-tight text-slate-800 line-clamp-2 uppercase">{listing.neighborhood}, {listing.location}</h3>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span>{listing.roomCount}</span>
                      <span>{listing.area} m²</span>
                    </div>
                    <div className="pt-2 flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-orange-600 tracking-tight">{listing.price.toLocaleString('tr-TR')}</span>
                      <span className="text-sm font-bold text-slate-900 uppercase">TL {listing.dealType.includes('Kiralık') ? '/ süreli' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-100 rounded-[40px] bg-slate-50/50">
              <h2 className="text-2xl font-black text-slate-900 mb-2">Eşleşen sonuç yok</h2>
              <button onClick={() => setLocalFilters({})} className="mt-8 px-10 py-4 bg-orange-600 text-white font-black rounded-2xl">Tüm İlanları Gör</button>
            </div>
          )}
        </main>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 top-10 bg-white rounded-t-[32px] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 -ml-2 text-slate-900">Kapat</button>
              <h3 className="text-lg font-black uppercase">Filtreler</h3>
              <button onClick={() => setLocalFilters({})} className="text-sm font-bold text-orange-600">Sıfırla</button>
            </div>
            <div className="flex-grow overflow-y-auto p-8"><SidebarContent /></div>
            <div className="p-6 bg-white border-t border-slate-100"><button onClick={() => setIsMobileFilterOpen(false)} className="w-full py-4 bg-orange-600 text-white font-black rounded-2xl">Sonuçları Göster</button></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
