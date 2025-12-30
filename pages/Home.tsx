
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage, SearchFilters } from '../types';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  onSearch: (filters: SearchFilters) => void;
}

const REGIONS = [
  { name: 'Şişli', img: 'https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=400&q=80', count: '30+ İlan' },
  { name: 'Beylikdüzü', img: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=400&q=80', count: '30+ İlan' },
  { name: 'Beşiktaş', img: 'https://images.unsplash.com/photo-1527838832702-585f237f6671?auto=format&fit=crop&w=400&q=80', count: 'Yakında' },
  { name: 'Kadıköy', img: 'https://images.unsplash.com/photo-1549877452-9c387ad5471d?auto=format&fit=crop&w=400&q=80', count: 'Yakında' },
];

// Fix: Explicitly typing the CATEGORIES array to ensure the 'filters' property adheres to the SearchFilters interface.
// This prevents TypeScript from inferring 'dealType' as a generic 'string' instead of the required union type.
const CATEGORIES: { label: string; icon: string; filters: SearchFilters }[] = [
  { label: 'Tümü', icon: '🏠', filters: {} },
  { label: 'Günlük Kiralık', icon: '📅', filters: { dealType: 'Günlük Kiralık' } },
  { label: 'Satılık', icon: '💎', filters: { dealType: 'Satılık' } },
  { label: 'Kiralık', icon: '🔑', filters: { dealType: 'Kiralık' } },
  { label: 'Havuzlu', icon: '🏊', filters: { inSite: true } },
  { label: 'Rezidans', icon: '🏙️', filters: { roomCount: '1+0' } },
];

const Home: React.FC<HomeProps> = ({ onSearch }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Merhaba! Hayalindeki evi bulmana yardım etmek için buradayım. Hangi bölgede, nasıl bir ev arıyorsun? (Örn: "Şişli\'de 15.000 TL\'ye kadar kiralık ev")' }
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
            setMessages(prev => [...prev, { role: 'model', content: 'Kriterlerine en uygun evleri hemen listeliyorum...' }]);
            setTimeout(() => onSearch(fc.args as SearchFilters), 1200);
          } else if (fc.name === 'get_user_location') {
            setMessages(prev => [...prev, { role: 'model', content: 'Konumuna en yakın ilanları bulmak için izin istiyorum...' }]);
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const followUp = await chatRef.current.sendMessage({ message: `Konum: ${pos.coords.latitude}, ${pos.coords.longitude}. Yakın ilanları göster.` });
                setMessages(prev => [...prev, { role: 'model', content: followUp.text || 'Konumunu aldım, yakındaki fırsatları listeliyorum.' }]);
              },
              () => setMessages(prev => [...prev, { role: 'model', content: 'Konumuna erişemedim, lütfen semt adı yazarak devam et.' }])
            );
          }
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: response.text || 'Anladım, daha fazla detay verebilir misin?' }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', content: 'Bağlantı hatası oluştu, lütfen tekrar dener misin?' }]);
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

  return (
    <div className="bg-white">
      {/* Immersive Hero Section */}
      <div className="relative h-[750px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6199f7d009?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover" 
            alt="Luxury Home"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-left space-y-6">
            <span className="inline-block px-4 py-1.5 bg-orange-500 text-white text-xs font-black uppercase rounded-full tracking-widest shadow-lg shadow-orange-500/30">
              Yapay Zeka Destekli Emlak
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-tight drop-shadow-2xl">
              Geleceğin Evini <br /> 
              <span className="text-orange-500">Konuşarak Bul.</span>
            </h1>
            <p className="text-lg text-slate-200 font-medium max-w-lg leading-relaxed">
              Binlerce ilan arasında kaybolmayın. Evinburada AI, ne istediğinizi anlar ve size en uygun seçenekleri saniyeler içinde sunar.
            </p>
            <div className="flex gap-4 pt-4">
              <button onClick={() => document.getElementById('ai-chat')?.scrollIntoView({behavior:'smooth'})} className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-white/5">Hemen Başla</button>
              <div className="flex -space-x-3 items-center">
                {[1,2,3,4].map(i => <img key={i} className="w-10 h-10 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" />)}
                <span className="pl-6 text-sm text-white font-bold">+5k mutlu kullanıcı</span>
              </div>
            </div>
          </div>

          {/* AI Chat Box Integration */}
          <div id="ai-chat" className="w-full max-w-md mx-auto lg:ml-auto bg-white/10 backdrop-blur-2xl rounded-[32px] p-1 border border-white/20 shadow-2xl overflow-hidden">
             <div className="bg-white rounded-[31px] flex flex-col h-[480px]">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12c0 1.88.52 3.65 1.43 5.17L2.1 21.4c-.11.38.25.74.63.63l4.23-1.33C8.35 21.48 10.12 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/></svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">Asistan</h4>
                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider animate-pulse">● Çevrimiçi</span>
                      </div>
                   </div>
                </div>
                
                <div ref={scrollRef} className="flex-grow overflow-y-auto p-5 space-y-4 hide-scrollbar">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm shadow-sm ${m.role === 'user' ? 'bg-orange-500 text-white rounded-br-none' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {isLoading && <div className="flex gap-1 p-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce delay-200"></span></div>}
                </div>

                <div className="p-4 border-t border-slate-100">
                   <div className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-orange-500 transition-colors">
                      <button onClick={startVoice} className={`p-2 rounded-xl ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-200'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                      </button>
                      <input 
                        className="flex-grow bg-transparent border-none text-sm focus:ring-0 placeholder:text-slate-400"
                        placeholder="Nerede ev bakıyorsun?"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                      />
                      <button onClick={() => handleSend(input)} className="w-10 h-10 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 shadow-lg shadow-orange-500/20 active:scale-90 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="py-12 border-b border-slate-100 overflow-hidden">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex gap-10 items-center justify-center overflow-x-auto hide-scrollbar pb-4">
            {CATEGORIES.map((cat, i) => (
              <button 
                key={i}
                onClick={() => onSearch(cat.filters)}
                className="flex flex-col items-center gap-3 group whitespace-nowrap opacity-60 hover:opacity-100 transition-all border-b-2 border-transparent hover:border-orange-500 pb-2"
              >
                <span className="text-2xl group-hover:scale-125 transition-transform">{cat.icon}</span>
                <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-slate-900">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Popular Regions Section */}
      <section className="py-24 container mx-auto px-6 lg:px-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900">En Çok Tercih Edilen Bölgeler</h2>
            <p className="text-slate-500 font-medium text-lg">Hangi bölge senin hayat tarzına daha uygun?</p>
          </div>
          <button className="px-8 py-3 border-2 border-slate-900 font-bold rounded-xl hover:bg-slate-900 hover:text-white transition-all">Tüm Bölgeleri Gör</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {REGIONS.map((region, i) => (
            <div 
              key={i} 
              onClick={() => onSearch({ locations: [region.name] })}
              className="group relative h-[400px] rounded-[32px] overflow-hidden cursor-pointer shadow-xl hover:shadow-orange-500/10 transition-all"
            >
              <img src={region.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={region.name} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8">
                <h4 className="text-2xl font-black text-white mb-1">{region.name}</h4>
                <p className="text-orange-400 font-bold text-sm tracking-wider">{region.count}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="container mx-auto px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <h3 className="text-4xl font-black leading-tight">Türkiye'nin En Akıllı <br /> Emlak Platformu</h3>
            <div className="space-y-6">
               {[
                 { t: 'Yapay Zeka DestSTekli', d: 'Karmaşık filtreler yerine sadece hayalini anlatman yeterli.' },
                 { t: 'Doğrudan İletişim', d: 'Emlak ofislerine tek tıkla ulaş, zaman kaybetme.' },
                 { t: 'Güvenilir İlanlar', d: 'Her gün binlerce doğrulanmış ilan platformumuza eklenir.' }
               ].map((item, i) => (
                 <div key={i} className="flex gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 group-hover:rotate-6 transition-transform">
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <h5 className="text-xl font-bold mb-1">{item.t}</h5>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.d}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6 relative">
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center space-y-2">
                <span className="text-4xl font-black text-orange-500">60+</span>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Özel İlan</p>
             </div>
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center space-y-2 translate-y-12">
                <span className="text-4xl font-black text-orange-500">10k+</span>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Mutlu Kullanıcı</p>
             </div>
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center space-y-2">
                <span className="text-4xl font-black text-orange-500">%98</span>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Memnuniyet</p>
             </div>
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 text-center space-y-2 translate-y-12">
                <span className="text-4xl font-black text-orange-500">2sn</span>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Arama Hızı</p>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-6 lg:px-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl font-black text-slate-900">Evinizi Bizimle Yayınlayın</h2>
          <p className="text-slate-500 text-lg font-medium">İlanınızı binlerce potansiyel alıcıya ve yapay zeka asistanımıza kaydedin. En doğru müşteriyi sizin yerinize biz bulalım.</p>
          <button className="px-12 py-5 bg-orange-600 text-white font-black rounded-2xl shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all">İlan Verin</button>
        </div>
      </section>
    </div>
  );
};

export default Home;
