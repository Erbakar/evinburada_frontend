
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Listing } from '../types';
import { mockListings } from '../data/listings';

const Details: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    const found = mockListings.find(l => l.id === id);
    if (found) {
      setListing(found);
    }
  }, [id]);

  if (!listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="relative pb-32">
      {/* Hero / Images */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Dön
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl overflow-hidden shadow-lg border border-slate-200">
              <img 
                src={listing.imageUrl} 
                alt={listing.title} 
                className="w-full h-[500px] object-cover"
              />
            </div>

            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h1 className="text-3xl font-bold text-slate-900 mb-4">{listing.title}</h1>
              <div className="flex flex-wrap items-center gap-6 mb-8 py-6 border-y border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">ODA SAYISI</p>
                    <p className="font-bold text-slate-700">{listing.roomCount}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">METREKARE</p>
                    <p className="font-bold text-slate-700">{listing.area} m²</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">DURUM</p>
                    <p className="font-bold text-slate-700">{listing.inSite ? 'Site İçinde' : 'Müstakil'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900">İlan Açıklaması</h2>
                <p className="text-slate-600 leading-relaxed">
                  {listing.description}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm sticky top-24">
              <div className="mb-6">
                <p className="text-slate-500 font-medium mb-1">Fiyat</p>
                <h2 className="text-4xl font-extrabold text-blue-600">{listing.price.toLocaleString('tr-TR')} TL</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                   <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Evinburada Danışmanı</p>
                    <p className="text-xs text-slate-500">Müsait: Bugün 09:00 - 18:00</p>
                  </div>
                </div>
                
                <button className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Hemen Ara
                </button>
                <button className="w-full py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold hover:bg-slate-50 transition-colors">
                  Mesaj Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-200 p-4 z-[100] shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="hidden sm:block">
             <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Şu an inceliyorsun</p>
             <h4 className="font-bold text-slate-800 line-clamp-1">{listing.title}</h4>
          </div>
          <a 
            href={listing.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 shadow-xl"
          >
            <span>Daha Fazla Detay İçin {listing.sourceName}'e Git</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Details;
