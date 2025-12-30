
import { Listing } from '../types';

const generateListings = (count: number, district: string, neighborhoods: string[], startId: number): Listing[] => {
  return Array.from({ length: count }).map((_, i) => {
    const roomOptions = ['1+1', '2+1', '3+1', '4+1', '1+0'];
    const dealTypes: ('Kiralık' | 'Satılık' | 'Günlük Kiralık')[] = ['Kiralık', 'Satılık', 'Günlük Kiralık'];
    const sources: ('Hepsiemlak' | 'Emlakjet')[] = ['Hepsiemlak', 'Emlakjet'];
    
    const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
    const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
    const roomCount = roomOptions[Math.floor(Math.random() * roomOptions.length)];
    const inSite = Math.random() > 0.4;
    const sourceName = sources[Math.floor(Math.random() * sources.length)];
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 30));
    const createdAt = date.toISOString();

    let price = 0;
    if (dealType === 'Kiralık') {
      price = Math.floor(Math.random() * 35000) + 15000;
    } else if (dealType === 'Günlük Kiralık') {
      price = Math.floor(Math.random() * 4000) + 1500;
    } else {
      price = Math.floor(Math.random() * 15000000) + 4000000;
    }

    const id = startId + i;

    return {
      id: `listing-${id}`,
      title: `${neighborhood} Mahallesinde ${dealType} ${inSite ? 'Site İçi ' : ''}${roomCount} Daire`,
      price,
      location: district,
      neighborhood,
      roomCount,
      area: Math.floor(Math.random() * 120) + 50,
      dealType,
      inSite,
      sourceName,
      sourceUrl: sourceName === 'Hepsiemlak' ? 'https://www.hepsiemlak.com' : 'https://www.emlakjet.com',
      description: `${district} bölgesinin kalbi ${neighborhood} mahallesinde bulunan bu ilan, ${dealType} kategorisinde nadir bir fırsattır. ${inSite ? 'Geniş sosyal olanaklara sahip bir site içerisindedir.' : 'Ulaşım araçlarına ve çarşıya yürüme mesafesindedir.'} Şehir hayatının tadını çıkarın.`,
      imageUrl: `https://picsum.photos/seed/${id + 500}/800/600`,
      createdAt
    };
  });
};

const beylikduzuNeighborhoods = ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'];
const sisliNeighborhoods = ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ'];

export const mockListings: Listing[] = [
  ...generateListings(30, 'Beylikdüzü', beylikduzuNeighborhoods, 1),
  ...generateListings(30, 'Şişli', sisliNeighborhoods, 100)
];
