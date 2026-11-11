/**
 * ALTIN EMLAK SİVAS - ÇİFT YÖNLÜ AKILLI EŞLEŞTİRME MOTORU (SMART MATCH ENGINE)
 * Portföy İlanları ile Alıcı/Kiracı Taleplerini 5 Temel Kriterde Birebir Eşleştirir.
 */

/**
 * Tek bir Talep ile İlan arasındaki uyumu puanlar (0 - 100 Puan)
 */
export function evaluateMatch(demand, listing) {
  // Aktif olmayan ilanlar veya talepler eşleşmeye girmez
  if (listing.status && listing.status !== 'aktif') {
    return { score: 0, matched: false, quality: 'none', reasons: ['İlan aktif değil'], breakdown: {} };
  }
  if (demand.status && demand.status !== 'aktif') {
    return { score: 0, matched: false, quality: 'none', reasons: ['Talep aktif değil'], breakdown: {} };
  }

  let score = 0;
  const reasons = [];
  const breakdown = {
    typeMatch: false,
    categoryMatch: false,
    priceMatch: 0,
    locationMatch: 0,
    roomMatch: 0
  };

  // -------------------------------------------------------------
  // 1. İŞLEM TÜRÜ UYUMU (Satılık / Kiralık / Devren) - [30 PUAN - ZORUNLU]
  // -------------------------------------------------------------
  const demandType = (demand.type || '').toLowerCase();
  const listingType = (listing.type || '').toLowerCase();

  const isTypeCompatible =
    demandType === listingType ||
    (demandType === 'alici' && listingType === 'satilik') ||
    (demandType === 'kiraci' && listingType === 'kiralik');

  if (!isTypeCompatible) {
    return {
      score: 0,
      matched: false,
      quality: 'none',
      reasons: ['İşlem türü uyuşmuyor (Biri Satılık, diğeri Kiralık)'],
      breakdown
    };
  }

  score += 30;
  breakdown.typeMatch = true;
  reasons.push(demandType === 'kiralik' ? 'İşlem türü kiralık olarak uyuşuyor' : 'İşlem türü satılık olarak uyuşuyor');

  // -------------------------------------------------------------
  // 2. KATEGORİ UYUMU (Konut, Arsa, Ticari) - [15 PUAN - ZORUNLU]
  // -------------------------------------------------------------
  const demandCat = (demand.category || '').toLowerCase();
  const listingCat = (listing.category || '').toLowerCase();

  if (demandCat && listingCat && demandCat !== listingCat) {
    return {
      score: 0,
      matched: false,
      quality: 'none',
      reasons: [`Kategori uyuşmuyor (Talep: ${demandCat}, İlan: ${listingCat})`],
      breakdown
    };
  }

  score += 15;
  breakdown.categoryMatch = true;
  reasons.push(`Gayrimenkul türü uygun (${(listing.category || 'Konut').toUpperCase()})`);

  // -------------------------------------------------------------
  // 3. FİYAT / BÜTÇE UYUMU - [25 PUAN]
  // -------------------------------------------------------------
  const minP = Number(demand.minPrice) || 0;
  const maxP = Number(demand.maxPrice) || Infinity;
  const price = Number(listing.price) || 0;

  if (price >= minP && price <= maxP) {
    score += 25;
    breakdown.priceMatch = 25;
    reasons.push('Fiyat tam aranan bütçe aralığında');
  } else {
    // %15 Tolerans (Pazarlık payı hesabı)
    const tolMin = minP > 0 ? minP * 0.85 : 0;
    const tolMax = maxP < Infinity ? maxP * 1.15 : Infinity;
    if (price >= tolMin && price <= tolMax) {
      score += 15;
      breakdown.priceMatch = 15;
      reasons.push('Fiyat bütçeye çok yakın (%15 pazarlık payı dahilinde)');
    }
  }

  // -------------------------------------------------------------
  // 4. MAHALLE VE BÖLGE UYUMU (Sivas İçi Mahalleler) - [20 PUAN]
  // -------------------------------------------------------------
  const listingNeigh = (listing.neighborhood || '').toLowerCase();
  const listingTitle = (listing.title || '').toLowerCase();
  const listingAddr = (listing.address || '').toLowerCase();

  const reqNeighborhoods = Array.isArray(demand.neighborhoods)
    ? demand.neighborhoods
    : (demand.neighborhood ? [demand.neighborhood] : []);

  let neighMatched = false;
  let matchedNeighName = '';

  for (const n of reqNeighborhoods) {
    const cleanN = n.toLowerCase().trim();
    if (!cleanN) continue;
    if (
      listingNeigh.includes(cleanN) ||
      cleanN.includes(listingNeigh) ||
      listingTitle.includes(cleanN) ||
      listingAddr.includes(cleanN)
    ) {
      neighMatched = true;
      matchedNeighName = n;
      break;
    }
  }

  if (neighMatched) {
    score += 20;
    breakdown.locationMatch = 20;
    reasons.push(`Birebir aranan mahallede (${matchedNeighName})`);
  } else if (reqNeighborhoods.length === 0 || (demand.district && demand.district.toLowerCase() === (listing.district || '').toLowerCase())) {
    score += 10;
    breakdown.locationMatch = 10;
    reasons.push(`Aynı ilçe bölgesinde (${listing.district || 'Merkez'})`);
  }

  // -------------------------------------------------------------
  // 5. ODA SAYISI UYUMU (1+1, 2+1, 3+1, 4+1, Villa vb.) - [10 PUAN]
  // -------------------------------------------------------------
  const reqRooms = Array.isArray(demand.roomCounts)
    ? demand.roomCounts
    : (demand.roomCount ? [demand.roomCount] : []);

  if (listingCat === 'konut') {
    if (reqRooms.length === 0 || reqRooms.includes(listing.roomCount)) {
      score += 10;
      breakdown.roomMatch = 10;
      reasons.push(`Oda sayısı tercihi uygun (${listing.roomCount})`);
    }
  } else {
    // Arsa veya Ticari için oda sayısı puanı doğrudan verilir
    score += 10;
    breakdown.roomMatch = 10;
  }

  const finalScore = Math.min(score, 100);
  let quality = 'none';
  if (finalScore >= 85) quality = 'mukemmel'; // Mükemmel / Tam Eşleşme
  else if (finalScore >= 70) quality = 'yuksek';   // Yüksek Uyum
  else if (finalScore >= 50) quality = 'kismi';    // Kısmi Uyum

  return {
    score: finalScore,
    matched: finalScore >= 50,
    quality,
    reasons,
    breakdown
  };
}

/**
 * Bir talep için tüm aktif ilanlar arasından eşleşenleri bulur ve puan sırasına göre dizer
 */
export function findListingMatchesForDemand(demand, listings = []) {
  return listings
    .map(listing => {
      const evaluation = evaluateMatch(demand, listing);
      return {
        listing,
        ...evaluation
      };
    })
    .filter(m => m.matched)
    .sort((a, b) => b.score - a.score);
}

/**
 * Bir portföy ilanı için tüm aktif talepler arasından eşleşenleri bulur ve puan sırasına göre dizer
 */
export function findDemandMatchesForListing(listing, demands = []) {
  return demands
    .map(demand => {
      const evaluation = evaluateMatch(demand, listing);
      return {
        demand,
        ...evaluation
      };
    })
    .filter(m => m.matched)
    .sort((a, b) => b.score - a.score);
}
