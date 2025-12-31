
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage, SearchFilters } from '../types';
import { useNavigate } from 'react-router-dom';
import { mockListings, FALLBACK_IMAGE } from '../data/listings';

interface HomeProps {
  onSearch: (filters: SearchFilters) => void;
}

const REGIONS = [
  { 
    name: 'Beşiktaş', 
    img: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Istanbul_asv2020-02_img61_Ortak%C3%B6y_Mosque.jpg', 
    count: '35+ İlan' 
  },
  { 
    name: 'Kadıköy', 
    img: 'https://istanbulclues.com/wp-content/uploads/2022/11/Bosphorus-B2-Kadikoy-Dreamstime.jpg', 
    count: '35+ İlan' 
  },
  { 
    name: 'Şişli', 
    img: 'https://istanbulinvestments.com/cms-uploads/%C5%9Fi%C5%9Fli.jpg', 
    count: '35+ İlan' 
  },
  { 
    name: 'Beylikdüzü', 
    img: 'https://app.binaacapital.net/storage/32/beylikduzu-bazaar.webp', 
    count: '35+ İlan' 
  },
];

const CATEGORIES: { label: string; icon: string; filters: SearchFilters }[] = [
  { label: 'Tümü', icon: '🏠', filters: {} },
  { label: 'Günlük Kiralık', icon: '📅', filters: { dealType: 'Günlük Kiralık' } },
  { label: 'Satılık', icon: '💎', filters: { dealType: 'Satılık' } },
  { label: 'Kiralık', icon: '🔑', filters: { dealType: 'Kiralık' } },
  { label: 'Havuzlu', icon: '🏊', filters: { inSite: true } },
  { label: 'Rezidans', icon: '🏙️', filters: { roomCount: '1+0' } },
];

const SOURCE_LOGOS: Record<string, string> = {
  'Hepsiemlak': 'https://www.hepsiemlak.com/favicon.ico',
  'Emlakjet': 'https://www.emlakjet.com/favicon.ico'
};

const Home: React.FC<HomeProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Merhaba! Ben Evinburada AI. Size nasıl bir ev bulabilirim? Örneğin; "Beşiktaş\'ta deniz manzaralı kiralık evler" diyebilirsiniz.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListeningState, setIsListening] = useState(false);
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

  const handleSend = async (text: string) => {
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
            if (!response.text) {
              setMessages(prev => [...prev, { role: 'model', content: 'Kriterlerinize uygun en iyi seçenekleri listeliyorum...' }]);
            }
            setTimeout(() => onSearch(fc.args as SearchFilters), 800);
          } else if (fc.name === 'get_user_location') {
            setMessages(prev => [...prev, { role: 'model', content: 'Yakındaki ilanları bulmak için konum izni istiyorum...' }]);
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const followUp = await chatRef.current.sendMessage({ message: `Konum: ${pos.coords.latitude}, ${pos.coords.longitude}. Bana bu koordinatlara yakın ilanları listele.` });
                if (followUp.text) setMessages(prev => [...prev, { role: 'model', content: followUp.text! }]);
                if (followUp.functionCalls) {
                   for (const fcfu of followUp.functionCalls) {
                     if (fcfu.name === 'search_homes') onSearch(fcfu.args as SearchFilters);
                   }
                }
              },
              () => setMessages(prev => [...prev, { role: 'model', content: 'Konumunuza erişemedim, lütfen aradığınız bölgeyi yazarak devam edin.' }])
            );
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: 'Küçük bir bağlantı sorunu oldu, lütfen tekrar dener misin?' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) return alert("Tarayıcı desteklemiyor.");
    const rec = new Recognition();
    rec.lang = 'tr-TR';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e: any) => handleSend(e.results[0][0].transcript);
    rec.start();
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const featured = mockListings.slice(0, 12);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-auto lg:min-h-[750px] flex items-center overflow-hidden py-16 lg:py-0 bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=2000&q=80" 
            className="w-full h-full object-cover scale-105 opacity-70"
            alt="Hero Background"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          <div className="text-left space-y-6 lg:space-y-10">
            <span className="inline-block px-4 py-2 bg-orange-500 text-white text-[10px] lg:text-xs font-black uppercase rounded-full tracking-widest shadow-xl animate-bounce">
              Türkiye'nin Akıllı Emlak Platformu
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1]">
              Evinizi Aramayın, <br /> 
              <span className="text-orange-500">Onunla Konuşun.</span>
            </h1>
            <p className="text-sm lg:text-xl text-slate-200 font-medium max-w-lg leading-relaxed opacity-90">
              Binlerce ilan arasında kaybolmayın. Evinburada AI, ne istediğinizi anlar ve size en uygun seçenekleri saniyeler içinde sunar.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <button onClick={() => document.getElementById('featured')?.scrollIntoView({behavior:'smooth'})} className="px-10 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-2xl text-sm uppercase tracking-widest">İlanları Keşfet</button>
              <div className="hidden sm:flex -space-x-3 items-center">
                {[12,24,36].map(i => <img key={i} className="w-10 h-10 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${i}`} alt="user" onError={handleImageError} />)}
                <span className="pl-6 text-[10px] lg:text-xs text-white font-bold tracking-widest uppercase">+500k Mutlu Kullanıcı</span>
              </div>
            </div>
          </div>

          {/* AI Chat Box */}
          <div className="w-full max-w-md mx-auto lg:ml-auto">
             <div className="bg-white/10 backdrop-blur-3xl rounded-[40px] p-1 border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                <div className="bg-white rounded-[39px] flex flex-col h-[450px] lg:h-[550px]">
                   <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <div className="w-11 h-11 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.43 5.17L2.1 21.4c-.11.38.25.74.63.63l4.23-1.33C8.35 21.48 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                         </div>
                         <div>
                            <h4 className="font-black text-slate-900 text-sm uppercase tracking-tighter">Evinburada AI</h4>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Çevrimiçi Asistan</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                         <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                         <span className="text-[10px] text-green-600 font-black uppercase tracking-widest">Aktif</span>
                      </div>
                   </div>
                   
                   <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 hide-scrollbar">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-5 py-3 rounded-[24px] text-xs lg:text-sm font-bold shadow-sm ${m.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-1.5 p-3 items-center">
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-150"></span>
                          <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-300"></span>
                        </div>
                      )}
                   </div>

                   <div className="p-5 bg-slate-50/50 border-t border-slate-100">
                      <div className="flex gap-2 items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-inner">
                        <button onClick={startVoice} className={`p-3 rounded-xl transition-all ${isListeningState ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </button>
                        <input className="flex-grow bg-transparent border-none text-xs lg:text-sm font-black focus:ring-0 placeholder:text-slate-300" placeholder="Hayalindeki evi tarif et..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} />
                        <button onClick={() => handleSend(input)} className="w-11 h-11 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-transform active:scale-90"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY NAV */}
      <div className="py-12 border-b border-slate-100 overflow-hidden bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex gap-8 lg:gap-14 items-center justify-start lg:justify-center overflow-x-auto hide-scrollbar pb-2">
            {CATEGORIES.map((cat, i) => (
              <button 
                key={i}
                onClick={() => onSearch(cat.filters)}
                className="flex flex-col items-center gap-4 group whitespace-nowrap opacity-60 hover:opacity-100 transition-all border-b-4 border-transparent hover:border-orange-500 pb-4"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform duration-300">{cat.icon}</span>
                <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FEATURED LISTINGS */}
      <section id="featured" className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-3">
               <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">Haftanın <br/><span className="text-orange-500">Öne Çıkanları</span></h2>
               <p className="text-slate-500 font-bold text-sm lg:text-lg">Yapay zekamızın sizin için analiz ettiği en popüler fırsatlar.</p>
            </div>
            <button onClick={() => navigate('/results')} className="px-10 py-4 border-2 border-slate-900 font-black rounded-2xl hover:bg-slate-900 hover:text-white transition-all text-xs lg:text-sm uppercase tracking-widest shadow-lg">Tüm İlanları Gör</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {featured.map((listing) => (
              <div 
                key={listing.id} 
                onClick={() => navigate(`/details/${listing.id}`)}
                className="group cursor-pointer bg-white rounded-[40px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 border border-slate-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-200">
                  <img 
                    src={listing.imageUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                    alt={listing.title} 
                    onError={handleImageError}
                    loading="lazy"
                  />
                  <div className="absolute top-5 left-5 flex flex-col gap-2">
                    <span className="px-4 py-1.5 bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-xl w-fit tracking-widest">Hemen İncele</span>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl w-fit shadow-xl border border-white/20">
                       <img src={SOURCE_LOGOS[listing.sourceName]} alt={listing.sourceName} className="w-4 h-4 rounded-sm object-contain" />
                       <span className="text-[9px] font-black text-slate-900 uppercase tracking-tighter">{listing.sourceName}</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 space-y-5">
                  <h4 className="font-black text-slate-900 line-clamp-1 text-sm lg:text-lg uppercase tracking-tight group-hover:text-orange-600 transition-colors">{listing.neighborhood}</h4>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{listing.roomCount}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                    <span>{listing.area} m²</span>
                  </div>
                  <div className="flex items-baseline gap-2 pt-2 border-t border-slate-50">
                    <span className="text-2xl lg:text-3xl font-black text-orange-600 tracking-tighter">{listing.price.toLocaleString('tr-TR')}</span>
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">TL</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR REGIONS */}
      <section className="py-24 container mx-auto px-6 lg:px-20">
        <div className="text-center mb-20 space-y-4">
           <h2 className="text-4xl lg:text-6xl font-black text-slate-900 tracking-tighter uppercase">Şehri Keşfet</h2>
           <p className="text-slate-500 text-sm lg:text-xl font-bold uppercase tracking-widest opacity-60">İstanbul'un En Popüler Lokasyonları</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
          {REGIONS.map((region, i) => (
            <div 
              key={i} 
              onClick={() => onSearch({ district: region.name, province: 'İstanbul' })}
              className="group relative h-[400px] lg:h-[550px] rounded-[48px] overflow-hidden cursor-pointer shadow-2xl bg-slate-900"
            >
              <img 
                src={region.img} 
                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-[3000ms] opacity-70" 
                alt={region.name} 
                onError={handleImageError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/10 to-transparent"></div>
              <div className="absolute bottom-12 left-10 space-y-4">
                <h4 className="text-3xl lg:text-4xl font-black text-white tracking-tighter uppercase">{region.name}</h4>
                <div className="inline-flex items-center gap-3 px-5 py-2 bg-orange-600 text-white text-[10px] font-black uppercase rounded-2xl tracking-widest shadow-xl group-hover:bg-white group-hover:text-orange-600 transition-colors">
                  {region.count}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WHY US / STATS */}
      <section className="py-24 bg-slate-950 rounded-[60px] lg:rounded-[100px] mx-6 lg:mx-20 mb-24 overflow-hidden relative shadow-[0_48px_100px_-24px_rgba(0,0,0,0.6)]">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-10 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           <div className="space-y-10">
              <h2 className="text-4xl lg:text-7xl font-black text-white leading-tight uppercase tracking-tighter">Emlak Dünyasında <br /><span className="text-orange-500">Gelecek Burada.</span></h2>
              <div className="space-y-8">
                {[
                  { t: 'Yapay Zeka Destekli', d: 'Karmaşık filtrelerle vakit kaybetmeyin, asistanımıza sormanız yeterli.' },
                  { t: 'Tüm Emlak portalları', d: 'Tek tek ilan sitelerini dolaşma hepsine tek yerden kolay ulaşım sağla' },
                  { t: 'Güncel İlanlar', d: 'Türkiye genelindeki en prestijli projeleri ve fırsatları ilk siz keşfedin.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all duration-500">
                      <svg className="w-8 h-8 text-orange-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h5 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight mb-2 group-hover:text-orange-500 transition-colors">{item.t}</h5>
                      <p className="text-slate-400 text-sm lg:text-lg font-medium leading-relaxed">{item.d}</p>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-10 bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/10 text-center hover:bg-white/10 transition-all">
                 <div className="text-4xl lg:text-7xl font-black text-orange-500 mb-4 tracking-tighter">140.000+</div>
                 <div className="text-xs font-black uppercase tracking-widest text-slate-400 opacity-60">Aktif İlan Havuzu</div>
              </div>
              <div className="p-10 bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/10 text-center sm:translate-y-12 hover:bg-white/10 transition-all">
                 <div className="text-4xl lg:text-7xl font-black text-orange-500 mb-4 tracking-tighter">2sn</div>
                 <div className="text-xs font-black uppercase tracking-widest text-slate-400 opacity-60">Yapay Zeka Yanıtı</div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
