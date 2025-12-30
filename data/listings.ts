
import { Listing } from '../types';

export const mockListings: Listing[] = Array.from({ length: 30 }).map((_, i) => {
  const neighborhoods = ['Adnan Kahveci', 'Yakuplu', 'Kavaklı', 'Gürpınar', 'Cumhuriyet', 'Barış', 'Sahil'];
  const roomOptions = ['1+1', '2+1', '3+1', '4+1', '4+2'];
  const dealTypes: ('Kiralık' | 'Satılık')[] = ['Kiralık', 'Satılık'];
  const sources: ('Hepsiemlak' | 'Emlakjet')[] = ['Hepsiemlak', 'Emlakjet'];
  
  const dealType = dealTypes[Math.floor(Math.random() * dealTypes.length)];
  const neighborhood = neighborhoods[Math.floor(Math.random() * neighborhoods.length)];
  const roomCount = roomOptions[Math.floor(Math.random() * roomOptions.length)];
  const inSite = Math.random() > 0.5;
  const sourceName = sources[Math.floor(Math.random() * sources.length)];
  
  // Logical pricing for region
  const price = dealType === 'Kiralık' 
    ? Math.floor(Math.random() * 25000) + 12000 
    : Math.floor(Math.random() * 10000000) + 3000000;

  return {
    id: `listing-${i + 1}`,
    title: `${neighborhood} Mahallesinde ${inSite ? 'Site İçerisinde ' : ''}${roomCount} Harika Daire`,
    price,
    location: 'Beylikdüzü',
    neighborhood,
    roomCount,
    area: Math.floor(Math.random() * 150) + 70,
    dealType,
    inSite,
    sourceName,
    sourceUrl: sourceName === 'Hepsiemlak' ? 'https://www.hepsiemlak.com' : 'https://www.emlakjet.com',
    description: `Beylikdüzü'nün en nezih bölgelerinden biri olan ${neighborhood} mahallesinde yer alan bu portföyümüz, ferah yapısı ve modern mimarisiyle dikkat çekiyor. ${inSite ? 'Sosyal donatıları yüksek bir site içerisinde yer almaktadır.' : 'Merkezi konumda olup ulaşım akslarına çok yakındır.'} Detaylar için iletişime geçiniz.`,
    imageUrl: `https://picsum.photos/seed/${i + 100}/800/600`
  };
});
