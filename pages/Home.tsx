
import React, { useState, useEffect, useRef } from 'react';
import { startChat } from '../services/geminiService';
import { ChatMessage, SearchFilters } from '../types';

interface HomeProps {
  onSearch: (filters: SearchFilters) => void;
}

const Home: React.FC<HomeProps> = ({ onSearch }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', content: 'Hoş geldiniz. Bugün size nasıl bir ev bulabilirim? Beylikdüzü bölgesinde kiralık veya satılık ilanlar için buradayım.' }
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
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
          onSearch(fc.args as SearchFilters);
          setMessages(prev => [...prev, { role: 'model', content: 'Kriterlerinize uygun en iyi seçenekleri hazırlıyorum...' }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', content: response.text || 'Devam edelim, başka ne gibi özellikler istersiniz?' }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: 'Bir hata oluştu, lütfen tekrar dener misiniz?' }]);
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

  return (
    <div className="relative h-[calc(100vh-80px)] overflow-hidden bg-slate-50">
      {/* Background Hero */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1600585154340-be6191da910c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="Home Hero" 
          className="w-full h-full object-cover brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/60"></div>
      </div>

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
        <div className="text-center mb-8 text-white max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Akıllı Arama Deneyimi</h1>
          <p className="text-lg md:text-xl opacity-90">Siz sadece hayalinizi anlatın, gerisini yapay zeka halletsin.</p>
        </div>

        <div className="w-full max-w-3xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col h-[500px]">
          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-grow overflow-y-auto p-8 space-y-6 hide-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-5 py-4 rounded-[20px] text-[15px] leading-relaxed ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 px-5 py-4 rounded-[20px] rounded-tl-none flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.5s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <div className="flex items-center gap-3 p-2 border border-slate-200 rounded-full bg-slate-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/20 transition-all">
              <button 
                onClick={startVoice}
                className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-500 hover:bg-slate-200'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Örn: Beylikdüzü'nde 4 milyon civarı, site içinde 2+1..."
                className="flex-grow bg-transparent border-none focus:ring-0 text-sm px-2"
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={isLoading || !input.trim()}
                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
