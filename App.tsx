
import React, { useState } from 'react';
// Correcting imports: HashRouter is from react-router-dom, while Routes, Route, useNavigate, useLocation are from react-router in some environments.
import { HashRouter } from 'react-router-dom';
import { Routes, Route, useNavigate, useLocation } from 'react-router';
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
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-600 fill-current">
              <path d="M16 1L2 12v17h28V12L16 1zm11 26h-6v-8h-10v8H5V13.2l11-8.58 11 8.58V27z"/>
            </svg>
            <h1 className="text-xl font-extrabold text-blue-600 tracking-tight hidden md:block">evinburada</h1>
          </div>

          {/* Pill Search (AI Trigger) */}
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-4 px-4 py-2 border border-slate-200 rounded-full shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <span className="text-sm font-semibold pl-2">Yerinizi seçin</span>
            <div className="w-[1px] h-6 bg-slate-200"></div>
            <span className="text-sm font-semibold">Tüm bölgeler</span>
            <div className="w-[1px] h-6 bg-slate-200"></div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Mülk tipi</span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Right Nav */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 mr-2">
              <span className="text-sm font-semibold hover:bg-slate-100 px-4 py-2 rounded-full cursor-pointer">Evinizi yayınlayın</span>
              <svg className="w-4 h-4 text-slate-600 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9h18" />
              </svg>
            </div>
            <div className="flex items-center gap-3 p-2 border border-slate-200 rounded-full hover:shadow-md transition-shadow cursor-pointer">
              <svg className="w-5 h-5 text-slate-600 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center text-white overflow-hidden">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow bg-white">
        <Routes>
          <Route path="/" element={<Home onSearch={handleSearch} />} />
          <Route path="/results" element={<Results listings={filteredListings} filters={activeFilters} />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-12 pb-24 md:pb-12">
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h5 className="font-bold text-sm mb-4">Destek</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="hover:underline cursor-pointer">Yardım Merkezi</li>
              <li className="hover:underline cursor-pointer">AirCover</li>
              <li className="hover:underline cursor-pointer">Erişilebilibility</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-4">Topluluk</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="hover:underline cursor-pointer">Evinburada.org: Afet konutları</li>
              <li className="hover:underline cursor-pointer">Ayrımcılığa karşı durun</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-4">Ev Sahipliği</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="hover:underline cursor-pointer">Evinizi yayınlayın</li>
              <li className="hover:underline cursor-pointer">Ev sahipleri için forum</li>
            </ul>
          </div>
          <div>
            <h5 className="font-bold text-sm mb-4">Evinburada</h5>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="hover:underline cursor-pointer">Haber Odası</li>
              <li className="hover:underline cursor-pointer">Yeni özellikler</li>
              <li className="hover:underline cursor-pointer">Kariyer</li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1760px] mx-auto px-4 md:px-10 lg:px-20 mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-sm text-slate-600 gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span>© 2024 Evinburada AI, Inc.</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Gizlilik</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Şartlar</span>
            <span>·</span>
            <span className="hover:underline cursor-pointer">Site Haritası</span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <span className="flex items-center gap-2 cursor-pointer hover:underline">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth