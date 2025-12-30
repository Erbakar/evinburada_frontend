
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchHomesFunction: FunctionDeclaration = {
  name: 'search_homes',
  description: 'Kullanıcının belirttiği kriterlere göre hiyerarşik konum bazlı (İl, İlçe, Mahalle) ev araması yapar.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      province: { type: Type.STRING, description: 'Aranan şehir (ör: "İstanbul", "Ankara")' },
      district: { type: Type.STRING, description: 'Aranan ilçe (ör: "Beşiktaş", "Kadıköy")' },
      neighborhoods: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Aranan mahalleler (ör: ["Moda", "Bebek"])' 
      },
      dealType: { type: Type.STRING, enum: ['Kiralık', 'Satılık', 'Günlük Kiralık'], description: 'Kiralık, Satılık veya Günlük Kiralık mı?' },
      roomCount: { type: Type.STRING, description: 'Oda sayısı (ör: 2+1, 3+1, 1+0)' },
      inSite: { type: Type.BOOLEAN, description: 'Site içerisinde mi?' },
      minPrice: { type: Type.NUMBER, description: 'Minimum fiyat (TL cinsinden)' },
      maxPrice: { type: Type.NUMBER, description: 'Maximum fiyat (TL cinsinden)' }
    },
    required: ['dealType']
  }
};

const getUserLocationFunction: FunctionDeclaration = {
  name: 'get_user_location',
  description: 'Kullanıcının mevcut coğrafi konumunu (enlem ve boylam) alır.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

export const startChat = () => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: `Sen 'Evinburada' emlak asistanısın. Görevin kullanıcıların hiyerarşik (İl > İlçe > Mahalle) yapıda hayalindeki evi bulmasına yardımcı olmaktır.
      
      KRİTİK KURALLAR:
      1. Kullanıcı bir bölge belirttiğinde, bu bölgenin İl, İlçe veya Mahalle olup olmadığını anla ve 'search_homes' fonksiyonuna buna göre (province, district veya neighborhoods alanlarını kullanarak) gönder.
      2. Kullanıcıya ilanları listelediğini söylediğin her an, MUTLAKA 'search_homes' fonksiyonunu çağırmalısın.
      3. Filtreleme alanı ile asistan tam senkron çalışmaktadır. Senin yaptığın her değişiklik UI'daki filtrelerde görünecektir.

      KONUM VE "BANA YAKIN" ÖZELLİĞİ:
      - Kullanıcı yakındakileri sorarsa 'get_user_location' çağır. Koordinat gelince bölgeyi tespit edip aramayı ona göre yap.

      Hiyerarşi Örneği:
      - İstanbul (İl) -> Beşiktaş (İlçe) -> Bebek (Mahalle)
      
      Her zaman nazik, samimi ve profesyonel bir Türkçe kullan.`,
      tools: [{ functionDeclarations: [searchHomesFunction, getUserLocationFunction] }]
    }
  });
};
