
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage, SearchFilters } from '../types';
import { useNavigate } from 'react-router-dom';
import { mockListings } from '../data/listings';

interface HomeProps {
  onSearch: (filters: SearchFilters) => void;
}

const REGIONS = [
  { name: 'Şişli', img: 'https://images.unsplash.com/photo-1590059530472-35391d14691c?auto=format&fit=crop&w=600&q=80', count: '30+ İlan' },
  { name: 'Beylikdüzü', img: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=600&q=80', count: '30+ İlan' },
  { name: 'Beşiktaş', img: 'https://images.unsplash.com/photo-1527838832702-585f237f6671?auto=format&fit=crop&w=600&q=80', count: 'Yakında' },
  { name: 'Kadıköy', img: 'https://images.unsplash.com/photo-1549877452-9c387ad5471d?auto=format&fit=crop&w=600&q=80', count: 'Yakında' },
];

const CATEGORIES: { label: string; icon: string; filters: SearchFilters }[] = [
  { label: 'Tümü', icon: '🏠', filters: {} },
  { label: 'Günlük Kiralık', icon: '📅', filters: { dealType: 'Günlük Kiralık' } },
  { label: 'Satılık', icon: '💎', filters: { dealType: 'Satılık' } },
  { label: 'Kiralık', icon: '🔑', filters: { dealType: 'Kiralık' } },
  { label: 'Havuzlu', icon: '🏊', filters: { inSite: true } },
  { label: 'Rezidans', icon: '🏙️', filters: { roomCount: '1+0' } },
];

const Home: React.FC<HomeProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Merhaba! Ben Evinburada AI. Size nasıl bir ev bulabilirim? Örneğin; "Şişli\'de havuzlu kiralık evler" diyebilirsiniz.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
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
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const fc of response.functionCalls) {
          if (fc.name === 'search_homes') {
            setMessages(prev => [...prev, { role: 'model', content: 'Harika bir seçim! Kriterlerinize uygun en iyi seçenekleri hazırlıyorum...' }]);
            setTimeout(() => onSearch(fc.args as SearchFilters), 1200);
          } else if (fc.name === 'get_user_location') {
            setMessages(prev => [...prev, { role: 'model', content: 'Yakındaki fırsatları bulmak için konumunuza bakıyorum...' }]);
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const followUp = await chatRef.current.sendMessage({ message: `Konum: ${pos.coords.latitude}, ${pos.coords.longitude}. Bana yakın ilanları listele.` });
                setMessages(prev => [...prev, { role: 'model', content: followUp.text || 'Konumunuza en yakın bölgelerdeki ilanları buldum!' }]);
              },
              () => setMessages(prev => [...prev, { role: 'model', content: 'Konum izni alınamadı, ancak listeden bölge seçebilirsiniz.' }])
            );
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: response.text || 'Size nasıl yardımcı olabilirim?' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: 'Küçük bir teknik aksaklık oldu, lütfen tekrar deneyin.' }]);
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

  const featured = mockListings.slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative h-auto lg:h-[85vh] min-h-[600px] flex items-center overflow-hidden py-12 lg:py-0">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6199f7d009?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            className="w-full h-full object-cover scale-105"
            alt="Modern Luxury Home"
          />
          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-r from-black/80 via-black/50 lg:via-black/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {/* AI Chat Box Integration - MOVED TO TOP ON MOBILE (order-1) */}
          <div className="w-full max-w-md mx-auto lg:ml-auto order-1 lg:order-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
             <div className="bg-white/95 backdrop-blur-2xl rounded-[40px] p-2 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20">
                <div className="bg-white rounded-[35px] flex flex-col h-[400px] lg:h-[520px] overflow-hidden">
                   {/* Chat Header */}
                   <div className="p-4 lg:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3 lg:gap-4">
                         <div className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                            <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>
                         </div>
                         <div>
                            <h4 className="font-black text-slate-900 text-xs lg:text-sm tracking-tight">AI Emlak Asistanı</h4>
                            <div className="flex items-center gap-1.5">
                               <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                               <span className="text-[9px] lg:text-[10px] text-slate-400 font-bold uppercase tracking-wider">Aktif</span>
                            </div>
                         </div>
                      </div>
                   </div>

                   {/* Chat Messages */}
                   <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-5 hide-scrollbar bg-white">
                      {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[90%] px-4 py-3 lg:px-5 lg:py-4 rounded-[20px] lg:rounded-[24px] text-xs lg:text-sm leading-relaxed shadow-sm font-medium ${
                            m.role === 'user' 
                              ? 'bg-orange-600 text-white rounded-tr-none' 
                              : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                          }`}>
                            {m.content}
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                           <div className="bg-slate-50 px-4 py-3 rounded-[20px] rounded-tl-none border border-slate-100 flex gap-1.5 items-center">
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-150"></span>
                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-300"></span>
                           </div>
                        </div>
                      )}
                   </div>

                   {/* Input Area */}
                   <div className="p-4 lg:p-6 bg-slate-50/50 border-t border-slate-100">
                      <div className="flex gap-2 lg:gap-3 items-center bg-white p-2 rounded-2xl border border-slate-200 focus-within:border-orange-500 focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                        <button 
                          onClick={startVoice}
                          className={`p-2 lg:p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-100'}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                        </button>
                        <input 
                          type="text"
                          className="flex-grow bg-transparent border-none text-xs lg:text-sm font-bold focus:ring-0 placeholder:text-slate-400"
                          placeholder="Hayalindeki evi tarif et..."
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                        />
                        <button 
                          onClick={() => handleSend(input)}
                          className="w-10 h-10 lg:w-12 lg:h-12 bg-orange-600 text-white rounded-xl flex items-center justify-center hover:bg-orange-700 shadow-xl shadow-orange-600/20 active:scale-90 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </button>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Left Side: Copy - MOVED TO BOTTOM ON MOBILE (order-2) */}
          <div className="max-w-xl space-y-6 lg:space-y-8 order-2 lg:order-1 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 backdrop-blur-md border border-orange-500/20 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-orange-100 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">Yapay Zeka Destekli Arama</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight lg:leading-[1.1] tracking-tight text-center lg:text-left">
              Evinizi Aramayın, <br />
              <span className="text-orange-500">Onunla Konuşun.</span>
            </h1>
            <p className="text-sm lg:text-lg text-slate-300 font-medium leading-relaxed max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
              Türkiye'nin ilk konuşma odaklı emlak platformu. Kriterlerinizi anlatın, yapay zekamız binlerce ilan arasından size en uygun yaşam alanını saniyeler içinde çıkarsın.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 lg:gap-5 pt-2">
              <button 
                onClick={() => document.getElementById('discover')?.scrollIntoView({behavior:'smooth'})}
                className="px-8 py-4 lg:px-10 lg:py-5 bg-orange-600 text-white font-black rounded-2xl shadow-2xl shadow-orange-600/40 hover:bg-orange-700 hover:-translate-y-1 transition-all active:scale-95 text-sm lg:text-base"
              >
                Hemen Keşfet
              </button>
              <div className="flex items-center gap-3 lg:gap-4 bg-white/5 backdrop-blur-md px-4 py-3 lg:px-6 lg:py-4 rounded-2xl border border-white/10">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => <img key={i} className="w-6 h-6 lg:w-8 lg:h-8 rounded-full border-2 border-slate-900" src={`https://i.pravatar.cc/100?img=${i+20}`} alt="user" />)}
                 </div>
                 <span className="text-[10px] lg:text-xs text-white font-bold">12.4k+ Aktif İlan</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. CATEGORY QUICK-NAV */}
      <div id="discover" className="py-12 lg:py-16 border-b border-slate-100 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex gap-8 lg:gap-12 items-center justify-start lg:justify-center overflow-x-auto hide-scrollbar pb-4">
            {CATEGORIES.map((cat, i) => (
              <button 
                key={i}
                onClick={() => onSearch(cat.filters)}
                className="flex flex-col items-center gap-3 group whitespace-nowrap opacity-60 hover:opacity-100 transition-all"
              >
                <div className="w-12 h-12 lg:w-14 lg:h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-xl lg:text-2xl group-hover:bg-orange-50 group-hover:text-orange-600 group-hover:-translate-y-1 transition-all">
                  {cat.icon}
                </div>
                <span className="text-[10px] lg:text-[11px] font-black uppercase tracking-[0.1em] text-slate-500 group-hover:text-slate-900">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. FEATURED LISTINGS PREVIEW */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 lg:mb-16 gap-6 text-center md:text-left">
            <div className="space-y-3 lg:space-y-4">
               <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">Öne Çıkan Fırsatlar</h2>
               <p className="text-slate-500 text-sm lg:text-lg font-medium">Yapay zekamız tarafından seçilen haftanın en popüler ilanları.</p>
            </div>
            <button onClick={() => navigate('/results')} className="px-8 py-3 bg-white border border-slate-200 font-bold rounded-xl hover:border-orange-500 hover:text-orange-600 transition-all shadow-sm text-sm">Tümünü Gör</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {featured.map((listing) => (
              <div 
                key={listing.id} 
                onClick={() => navigate(`/details/${listing.id}`)}
                className="group cursor-pointer bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-slate-100"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={listing.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={listing.title} />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-lg">Özel İlan</span>
                  </div>
                </div>
                <div className="p-6 space-y-3 lg:space-y-4">
                  <h4 className="font-black text-slate-900 line-clamp-1 text-base lg:text-lg leading-tight uppercase tracking-tight">{listing.neighborhood}</h4>
                  <div className="flex items-center gap-3 text-[10px] lg:text-xs font-bold text-slate-400">
                    <span>{listing.roomCount}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{listing.area} m²</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl lg:text-2xl font-black text-orange-600 tracking-tighter">{listing.price.toLocaleString('tr-TR')}</span>
                    <span className="text-[10px] lg:text-xs font-black text-slate-900 uppercase">TL {listing.dealType.includes('Kiralık') ? '/ süreli' : ''}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. POPULAR REGIONS */}
      <section className="py-16 lg:py-24 container mx-auto px-6 lg:px-20">
        <div className="text-center mb-12 lg:mb-20 space-y-4">
           <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight uppercase">Popüler Lokasyonlar</h2>
           <p className="text-slate-500 text-sm lg:text-lg font-medium">İstanbul'un en gözde mahallelerinde yeni bir yaşam başlayın.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {REGIONS.map((region, i) => (
            <div 
              key={i} 
              onClick={() => onSearch({ locations: [region.name] })}
              className="group relative h-[350px] lg:h-[450px] rounded-[32px] lg:rounded-[40px] overflow-hidden cursor-pointer shadow-xl"
            >
              <img src={region.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms]" alt={region.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              <div className="absolute bottom-8 left-8 lg:bottom-10 lg:left-10 space-y-2">
                <h4 className="text-2xl lg:text-3xl font-black text-white">{region.name}</h4>
                <div className="inline-block px-4 py-1 bg-orange-600 text-white text-[9px] font-black uppercase rounded-lg tracking-widest">{region.count}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. STEPS SECTION */}
      <section className="py-16 lg:py-24 bg-slate-900 rounded-[40px] lg:rounded-[60px] mx-6 lg:mx-20 mb-16 lg:mb-24 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-6 lg:px-10 relative z-10">
           <div className="text-center mb-12 lg:mb-20 space-y-4">
             <h2 className="text-3xl lg:text-4xl font-black text-white tracking-tight uppercase">Nasıl Çalışır?</h2>
             <p className="text-slate-400 text-sm lg:text-lg font-medium">Evinburada AI ile ev bulma süreci sadece saniyeler sürer.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {[
                { n: '01', t: 'Hayalini Anlat', d: 'Karmaşık formlar doldurmak yerine asistanımıza nasıl bir ev aradığını yaz veya sesli söyle.' },
                { n: '02', t: 'AI Analizi', d: 'Yapay zekamız binlerce güncel ilanı tarayarak senin kriterlerine en uygun olanları eler.' },
                { n: '03', t: 'Fırsatı Yakala', d: 'Seçilen evlerin detaylarını incele ve emlak danışmanıyla doğrudan iletişime geç.' }
              ].map((step, i) => (
                <div key={i} className="space-y-4 lg:space-y-6 group text-center lg:text-left">
                   <div className="text-5xl lg:text-7xl font-black text-white/5 group-hover:text-orange-500/20 transition-colors duration-500">{step.n}</div>
                   <h4 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tight">{step.t}</h4>
                   <p className="text-slate-400 leading-relaxed font-medium text-sm lg:text-base">{step.d}</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
