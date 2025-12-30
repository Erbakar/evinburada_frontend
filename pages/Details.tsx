
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
    if (found) setListing(found);
    window.scrollTo(0, 0);
  }, [id]);

  if (!listing) return null;

  return (
    <div className="max-w-[1120px] mx-auto px-4 md:px-10 lg:px-20 py-8">
      {/* Title and Share */}
      <div className="mb-6">
        <h1 className="text-[26px] font-bold text-slate-900 mb-2">{listing.title}</h1>
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm font-semibold underline underline-offset-2">
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> 4.9 · 12 değerlendirme</span>
             <span className="cursor-pointer">{listing.neighborhood}, {listing.location}</span>
          </div>
          <div className="flex items-center gap-5">
             <span className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Paylaş
             </span>
             <span className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 px-2 py-1 rounded-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg> Kaydet
             </span>
          </div>
        </div>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[350px] md:h-[500px] rounded-[12px] overflow-hidden mb-12">
        <div className="md:col-span-2 md:row-span-2 relative group cursor-pointer">
          <img src={listing.imageUrl} className="w-full h-full object-cover brightness-100 group-hover:brightness-90 transition-all" />
        </div>
        <div className="hidden md:block relative group cursor-pointer">
          <img src={`https://picsum.photos/seed/${listing.id}1/600/600`} className="w-full h-full object-cover brightness-100 group-hover:brightness-90 transition-all" />
        </div>
        <div className="hidden md:block relative group cursor-pointer">
          <img src={`https://picsum.photos/seed/${listing.id}2/600/600`} className="w-full h-full object-cover brightness-100 group-hover:brightness-90 transition-all" />
        </div>
        <div className="hidden md:block relative group cursor-pointer">
          <img src={`https://picsum.photos/seed/${listing.id}3/600/600`} className="w-full h-full object-cover brightness-100 group-hover:brightness-90 transition-all" />
        </div>
        <div className="hidden md:block relative group cursor-pointer">
          <img src={`https://picsum.photos/seed/${listing.id}4/600/600`} className="w-full h-full object-cover brightness-100 group-hover:brightness-90 transition-all" />
          <button className="absolute bottom-6 right-6 px-4 py-2 bg-white border border-slate-900 rounded-lg text-sm font-bold shadow-sm">Tüm fotoğrafları göster</button>
        </div>
      </div>

      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-20">
        <div className="lg:col-span-2">
          <div className="flex justify-between items-start pb-6 border-b border-slate-200">
             <div>
                <h2 className="text-[22px] font-bold text-slate-900 mb-1">Mülk sahibi: {listing.sourceName} Danışmanlık</h2>
                <p className="text-slate-600">{listing.roomCount} • {listing.area} m² • {listing.inSite ? 'Site içerisinde' : 'Sokak üzerinde'}</p>
             </div>
             <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 overflow-hidden border border-slate-200">
                <svg className="w-10 h-10 translate-y-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
             </div>
          </div>

          <div className="py-8 border-b border-slate-200 space-y-6">
            <div className="flex gap-4">
               <svg className="w-7 h-7 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
               <div>
                  <h4 className="font-bold text-slate-900">Tam donanımlı konut</h4>
                  <p className="text-sm text-slate-500">Bu ev her türlü ihtiyaca cevap verecek şekilde tasarlanmıştır.</p>
               </div>
            </div>
            <div className="flex gap-4">
               <svg className="w-7 h-7 text-slate-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               <div>
                  <h4 className="font-bold text-slate-900">Harika konum</h4>
                  <p className="text-sm text-slate-500">Bölgedeki diğer ilanların %95'inden daha iyi bir konuma sahip.</p>
               </div>
            </div>
          </div>

          <div className="py-8">
            <h3 className="text-[22px] font-bold text-slate-900 mb-4">Açıklama</h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line text-lg">
              {listing.description}
            </p>
            <button className="mt-4 font-bold underline text-slate-900 underline-offset-4">Daha fazla oku</button>
          </div>
        </div>

        {/* Sticky Booking Widget */}
        <div className="lg:col-span-1">
          <div className="sticky top-28 p-6 bg-white border border-slate-200 rounded-[24px] airbnb-shadow">
            <div className="flex justify-between items-end mb-6">
              <div>
                <span className="text-2xl font-bold">{listing.price.toLocaleString('tr-TR')} TL</span>
                <span className="text-slate-600 ml-1">/{listing.dealType === 'Kiralık' ? 'ay' : 'toplam'}</span>
              </div>
              <div className="text-xs font-bold underline">
                <span className="flex items-center gap-1"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg> 4.9 · 12</span>
              </div>
            </div>

            <div className="border border-slate-400 rounded-xl overflow-hidden mb-4">
              <div className="grid grid-cols-2 border-b border-slate-400">
                <div className="p-3 border-r border-slate-400">
                  <p className="text-[10px] font-bold uppercase">GİRİŞ</p>
                  <p className="text-sm">Müsaitlik sor</p>
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold uppercase">ÇIKIŞ</p>
                  <p className="text-sm">Bize ulaşın</p>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[10px] font-bold uppercase">MİSAFİRLER / KİŞİLER</p>
                <p className="text-sm">1 kişi</p>
              </div>
            </div>

            <button className="w-full py-3.5 bg-blue-600 text-white rounded-lg font-bold text-lg mb-4 active:scale-[0.98] transition-all">İletişime Geç</button>
            <p className="text-center text-sm text-slate-500 mb-6">Henüz bir ücret tahsil edilmeyecek</p>
            
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between underline">
                <span>Hizmet bedeli</span>
                <span>Dahil değil</span>
              </div>
              <div className="flex justify-between underline">
                <span>Evinburada AI komisyonu</span>
                <span>0 TL</span>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-200 flex justify-between font-bold text-lg">
                <span>Toplam</span>
                <span>{listing.price.toLocaleString('tr-TR')} TL</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* STICKY BOTTOM BAR (MOBILE ONLY) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 z-[100] md:hidden flex justify-between items-center shadow-lg">
        <div>
           <p className="font-bold text-lg">{listing.price.toLocaleString('tr-TR')} TL <span className="text-sm font-normal text-slate-500">/ay</span></p>
           <p className="text-xs font-bold underline">Müsaitlik sor</p>
        </div>
        <a 
          href={listing.sourceUrl}
          target="_blank"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
        >
          {listing.sourceName}'e Git
        </a>
      </div>

      {/* STICKY BOTTOM CTA (DESKTOP) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-4 z-[99] hidden md:block shadow-2xl">
         <div className="max-w-[1120px] mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden">
                  <img src={listing.imageUrl} className="w-full h-full object-cover" />
               </div>
               <div>
                  <h4 className="font-bold text-sm">{listing.title}</h4>
                  <p className="text-xs text-slate-500 font-semibold underline cursor-pointer">Detayları gör</p>
               </div>
            </div>
            <a 
              href={listing.sourceUrl}
              target="_blank"
              className="bg-slate-900 text-white px-10 py-3.5 rounded-xl font-bold hover:bg-black transition-all"
            >
              Daha Fazla Detay İçin {listing.sourceName}'e Git
            </a>
         </div>
      </div>
    </div>
  );
};

export default Details;
