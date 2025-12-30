
import { Listing } from '../types';

const houseImages = [
  'https://images.unsplash.com/photo-1600585154340-be6199f7d009',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
  'https://images.unsplash.com/photo-1600607687940-4ad2364775a3',
  'https://images.unsplash.com/photo-1600566753190-17f0bb2a6c3e',
  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0',
  'https://images.unsplash.com/photo-1600573472591-ee6b68d14c68',
  'https://images.unsplash.com/photo-1600585154542-630a5c2ec893',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be',
  'https://images.unsplash.com/photo-1580587767303-941bd278791a',
  'https://images.unsplash.com/photo-1449156001437-3a1661acda2e',
  'https://images.unsplash.com/photo-1549517045-bc93de075e53',
  'https://images.unsplash.com/photo-1512915922686-57c11ed9d6f3',
  'https://images.unsplash.com/photo-1515263487990-61b07816b324',
  'https://images.unsplash.com/photo-1510798831971-661eb04b3739',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf',
  'https://images.unsplash.com/photo-1513584684374-8bdb74838a0f',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
  'https://images.unsplash.com/photo-1484154218962-a197022b5858',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e',
  'https://images.unsplash.com/photo-1554995207-c18c203602cb'
];

export const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

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
      price = Math.floor(Math.random() * 25000000) + 6000000;
    }

    const id = startId + i;
    // Görsellerin daha kararlı olması için indeksleme optimize edildi
    const imgBase = houseImages[id % houseImages.length];

    return {
      id: `listing-${id}`,
      title: `${neighborhood} Mahallesinde ${dealType} ${inSite ? 'Site İçi ' : ''}${roomCount} Daire`,
      price,
      province: 'İstanbul',
      location: district,
      neighborhood,
      roomCount,
      area: Math.floor(Math.random() * 150) + 60,
      dealType,
      inSite,
      sourceName,
      sourceUrl: sourceName === 'Hepsiemlak' ? 'https://www.hepsiemlak.com' : 'https://www.emlakjet.com',
      description: `${district} bölgesinin en nezih noktalarından ${neighborhood} mahallesinde yer alan bu mülk, ${dealType} fırsatı olarak sunulmaktadır. Modern mimarisi ve ferah yapısıyla kaçırılmayacak bir seçenek.`,
      imageUrl: `${imgBase}?auto=format&fit=crop&w=800&q=80`,
      createdAt
    };
  });
};

const beylikduzuNeighborhoods = ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'];
const sisliNeighborhoods = ['Nişantaşı', 'Teşvikiye', 'Mecidiyeköy', 'Fulya', 'Feriköy', 'Kurtuluş', 'Gülbağ'];
const besiktasNeighborhoods = ['Bebek', 'Arnavutköy', 'Ortaköy', 'Etiler', 'Levent', 'Gayrettepe', 'Dikilitaş'];
const kadikoyNeighborhoods = ['Moda', 'Caddebostan', 'Suadiye', 'Feneryolu', 'Erenköy', 'Göztepe', 'Bostancı'];

export const mockListings: Listing[] = [
  ...generateListings(40, 'Beylikdüzü', beylikduzuNeighborhoods, 1),
  ...generateListings(40, 'Şişli', sisliNeighborhoods, 100),
  ...generateListings(40, 'Beşiktaş', besiktasNeighborhoods, 200),
  ...generateListings(40, 'Kadıköy', kadikoyNeighborhoods, 300)
];
