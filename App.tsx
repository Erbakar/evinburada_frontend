
import React, { useState } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Details from './pages/Details';
import { Listing, SearchFilters } from './types';
import { mockListings } from './data/listings';

const DISTRICTS = ['Beylikdüzü', 'Şişli'];
const NEIGHBORHOODS: Record<string, string[]> = {
  'Beylikdüzü': ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'],
  'Şişli': ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ']
};
const ROOM_COUNTS = ['1+0', '1+1', '2+1', '3+1', '4+1', '4+2'];

const AppContent: React.FC = () => {
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  const [modalFilters, setModalFilters] = useState<SearchFilters>({});
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Beylikdüzü');

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (filters: SearchFilters) => {
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
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => navigate('/')}>
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-orange-500 fill-current">
              <path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/>
            </svg>
            <h1 className="text-xl font-extrabold text-orange-600 tracking-tight hidden md:block">evinburada</h1>
          </div>

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

          <div className="flex items-center gap-4">
            <span className="hidden md:block text-sm font-bold hover:bg-slate-100 px-4 py-2.5 rounded-full cursor-pointer transition-colors">Evinizi yayınlayın</span>
            <div className="flex items-center gap-3 p-1.5 pl-3 border border-slate-200 rounded-full hover:shadow-md transition-shadow cursor-pointer bg-white">
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-xs">U</div>
            </div>
          </div>
        </div>
      </header>

      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsFilterModalOpen(false)}></div>
          <div className="relative w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-lg font-black tracking-tight uppercase">İleri Filtreleme</h2>
              <button onClick={() => setModalFilters({})} className="text-sm font-bold text-slate-900 underline underline-offset-4 hover:text-orange-600 transition-colors">Temizle</button>
            </div>

            <div className="flex-grow overflow-y-auto p-8 space-y-10 custom-scrollbar">
              <section>
                <h3 className="text-xl font-bold mb-4">İlan Tipi</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Satılık', 'Kiralık', 'Günlük Kiralık'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setModalFilters(p => ({...p, dealType: type as any}))}
                      className={`py-4 rounded-2xl border-2 font-bold transition-all ${modalFilters.dealType === type ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 hover:border-orange-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-xl font-bold mb-4">Bölge Seçimi</h3>
                <div className="flex gap-2 mb-6 border-b border-slate-100 pb-2 overflow-x-auto hide-scrollbar">
                  {DISTRICTS.map(d => (
                    <button 
                      key={d}
                      onClick={() => setSelectedDistrict(d)}
                      className={`px-6 py-2 rounded-full text-sm font-bold transition-colors ${selectedDistrict === d ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {NEIGHBORHOODS[selectedDistrict].map(n => (
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
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setModalFilters({})} className="text-sm font-bold text-slate-900 underline underline-offset-4">Sıfırla</button>
              <button onClick={applyModalFilters} className="px-10 py-4 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95">Uygula</button>
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

      {/* RICH & STYLISH FOOTER */}
      <footer className="bg-slate-900 text-white pt-24 pb-12">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-orange-500 fill-current">
                <path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/>
              </svg>
              <span className="text-2xl font-black tracking-tight">evinburada</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Türkiye'nin ilk yapay zeka destekli emlak platformu. Ev arama deneyimini kişiselleştiriyor, saniyeler içinde sizi hayalinizdeki eve ulaştırıyoruz.
            </p>
            <div className="flex gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-10 h-10 bg-white/5 hover:bg-orange-500 hover:scale-110 transition-all cursor-pointer rounded-xl flex items-center justify-center border border-white/10">
                   <div className="w-5 h-5 bg-white/20 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-black text-sm uppercase tracking-widest text-orange-500 mb-8">Kurumsal</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Hakkımızda</li>
              <li className="hover:text-white transition-colors cursor-pointer">Kariyer Fırsatları</li>
              <li className="hover:text-white transition-colors cursor-pointer">Basın Odası</li>
              <li className="hover:text-white transition-colors cursor-pointer">Yatırımcı İlişkileri</li>
              <li className="hover:text-white transition-colors cursor-pointer">Sürdürülebilirlik</li>
            </ul>
          </div>

          <div>
            <h5 className="font-black text-sm uppercase tracking-widest text-orange-500 mb-8">Destek & Yardım</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-400">
              <li className="hover:text-white transition-colors cursor-pointer">Yardım Merkezi</li>
              <li className="hover:text-white transition-colors cursor-pointer">Güvenli Alışveriş</li>
              <li className="hover:text-white transition-colors cursor-pointer">İptal ve İade</li>
              <li className="hover:text-white transition-colors cursor-pointer">Mülk Sahipleri</li>
              <li className="hover:text-white transition-colors cursor-pointer">KVKK Aydınlatma</li>
            </ul>
          </div>

          <div className="space-y-8">
            <h5 className="font-black text-sm uppercase tracking-widest text-orange-500 mb-8">Haber Bülteni</h5>
            <p className="text-slate-400 text-sm font-medium">Yeni eklenen fırsat ilanlarından ilk siz haberdar olun.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="E-posta adresi" 
                className="bg-white/5 border border-white/10 px-4 py-3 rounded-xl flex-grow text-sm focus:outline-none focus:border-orange-500 transition-all"
              />
              <button className="bg-orange-600 text-white px-5 py-3 rounded-xl font-bold text-xs hover:bg-orange-700 active:scale-95 transition-all">Kaydol</button>
            </div>
          </div>
        </div>

        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 border-t border-white/10 pt-12 flex flex-col md:flex-row justify-between items-center gap-8 text-xs font-bold text-slate-500 uppercase tracking-widest">
           <div className="flex flex-wrap items-center justify-center md:justify-start gap-8">
              <span>© 2024 Evinburada AI.</span>
              <span className="hover:text-white cursor-pointer transition-colors">Kullanım Koşulları</span>
              <span className="hover:text-white cursor-pointer transition-colors">Gizlilik Politikası</span>
              <span className="hover:text-white cursor-pointer transition-colors">Çerez Ayarları</span>
           </div>
           <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-all">
                 <span>TR</span>
                 <div className="w-[1px] h-3 bg-white/20"></div>
                 <span>TRY</span>
              </button>
           </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => <HashRouter><AppContent /></HashRouter>;
export default App;
