
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchHomesFunction: FunctionDeclaration = {
  name: 'search_homes',
  description: 'Gathers the filters collected during conversation and triggers a home search.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: { type: Type.STRING, description: 'Semt veya mahalle ismi (ör: Beylikdüzü, Adnan Kahveci)' },
      dealType: { type: Type.STRING, enum: ['Kiralık', 'Satılık'], description: 'Kiralık mı Satılık mı?' },
      roomCount: { type: Type.STRING, description: 'Oda sayısı (ör: 2+1, 3+1)' },
      inSite: { type: Type.BOOLEAN, description: 'Site içerisinde mi?' }
    },
    required: ['dealType', 'roomCount']
  }
};

export const startChat = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Sen 'Evinburada' adlı emlak platformunun akıllı asistanısın. 
      Görevin kullanıcıya hayalindeki evi bulması için rehberlik etmek.
      Kullanıcıdan şu bilgileri nazikçe topla: 
      1. Hangi semt (Örn: Beylikdüzü)?
      2. Kiralık mı Satılık mı?
      3. Oda sayısı (Örn: 2+1)?
      4. Site içerisinde mi istiyor?
      
      Eğer kullanıcı bu bilgilerin çoğunu verdiyse 'search_homes' fonksiyonunu çağır. 
      Tüm bilgiler toplanana kadar sohbeti sürdür. Çok resmi olma, yardımsever bir emlak danışmanı gibi davran. 
      Dilin mutlaka Türkçe olmalı.`,
      tools: [{ functionDeclarations: [searchHomesFunction] }]
    }
  });
};
