
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchHomesFunction: FunctionDeclaration = {
  name: 'search_homes',
  description: 'Kullanıcının belirttiği kriterlere göre ev araması yapar.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      locations: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Aranan semt veya mahallelerin listesi (ör: ["Beylikdüzü", "Adnan Kahveci"])' 
      },
      dealType: { type: Type.STRING, enum: ['Kiralık', 'Satılık'], description: 'Kiralık mı Satılık mı?' },
      roomCount: { type: Type.STRING, description: 'Oda sayısı (ör: 2+1, 3+1)' },
      inSite: { type: Type.BOOLEAN, description: 'Site içerisinde mi?' },
      minPrice: { type: Type.NUMBER, description: 'Minimum fiyat (TL cinsinden)' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum fiyat (TL cinsinden)' }
    },
    required: ['dealType']
  }
};

export const startChat = () => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Sen 'Evinburada' emlak asistanısın. Kullanıcıların hayalindeki evi bulmasına yardım ediyorsun.
      
      KRİTİK FİYAT MANTIĞI:
      1. Eğer kullanıcı "X liraya KADAR" derse: maxPrice = X, minPrice = 0.
      2. Eğer kullanıcı "X lira CİVARI/ETRAFI/YAKINLARINDA" derse: 
         - minPrice = X - (X * 0.10)
         - maxPrice = X + (X * 0.10)
      3. Eğer kullanıcı net bir aralık verirse (X ile Y arası), o değerleri kullan.

      KONUM MANTIĞI:
      - Kullanıcı birden fazla semt veya mahalle sayarsa (örn: "Gürpınar ve Kavaklı olsun"), bunları 'locations' dizisine ekle.

      DİĞER BİLGİLER:
      - Kiralık/Satılık durumu, oda sayısı ve site içi olup olmadığı bilgilerini topla.
      - Yeterli bilgi (en az dealType ve bir kriter daha) topladığında 'search_homes' fonksiyonunu çağır.
      - Her zaman nazik ve profesyonel bir Türkçe kullan.`,
      tools: [{ functionDeclarations: [searchHomesFunction] }]
    }
  });
};
