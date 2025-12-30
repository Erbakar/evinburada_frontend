
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Details from './pages/Details';
import { Listing, SearchFilters } from './types';
import { mockListings } from './data/listings';

const AppContent: React.FC = () => {
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (filters: SearchFilters) => {
    console.log("Arama Filtreleri:", filters);
    setActiveFilters(filters);
    const results = mockListings.filter(listing => {
      let match = true;
      if (filters.dealType && listing.dealType !== filters.dealType) match = false;
      if (filters.roomCount && !listing.roomCount.includes(filters.roomCount)) match = false;
      if (filters.inSite !== undefined && listing.inSite !== filters.inSite) match = false;
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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500 fill-current">
              <path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/>
            </svg>
            <h1 className="text-xl font-extrabold text-orange-600 tracking-tight hidden md:block">evinburada</h1>
          </div>

          {/* Pill Search */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-4 px-4 py-2.5 border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <span className="text-sm font-bold px-2">Bölge Seçin</span>
            <div className="w-[1px] h-6 bg-slate-200"></div>
            <span className="text-sm font-bold px-2">Kriterler</span>
            <div className="w-[1px] h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 px-2 font-medium">AI Asistan</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-inner">
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
