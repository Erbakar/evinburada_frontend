
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Details from './pages/Details';
import { Listing, SearchFilters } from './types';
import { mockListings } from './data/listings';

const NEIGHBORHOODS = ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'];
const ROOM_COUNTS = ['1+1', '2+1', '3+1', '4+1', '4+2'];

const AppContent: React.FC = () => {
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // Modal local state
  const [modalFilters, setModalFilters] = useState<SearchFilters>({});

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (filters: SearchFilters) => {
    console.log("Arama Filtreleri:", filters);
    setActiveFilters(filters);
    const results = mockListings.filter(listing => {
      let match = true;
      if (filters.dealType && listing.dealType !== filters.dealType) match = false;
      if (filters.roomCount && !listing.roomCount.includes(filters.roomCount)) match = false;
      if (filters.inSite !== undefined && filters.inSite && !listing.inSite) match = false;
      if (filters.minPrice !== undefined && listing.price < filters.minPrice) match = false;
      if (filters.maxPrice !== undefined && listing.price > filters.maxPrice) match = false;
      
      if (filters.locations && filters.locations.length > 0) {
        const locationMatch = filters.locations.some(loc => 
          listing.neighborhood.toLowerCase().includes(loc.toLowerCase()) || 
          listing.location.toLowerCase().includes(loc.toLowerCase())
        );
        if (!locationMatch) match = false;
      }
      return match;
    });
    setFilteredListings(results);
    navigate('/results');
  };

  const toggleNeighborhood = (name: string) => {
    setModalFilters(prev => {
      const locations = prev.locations || [];
      if (locations.includes(name)) {
        return { ...prev, locations: locations.filter(l => l !== name) };
      } else {
        return { ...prev, locations: [...locations, name] };
      }
    });
  };

  const applyModalFilters = () => {
    handleSearch(modalFilters);
    setIsFilterModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500 fill-current">
              <path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/>
            </svg>
            <h1 className="text-xl font-extrabold text-orange-600 tracking-tight hidden md:block">evinburada</h1>
          </div>

          {/* Pill Search - Triggers Modal */}
          <div 
            onClick={() => {
              setModalFilters(activeFilters);
              setIsFilterModalOpen(true);
            }}
            className="flex items-center gap-4 px-4 py-2 border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group"
          >
            <span className="text-xs font-bold px-2 text-slate-700 group-hover:text-orange-600 transition-colors">Bölge Seçin</span>
            <div className="w-[1px] h-4 bg-slate-200"></div>
            <span className="text-xs font-bold px-2 text-slate-700 group-hover:text-orange-600 transition-colors">Kriterler</span>
            <div className="w-[1px] h-4 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 px-2 font-medium">Arama Yapın</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-bold hover:bg-slate-100 px-4 py-2.5 rounded-full cursor-pointer transition-colors">Evinizi yayınlayın</span>
            <div className="flex items-center gap-3 p-1.5 pl-3 border border-slate-200 rounded-full hover:shadow-md transition-shadow cursor-pointer bg-white">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-xs">
                U
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* GENERAL FILTER MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" 
            onClick={() => setIsFilterModalOpen(false)}
          ></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <h2 className="text-lg font-black tracking-tight">FİLTRELER</h2>
              <button 
                onClick={() => setModalFilters({})}
                className="text-sm font-bold text-slate-900 underline underline-offset-4 hover:text-orange-600 transition-colors"
              >
                Temizle
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
              {/* Deal Type */}
              <section>
                <h3 className="text-xl font-bold mb-4">İlan Tipi</h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setModalFilters(p => ({...p, dealType: 'Satılık'}))}
                    className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${modalFilters.dealType === 'Satılık' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 hover:border-orange-200'}`}
                  >
                    Satılık
                  </button>
                  <button 
                    onClick={() => setModalFilters(p => ({...p, dealType: 'Kiralık'}))}
                    className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${modalFilters.dealType === 'Kiralık' ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 hover:border-orange-200'}`}
                  >
                    Kiralık
                  </button>
                </div>
              </section>

              {/* Regions */}
              <section>
                <h3 className="text-xl font-bold mb-4">Semt Seçimi (Beylikdüzü)</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {NEIGHBORHOODS.map(n => (
                    <button 
                      key={n}
                      onClick={() => toggleNeighborhood(n)}
                      className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all text-left flex items-center justify-between ${modalFilters.locations?.includes(n) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-200 hover:border-orange-200 text-slate-600'}`}
                    >
                      {n}
                      {modalFilters.locations?.includes(n) && (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      )}
                    </button>
                  ))}
                </div>
              </section>

              {/* Price Range */}
              <section>
                <h3 className="text-xl font-bold mb-4">Fiyat Aralığı</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Minimum</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={modalFilters.minPrice || ''}
                        onChange={(e) => setModalFilters(p => ({...p, minPrice: e.target.value ? parseInt(e.target.value) : undefined}))}
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Maksimum</label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={modalFilters.maxPrice || ''}
                        onChange={(e) => setModalFilters(p => ({...p, maxPrice: e.target.value ? parseInt(e.target.value) : undefined}))}
                        className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Room Counts */}
              <section>
                <h3 className="text-xl font-bold mb-4">Oda Sayısı</h3>
                <div className="flex flex-wrap gap-2">
                  {ROOM_COUNTS.map(rc => (
                    <button 
                      key={rc}
                      onClick={() => setModalFilters(p => ({...p, roomCount: p.roomCount === rc ? undefined : rc}))}
                      className={`px-6 py-3 rounded-full border-2 font-bold transition-all ${modalFilters.roomCount === rc ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 hover:border-orange-200'}`}
                    >
                      {rc}
                    </button>
                  ))}
                </div>
              </section>

              {/* Site Checkbox */}
              <section>
                <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-[24px] cursor-pointer group hover:bg-orange-50/50 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={modalFilters.inSite || false}
                    onChange={(e) => setModalFilters(p => ({...p, inSite: e.target.checked}))}
                    className="w-6 h-6 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 group-hover:text-orange-600">Sadece Site İçindeki İlanlar</h4>
                    <p className="text-xs text-slate-500">Güvenlik, havuz ve sosyal tesisleri olan projeler.</p>
                  </div>
                </label>
              </section>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
              <button 
                onClick={() => setModalFilters({})}
                className="text-sm font-bold text-slate-900 underline underline-offset-4"
              >
                Hepsini Temizle
              </button>
              <button 
                onClick={applyModalFilters}
                className="px-10 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95"
              >
                Sonuçları Göster
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onSearch={handleSearch} />} />
          <Route path="/results" element={<Results listings={filteredListings} filters={activeFilters} />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Destek</h5>
            <ul className="space-y-3 text-[14px] text-slate-600 font-medium">
              <li className="hover:underline cursor-pointer">Yardım Merkezi</li>
              <li className="hover:underline cursor-pointer">AirCover</li>
              <li className="hover:underline cursor-pointer">Erişilebilirlik</li>
              <li className="hover:underline cursor-pointer">İptal Seçenekleri</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Emlak Ofisleri</h5>
            <ul className="space-y-3 text-[14px] text-slate-600 font-medium">
              <li className="hover:underline cursor-pointer">Kurumsal Üyelik</li>
              <li className="hover:underline cursor-pointer">Reklam Verin</li>
              <li className="hover:underline cursor-pointer">Yönetim Paneli</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Kurumsal</h5>
            <ul className="space-y-3 text-[14px] text-slate-600 font-medium">
              <li className="hover:underline cursor-pointer">Hakkımızda</li>
              <li className="hover:underline cursor-pointer">Haberler</li>
              <li className="hover:underline cursor-pointer">Kariyer</li>
              <li className="hover:underline cursor-pointer">Yatırımcı İlişkileri</li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-extrabold text-sm uppercase tracking-wider text-slate-900">Bizi Takip Edin</h5>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-slate-200 rounded-full hover:bg-orange-100 cursor-pointer transition-colors flex items-center justify-center">
                 <div className="w-5 h-5 bg-slate-400 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full hover:bg-orange-100 cursor-pointer transition-colors flex items-center justify-center">
                 <div className="w-5 h-5 bg-slate-400 rounded-sm"></div>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full hover:bg-orange-100 cursor-pointer transition-colors flex items-center justify-center">
                 <div className="w-5 h-5 bg-slate-400 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-[13px] text-slate-500 font-medium gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2024 Evinburada AI. Tüm hakları saklıdır.</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Gizlilik</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Şartlar</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">KVKK Aydınlatma</span>
          </div>
          <div className="flex items-center gap-6">
             <span className="flex items-center gap-2 cursor-pointer hover:text-orange-600 font-bold text-slate-800 transition-colors">
               Türkçe (TR)
             </span>
             <span className="cursor-pointer hover:text-orange-600 font-bold text-slate-800 transition-colors">₺ TRY</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
};

export default App;
