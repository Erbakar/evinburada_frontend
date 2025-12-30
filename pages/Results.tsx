
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Listing, SearchFilters } from '../types';

interface ResultsProps {
  listings: Listing[];
  filters: SearchFilters;
}

const Results: React.FC<ResultsProps> = ({ listings, filters }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Beylikdüzü Emlak İlanları</h1>
          <p className="text-slate-500 mt-1">Bulunan sonuç: <span className="font-semibold text-blue-600">{listings.length}</span></p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.dealType && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
              {filters.dealType}
            </span>
          )}
          {filters.roomCount && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
              {filters.roomCount}
            </span>
          )}
          {filters.inSite !== undefined && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
              {filters.inSite ? 'Site İçerisinde' : 'Müstakil/Sokak'}
            </span>
          )}
          {filters.location && (
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-medium">
              Konum: {filters.location}
            </span>
          )}
        </div>
      </div>

      {listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <div 
              key={listing.id} 
              onClick={() => navigate(`/details/${listing.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="relative h-56 overflow-hidden">
                <img 
                  src={listing.imageUrl} 
                  alt={listing.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                   <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {listing.dealType}
                  </span>
                  {listing.inSite && (
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                      SİTE
                    </span>
                  )}
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-lg text-lg font-bold">
                    {listing.price.toLocaleString('tr-TR')} TL
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-slate-800 line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
                  {listing.title}
                </h3>
                <div className="flex items-center gap-1 text-slate-500 text-xs mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {listing.neighborhood}, {listing.location}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Oda</p>
                      <p className="text-sm font-bold text-slate-700">{listing.roomCount}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">Alan</p>
                      <p className="text-sm font-bold text-slate-700">{listing.area} m²</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Kaynak</p>
                    <p className="text-xs font-medium text-slate-600">{listing.sourceName}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">Aradığın kriterde ev bulamadık.</h3>
          <p className="text-slate-500 mt-2">Daha geniş bir arama yapmayı dene veya AI ile tekrar konuş.</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            Aramayı Güncelle
          </button>
        </div>
      )}
    </div>
  );
};

export default Results;
