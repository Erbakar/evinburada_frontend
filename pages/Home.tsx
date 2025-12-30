
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage, SearchFilters } from '../types';
import { useNavigate } from 'react-router-dom';

interface HomeProps {
  onSearch: (filters: SearchFilters) => void;
}

const CATEGORIES: { id: string; label: string; icon: string; filters: SearchFilters }[] = [
  { id: 'all', label: 'Tümü', icon: '🏠', filters: {} },
  { id: 'site', label: 'Site İçi', icon: '🏘️', filters: { inSite: true } },
  { id: 'rent', label: 'Kiralık', icon: '🔑', filters: { dealType: 'Kiralık' } },
  { id: 'sale', label: 'Satılık', icon: '💰', filters: { dealType: 'Satılık' } },
  { id: 'luxury', label: 'Lüks', icon: '✨', filters: { minPrice: 10000000 } },
  { id: 'room2', label: '2+1 Evler', icon: '🛌', filters: { roomCount: '2+1' } },
  { id: 'room3', label: '3+1 Evler', icon: '🛋️', filters: { roomCount: '3+1' } },
];

const Home: React.FC<HomeProps> = ({ onSearch }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Merhaba! Ben Evinburada asistanınız. Size Beylikdüzü ve çevresinde hayalinizdeki evi bulmamda nasıl yardımcı olabilirim?' }
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
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: text });
      
      if (response.functionCalls && response.functionCalls.length > 0) {
        const fc = response.functionCalls[0];
        if (fc.name === 'search_homes') {
          setMessages(prev => [...prev, { role: 'model', content: 'Harika seçim! Kriterlerinize uygun en iyi ilanları sizin için listeliyorum...' }]);
          setTimeout(() => {
            onSearch(fc.args as SearchFilters);
          }, 1500);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: response.text || 'Anladım. Başka hangi özellikler sizin için önemli?' }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Üzgünüm, bir bağlantı sorunu oluştu. Lütfen tekrar deneyin.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tarayıcınız ses tanımayı desteklemiyor.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => handleSend(event.results[0][0].transcript);
    recognition.start();
  };

  const handleCategoryClick = (filters: SearchFilters) => {
    onSearch(filters);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Modern House" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent"></div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col items-center pt-20 px-4">
          <h2 className="text-white text-3xl md:text-5xl font-extrabold text-center mb-8 drop-shadow-lg tracking-tight">
            Hayalindeki Evi Yapay Zeka ile Bul
          </h2>
          
          {/* AI Search Card (Integrated) */}
          <div className="w-full max-w-2xl bg-white/95 backdrop-blur-md rounded-[28px] shadow-2xl overflow-hidden flex flex-col h-[380px] border border-white/20">
            {/* Chat History Area */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 hide-scrollbar">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-snug shadow-sm ${
                    m.role === 'user' 
                      ? 'bg-orange-500 text-white rounded-tr-none' 
                      : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-bounce [animation-delay:-0.5s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex items-center gap-2 p-1.5 border border-slate-200 rounded-full bg-slate-50 focus-within:bg-white focus-within:ring-4 focus-within:ring-orange-500/10 transition-all">
                <button 
                  onClick={startVoice}
                  title="Sesle ara"
                  className={`p-2.5 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-200'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                  placeholder="Kiralık 3+1, havuzlu site olsun..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm font-medium text-slate-700 px-2 placeholder:text-slate-400"
                />
                <button 
                  onClick={() => handleSend(input)}
                  disabled={isLoading || !input.trim()}
                  className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 transition-all shadow-lg active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories / Manual Filters Section */}
      <div className="max-w-[1760px] mx-auto w-full px-4 md:px-10 lg:px-20 py-12">
        <div className="flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900">Popüler Kategoriler</h3>
            <button 
              onClick={() => onSearch({})}
              className="text-sm font-bold underline underline-offset-4 text-slate-600 hover:text-orange-600 transition-colors"
            >
              Tümünü gör
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
            {CATEGORIES.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => handleCategoryClick(cat.filters)}
                className="group flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border border-slate-100 hover:border-orange-100 hover:bg-orange-50/30 transition-all cursor-pointer airbnb-card-shadow"
              >
                <div className="text-3xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-110">
                  {cat.icon}
                </div>
                <span className="text-sm font-bold text-slate-700 group-hover:text-orange-600">
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Informational Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="p-8 rounded-[32px] bg-slate-900 text-white">
            <h4 className="text-xl font-bold mb-3">AI Destekli Arama</h4>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tek tek filtrelerle uğraşmak yerine ne aradığınızı anlatın. Yapay zekamız binlerce ilan arasından size en uygun olanı saniyeler içinde bulsun.
            </p>
          </div>
          <div className="p-8 rounded-[32px] bg-orange-50 border border-orange-100">
            <h4 className="text-xl font-bold mb-3 text-orange-900">Doğrulanmış İlanlar</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Portföyümüzdeki tüm ilanlar güvenilir emlak ofislerinden ve doğrulanmış kaynaklardan anlık olarak çekilir.
            </p>
          </div>
          <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-200">
            <h4 className="text-xl font-bold mb-3 text-slate-900">Akıllı Karşılaştırma</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              Fiyat analizi ve bölge trendlerini sizin için takip ediyoruz. Karar verme sürecinizi kolaylaştıracak veriler sunuyoruz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
