
import { SearchFilters } from "../types";

const LOCATION_DATA = {
  'İstanbul': {
    'Beşiktaş': ['Bebek', 'Arnavutköy', 'Ortaköy', 'Etiler', 'Levent', 'Gayrettepe', 'Dikilitaş'],
    'Kadıköy': ['Moda', 'Caddebostan', 'Suadiye', 'Feneryolu', 'Erenköy', 'Göztepe', 'Bostancı'],
    'Şişli': ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ'],
    'Beylikdüzü': ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil']
  }
};

export const startChat = () => {
  return {
    sendMessage: async ({ message }: { message: string }) => {
      // Yapay zeka simülasyonu için kısa bir gecikme
      await new Promise(resolve => setTimeout(resolve, 800));

      const lowerMessage = message.toLowerCase();
      
      // Konum koordinatları geldiyse (Bana yakın özelliği)
      if (lowerMessage.includes('konum:') || lowerMessage.includes('enlem:')) {
        return {
          text: "Bulunduğun konumu analiz ettim. Beşiktaş bölgesine yakın olduğun için buradaki ilanları listeliyorum.",
          functionCalls: [{ 
            name: 'search_homes', 
            args: { province: 'İstanbul', district: 'Beşiktaş' } 
          }]
        };
      }

      const filters: SearchFilters = {};
      let responseParts: string[] = [];

      // 1. İlan Tipi
      if (lowerMessage.includes('kiralık')) {
        filters.dealType = 'Kiralık';
        responseParts.push('kiralık');
      } else if (lowerMessage.includes('satılık')) {
        filters.dealType = 'Satılık';
        responseParts.push('satılık');
      } else if (lowerMessage.includes('günlük')) {
        filters.dealType = 'Günlük Kiralık';
        responseParts.push('günlük kiralık');
      }

      // 2. Oda Sayısı
      const roomMatch = lowerMessage.match(/(\d\+\d)/);
      if (roomMatch) {
        filters.roomCount = roomMatch[0];
        responseParts.push(`${roomMatch[0]} odalı`);
      }

      // 3. Konum Tespiti
      let locationText = "";
      for (const [province, districts] of Object.entries(LOCATION_DATA)) {
        if (lowerMessage.includes(province.toLowerCase())) {
          filters.province = province;
        }

        for (const [district, neighborhoods] of Object.entries(districts)) {
          if (lowerMessage.includes(district.toLowerCase())) {
            filters.province = province;
            filters.district = district;
            locationText = district;
          }
          
          for (const neighborhood of neighborhoods) {
            if (lowerMessage.includes(neighborhood.toLowerCase())) {
              filters.province = province;
              filters.district = district;
              filters.neighborhoods = [neighborhood];
              locationText = `${district} ${neighborhood}`;
            }
          }
        }
      }

      // 4. Site İçi
      if (lowerMessage.includes('site') || lowerMessage.includes('sitesi')) {
        filters.inSite = true;
        responseParts.push('site içerisinde');
      }

      // 5. "Yakın" veya "Etraf" kontrolü
      if (lowerMessage.includes('yakın') || lowerMessage.includes('etraf') || lowerMessage.includes('çevrem')) {
        return {
          text: "Yakındaki ilanları bulmak için konum izni istiyorum...",
          functionCalls: [{ name: 'get_user_location', args: {} }]
        };
      }

      let finalResponse = "İstediğiniz kriterlere uygun ilanları hazırlıyorum.";
      if (locationText || responseParts.length > 0) {
        finalResponse = `${locationText ? locationText + ' bölgesinde ' : ''}${responseParts.join(' ')} ilanları listeliyorum.`;
      }

      return {
        text: finalResponse,
        functionCalls: [{ name: 'search_homes', args: filters }]
      };
    }
  };
};

