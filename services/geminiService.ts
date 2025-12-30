
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { SearchFilters } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const searchHomesFunction: FunctionDeclaration = {
  name: 'search_homes',
  description: 'Kullanıcının belirttiği kriterlere göre ülke genelinde ev araması yapar.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      locations: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Aranan şehir, ilçe veya mahalle listesi (ör: ["Şişli", "Beylikdüzü", "Ankara"])' 
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
      systemInstruction: `Sen 'Evinburada' emlak asistanısın. Görevin kullanıcıların tüm Türkiye genelinde hayalindeki evi bulmasına yardımcı olmaktır.
      
      GENEL KAPSAM:
      - Türkiye'nin her yerinden arama yapabilirsin. Şu an sistemimizde örnek olarak özellikle Beylikdüzü ve Şişli bölgelerinde yoğun ilanlar bulunmaktadır.
      - Kullanıcı "Günlük Kiralık" ev aradığında dealType olarak 'Günlük Kiralık' seçmelisin.

      KONUM VE "BANA YAKIN" ÖZELLİĞİ:
      1. Eğer kullanıcı "bana yakın evler", "yakınımdaki ilanlar" gibi bir şey söylerse, 'get_user_location' fonksiyonunu çağırarak koordinatlarını iste.
      2. Koordinatlar geldiğinde, kullanıcının bulunduğu şehir ve ilçeyi tespit etmeye çalış ve o bölgedeki ilanlara odaklan.

      KONU DIŞI (OFF-TOPIC) POLİTİKASI:
      1. Eğer kullanıcı emlak, ev arama veya konut kriterleri dışında alakasız bir şey yazarsa, nazikçe konuyu tekrar ev aramasına çek.
      2. Kullanıcıyı asla tersleme, odağını her zaman şu kriterlere yönlendir: Konum, Kiralık/Satılık/Günlük, Oda Sayısı, Fiyat, Site Durumu.

      DİĞER BİLGİLER:
      - Yeterli bilgi topladığında 'search_homes' fonksiyonunu çağır.
      - Her zaman nazik, samimi ve profesyonel bir Türkçe kullan.`,
      tools: [{ functionDeclarations: [searchHomesFunction, getUserLocationFunction] }]
    }
  });
};
