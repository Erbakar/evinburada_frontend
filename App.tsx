
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';
import Details from './pages/Details';
import { Listing, SearchFilters } from './types';
import { mockListings } from './data/listings';

const AppContent: React.FC = () => {
  const [filteredListings, setFilteredListings] = useState<Listing[]>(mockListings);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const navigate = useNavigate();

  const handleSearch = (filters: SearchFilters) => {
    console.log("AI Tarafından Toplanan Filtreler:", filters);
    setActiveFilters(filters);
    
    const results = mockListings.filter(listing => {
      let match = true;
      if (filters.dealType && listing.dealType !== filters.dealType) match = false;
      if (filters.roomCount && !listing.roomCount.includes(filters.roomCount)) match = false;
      if (filters.inSite !== undefined && listing.inSite !== filters.inSite) match = false;
      // Location check (partial match)
      if (filters.location && !listing.neighborhood.toLowerCase().includes(filters.location.toLowerCase()) && !listing.location.toLowerCase().includes(filters.location.toLowerCase())) match = false;
      return match;
    });

    setFilteredListings(results);
    navigate('/results');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Evinburada</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">Satılık</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">Kiralık</a>
            <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600">Projeler</a>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home onSearch={handleSearch} />} />
          <Route path="/results" element={<Results listings={filteredListings} filters={activeFilters} />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2024 Evinburada AI. Tüm hakları saklıdır.</p>
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
