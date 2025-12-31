
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Details from './pages/Details';
import { SearchFilters } from './types';

const DISTRICTS = ['Beylikdüzü', 'Şişli'];
const NEIGHBORHOODS: Record<string, string[]> = {
  'Beylikdüzü': ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'],
  'Şişli': ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ']
};

const AppContent: React.FC = () => {
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [modalFilters, setModalFilters] = useState<SearchFilters>({});
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Beylikdüzü');

  const navigate = useNavigate();

  const handleSearch = (filters: SearchFilters) => {
    setActiveFilters(filters);
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
    <div className="min-h-screen flex flex-col relative bg-white">
      {/* Header - Modern & Sticky */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[100]">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate('/')}>
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:rotate-6 transition-transform">
               <svg viewBox="0 0 32 32" className="w-5 h-5 fill-current"><path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/></svg>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tighter">evinburada</h1>
          </div>

          <div 
            onClick={() => { setModalFilters(activeFilters); setIsFilterModalOpen(true); }}
            className="hidden md:flex items-center gap-6 px-6 py-2.5 border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer bg-white group"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-orange-500">Bölge</span>
            <div className="w-[1px] h-4 bg-slate-200"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 group-hover:text-orange-500">İlan Tipi</span>
            <div className="w-[1px] h-4 bg-slate-200"></div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filtrele</span>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-orange-600 cursor-pointer transition-colors">Giriş Yap</span>
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-200 transition-colors">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <h2 className="text-lg font-black tracking-tighter uppercase">Filtreleme</h2>
              <button onClick={() => setModalFilters({})} className="text-xs font-black uppercase text-orange-600">Sıfırla</button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-10 space-y-12 hide-scrollbar">
              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">İlan Tipi</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Satılık', 'Kiralık', 'Günlük Kiralık'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setModalFilters(p => ({...p, dealType: type as any}))}
                      className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${modalFilters.dealType === type ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 hover:border-orange-200 text-slate-600'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Konum Seçimi</h3>
                <div className="flex gap-2 mb-4">
                   {DISTRICTS.map(d => (
                     <button key={d} onClick={() => setSelectedDistrict(d)} className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedDistrict === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>{d}</button>
                   ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                   {NEIGHBORHOODS[selectedDistrict].map(n => (
                     <button 
                       key={n} 
                       onClick={() => toggleNeighborhood(n)} 
                       className={`px-4 py-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${modalFilters.locations?.includes(n) ? 'border-orange-500 bg-orange-50 text-orange-600' : 'border-slate-100 text-slate-600 hover:border-orange-200'}`}
                     >
                       {n}
                       {modalFilters.locations?.includes(n) && <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>}
                     </button>
                   ))}
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-6">
              <button onClick={() => setIsFilterModalOpen(false)} className="text-xs font-black uppercase tracking-widest text-slate-400">İptal</button>
              <button onClick={applyModalFilters} className="px-12 py-5 bg-orange-600 text-white font-black rounded-2xl shadow-xl shadow-orange-600/20 hover:bg-orange-700 transition-all active:scale-95">Uygula</button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onSearch={handleSearch} />} />
          <Route path="/results" element={<Results filters={activeFilters} onFilterChange={setActiveFilters} />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </main>

      {/* ULTRA SIMPLE & CHIC FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-10">
        <div className="max-w-[1760px] mx-auto px-6 md:px-10 lg:px-20 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center text-white">
               <svg viewBox="0 0 32 32" className="w-3 h-3 fill-current"><path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/></svg>
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tighter">evinburada ai</span>
            <span className="hidden md:block w-1 h-1 bg-slate-200 rounded-full mx-2"></span>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">© 2024 Tüm hakları saklıdır.</span>
          </div>

          <div className="flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
             <span className="hover:text-orange-600 cursor-pointer transition-colors">Kullanım Koşulları</span>
             <span className="hover:text-orange-600 cursor-pointer transition-colors">KVKK</span>
             <span className="hover:text-orange-600 cursor-pointer transition-colors">İletişim</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => <BrowserRouter><AppContent /></BrowserRouter>;
export default App;
