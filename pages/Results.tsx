
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, SearchFilters, ChatMessage } from '../types';
import { mockListings, FALLBACK_IMAGE } from '../data/listings';
import { startChat } from '../services/localChatService';

interface ResultsProps {
  filters: SearchFilters;
  onFilterChange: (filters: SearchFilters) => void;
}

type SortOption = 'newest' | 'price-asc' | 'price-desc';

const LOCATION_DATA = {
  'İstanbul': {
    'Beşiktaş': ['Bebek', 'Arnavutköy', 'Ortaköy', 'Etiler', 'Levent', 'Gayrettepe', 'Dikilitaş'],
    'Kadıköy': ['Moda', 'Caddebostan', 'Suadiye', 'Feneryolu', 'Erenköy', 'Göztepe', 'Bostancı'],
    'Şişli': ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ'],
    'Beylikdüzü': ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil']
  }
};

const ROOM_COUNTS = ['1+0', '1+1', '2+1', '3+1', '4+1', '4+2'];
const SOURCE_LOGOS: Record<string, string> = {
  'Hepsiemlak': 'https://www.hepsiemlak.com/favicon.ico',
  'Emlakjet': 'https://www.emlakjet.com/favicon.ico'
};

const Results: React.FC<ResultsProps> = ({ filters, onFilterChange }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // AI Chat States
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Filtreleri senin için güncelleyebilirim! Ne aramıştın?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatRef.current = startChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleAISend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      let response = await chatRef.current.sendMessage({ message: text });
      
      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', content: response.text! }]);
      }

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'search_homes') {
            const aiFilters = fc.args as SearchFilters;
            onFilterChange({
              ...filters,
              ...aiFilters
            });
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: 'Üzgünüm, şu an bağlantı kuramıyorum.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const startVoice = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return alert("Tarayıcı desteklemiyor.");
    const rec = new Recognition();
    rec.lang = 'tr-TR';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => handleAISend(e.results[0][0].transcript);
    rec.start();
  };

  const filteredListings = useMemo(() => {
    return mockListings.filter(listing => {
      let match = true;
      if (filters.province && listing.province !== filters.province) match = false;
      if (filters.district && listing.location !== filters.district) match = false;
      if (filters.neighborhoods && filters.neighborhoods.length > 0) {
        if (!filters.neighborhoods.includes(listing.neighborhood)) match = false;
      }
      if (filters.dealType && listing.dealType !== filters.dealType) match = false;
      if (filters.roomCount && !listing.roomCount.includes(filters.roomCount)) match = false;
      if (filters.inSite !== undefined && filters.inSite && !listing.inSite) match = false;
      if (filters.minPrice !== undefined && listing.price < filters.minPrice) match = false;
      if (filters.maxPrice !== undefined && listing.price > filters.maxPrice) match = false;
      return match;
    });
  }, [filters]);

  const sortedListings = useMemo(() => {
    const sorted = [...filteredListings];
    switch (sortBy) {
      case 'newest': return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      default: return sorted;
    }
  }, [filteredListings, sortBy]);

  const AIChatSidebar = () => (
    <div className="bg-slate-900 rounded-3xl p-1 shadow-xl mb-8 overflow-hidden border border-slate-800">
      <div className="bg-white rounded-[23px] flex flex-col h-[320px]">
        <div className="p-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.43 5.17L2.1 21.4c-.11.38.25.74.63.63l4.23-1.33C8.35 21.48 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
            </div>
            <h4 className="font-medium text-slate-900 text-[10px] uppercase tracking-wider">AI Asistan</h4>
          </div>
          <div className="flex items-center gap-1.5">
             <span className="text-[8px] font-medium text-slate-400 uppercase tracking-widest">Senkronize</span>
             <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex-grow overflow-y-auto p-3 space-y-3 hide-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] px-3 py-2 rounded-xl text-[11px] font-medium ${m.role === 'user' ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="flex gap-1 p-1"><span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce"></span><span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce delay-75"></span><span className="w-1 h-1 bg-brand-400 rounded-full animate-bounce delay-150"></span></div>}
        </div>

        <div className="p-3 border-t border-slate-100">
          <div className="flex gap-1 items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
            <button onClick={startVoice} className={`p-1.5 rounded-lg transition-colors ${isListening ? 'bg-red-500 text-white' : 'text-slate-400 hover:bg-slate-200'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </button>
            <input className="flex-grow bg-transparent border-none text-[11px] font-medium focus:ring-0 placeholder:text-slate-400" placeholder="Filtrele..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAISend(input)} />
            <button onClick={() => handleAISend(input)} className="w-7 h-7 bg-brand-500 text-white rounded-lg flex items-center justify-center hover:bg-brand-600 transition-transform active:scale-90"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
          </div>
        </div>
      </div>
    </div>
  );

  const SidebarContent = () => {
    const provinceOptions = Object.keys(LOCATION_DATA);
    const districtOptions = filters.province ? Object.keys(LOCATION_DATA[filters.province as keyof typeof LOCATION_DATA]) : [];
    const neighborhoodOptions = (filters.province && filters.district) ? LOCATION_DATA[filters.province as keyof typeof LOCATION_DATA][filters.district as keyof (typeof LOCATION_DATA)['İstanbul']] : [];

    return (
      <div className="space-y-8 p-1">
        <AIChatSidebar />
        
        <div className="space-y-4">
          <h4 className="font-medium text-xs mb-4 uppercase tracking-wider text-slate-400">Konum Seçimi</h4>
          <div className="space-y-1">
            <label className="text-[10px] font-medium uppercase text-slate-400 pl-1">İl</label>
            <select 
              value={filters.province || ''} 
              onChange={(e) => onFilterChange({ ...filters, province: e.target.value, district: undefined, neighborhoods: [] })}
              className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-0 outline-none transition-all"
            >
              <option value="">Seçiniz</option>
              {provinceOptions.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {filters.province && (
            <div className="space-y-1 animate-fadeIn">
              <label className="text-[10px] font-medium uppercase text-slate-400 pl-1">İlçe</label>
              <select 
                value={filters.district || ''} 
                onChange={(e) => onFilterChange({ ...filters, district: e.target.value, neighborhoods: [] })}
                className="w-full px-3 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:border-brand-500 focus:ring-0 outline-none transition-all"
              >
                <option value="">Seçiniz</option>
                {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {filters.district && (
            <div className="space-y-2 animate-fadeIn">
              <label className="text-[10px] font-medium uppercase text-slate-400 pl-1">Mahalle</label>
              <div className="max-h-48 overflow-y-auto pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-brand-200">
                {neighborhoodOptions.map(n => (
                  <label key={n} className="flex items-center gap-3 cursor-pointer group py-1 px-2 hover:bg-brand-50 rounded-lg transition-colors">
                    <input 
                      type="checkbox" 
                      checked={filters.neighborhoods?.includes(n) || false} 
                      onChange={() => {
                        const newN = filters.neighborhoods?.includes(n) 
                          ? filters.neighborhoods.filter(x => x !== n) 
                          : [...(filters.neighborhoods || []), n];
                        onFilterChange({ ...filters, neighborhoods: newN });
                      }} 
                      className="w-4 h-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500 cursor-pointer" 
                    />
                    <span className="text-xs font-medium text-slate-600 group-hover:text-brand-600 transition-colors">{n}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <h4 className="font-medium text-xs mb-4 uppercase tracking-wider text-slate-400">İlan Tipi</h4>
          <div className="grid grid-cols-1 gap-2">
            {['Satılık', 'Kiralık', 'Günlük Kiralık'].map(type => (
              <button 
                key={type}
                onClick={() => onFilterChange({ ...filters, dealType: filters.dealType === type ? undefined : (type as any) })}
                className={`py-2.5 px-4 text-[11px] font-medium uppercase tracking-wider rounded-xl border-2 text-left transition-all ${filters.dealType === type ? 'bg-brand-500 border-brand-500 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-500 hover:border-brand-100'}`}
                style={filters.dealType === type ? {boxShadow: '0 10px 15px -3px rgba(250, 1, 117, 0.2)'} : {}}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-xs mb-4 uppercase tracking-wider text-slate-400">Fiyat Aralığı</h4>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="Min" value={filters.minPrice || ''} onChange={(e) => onFilterChange({ ...filters, minPrice: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-3 py-2.5 text-xs font-medium border-2 border-slate-100 rounded-xl outline-none focus:border-brand-500 bg-slate-50 transition-all" />
            <input type="number" placeholder="Max" value={filters.maxPrice || ''} onChange={(e) => onFilterChange({ ...filters, maxPrice: e.target.value ? parseInt(e.target.value) : undefined })} className="w-full px-3 py-2.5 text-xs font-medium border-2 border-slate-100 rounded-xl outline-none focus:border-brand-500 bg-slate-50 transition-all" />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-xs mb-4 uppercase tracking-wider text-slate-400">Oda Sayısı</h4>
          <div className="grid grid-cols-3 gap-2">
            {ROOM_COUNTS.map(rc => (
              <button key={rc} onClick={() => onFilterChange({ ...filters, roomCount: filters.roomCount === rc ? undefined : rc })} className={`py-2 text-[10px] font-medium rounded-lg border-2 transition-all ${filters.roomCount === rc ? 'bg-brand-500 border-brand-500 text-white shadow-md' : 'bg-white border-slate-100 text-slate-500 hover:border-brand-50'}`}>{rc}</button>
            ))}
          </div>
        </div>

        <button onClick={() => onFilterChange({})} className="w-full py-4 text-[11px] font-medium uppercase tracking-widest text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-2xl transition-all active:scale-95 shadow-sm">Tüm Filtreleri Sıfırla</button>
      </div>
    );
  };

  return (
    <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 py-8">
      <div className="md:hidden flex flex-col gap-4 mb-6">
        <AIChatSidebar />
        <div className="flex gap-4">
          <button onClick={() => setIsMobileFilterOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-medium text-[11px] uppercase tracking-wider shadow-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
            Filtrele
          </button>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="flex-1 px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl font-medium text-[11px] uppercase tracking-wider shadow-sm outline-none">
            <option value="newest">En Yeni</option>
            <option value="price-asc">Artan Fiyat</option>
            <option value="price-desc">Azalan Fiyat</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        <aside className="hidden md:block w-72 shrink-0">
          <div className="sticky top-28 overflow-y-auto max-h-[calc(100vh-140px)] pr-4 hide-scrollbar">
            <h2 className="text-xl font-medium text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-tighter">İlanları Filtrele</h2>
            <SidebarContent />
          </div>
        </aside>

        <main className="flex-grow">
          <div className="hidden md:flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
            <div className="text-sm font-medium text-slate-500">
              <span className="font-medium text-slate-900 px-2 py-1 bg-brand-50 rounded-lg text-brand-600 mr-2">{sortedListings.length}</span> ilan kriterlerinle eşleşiyor
            </div>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="px-4 py-2 border-2 border-slate-100 rounded-xl text-xs font-medium uppercase tracking-wider bg-white focus:outline-none focus:border-brand-500 transition-all cursor-pointer">
              <option value="newest">En Yeni İlanlar</option>
              <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
            </select>
          </div>

          {sortedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
              {sortedListings.map((listing) => (
                <div key={listing.id} onClick={() => navigate(`/details/${listing.id}`)} className="cursor-pointer group flex flex-col">
                  <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden mb-4 bg-slate-100 shadow-sm border border-slate-100">
                    <img 
                        src={listing.imageUrl} 
                        alt={listing.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        onError={handleImageError}
                        loading="lazy"
                    />
                    <div className="absolute top-4 right-4">
                      <button className="w-9 h-9 bg-white/95 rounded-full flex items-center justify-center text-slate-300 hover:text-brand-500 transition-all shadow-md active:scale-90"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg></button>
                    </div>
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/40">
                         <img src={SOURCE_LOGOS[listing.sourceName]} alt={listing.sourceName} className="w-3.5 h-3.5 rounded-sm object-contain" />
                         <span className="text-[9px] font-medium text-slate-900 uppercase tracking-tighter">{listing.sourceName}</span>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] text-white font-medium uppercase tracking-widest">{listing.location}</div>
                  </div>
                  <div className="flex-grow space-y-2 px-1">
                    <h3 className="font-medium text-[15px] leading-tight text-slate-900 line-clamp-2 uppercase tracking-tight group-hover:text-brand-600 transition-colors">{listing.neighborhood}, {listing.location}</h3>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                      <span>{listing.roomCount}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span>{listing.area} m²</span>
                    </div>
                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-2xl font-medium text-brand-600 tracking-tighter">{listing.price.toLocaleString('tr-TR')}</span>
                      <span className="text-[10px] font-medium text-slate-900 uppercase tracking-widest">TL {listing.dealType.includes('Kiralık') ? '/ AY' : ''}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 border-4 border-dotted border-slate-100 rounded-[60px] bg-slate-50/50">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h2 className="text-2xl font-medium text-slate-900 mb-2 uppercase tracking-tighter">İlan bulunamadı</h2>
              <p className="text-slate-400 font-medium mb-10">Kriterlerini değiştirerek veya asistanımıza sorarak tekrar deneyebilirsin.</p>
              <button onClick={() => onFilterChange({})} className="px-12 py-5 bg-brand-600 text-white font-medium rounded-2xl shadow-2xl active:scale-95 transition-all" style={{boxShadow: '0 25px 50px -12px rgba(250, 1, 117, 0.3)'}}>Filtreleri Sıfırla</button>
            </div>
          )}
        </main>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[200] md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)}></div>
          <div className="absolute bottom-0 left-0 right-0 top-10 bg-white rounded-t-[40px] overflow-hidden flex flex-col shadow-2xl animate-slideUp">
            <div className="flex items-center justify-between p-8 border-b border-slate-100">
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 -ml-2 text-slate-900 font-medium uppercase text-xs">Vazgeç</button>
              <h3 className="text-lg font-medium uppercase tracking-tight">İlanları Filtrele</h3>
              <button onClick={() => onFilterChange({})} className="text-xs font-medium uppercase text-brand-600 underline">Sıfırla</button>
            </div>
            <div className="flex-grow overflow-y-auto p-10"><SidebarContent /></div>
            <div className="p-8 bg-slate-50 border-t border-slate-100">
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-full py-5 bg-brand-600 text-white font-medium rounded-2xl shadow-xl" style={{boxShadow: '0 20px 25px -5px rgba(250, 1, 117, 0.3)'}}>Sonuçları Listele</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;
