/**
 * Altın Emlak - YouTube Shorts & Instagram Reels Video Çözücü
 * İlanlara eklenen video linklerini algılar, doğrular ve responsive oynatıcı embed koduna dönüştürür.
 */

export function parseVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url) return null;

  // 1. YouTube Shorts veya Standart YouTube
  // Formatlar:
  // - https://www.youtube.com/shorts/3i7z1pQhZkU
  // - https://youtube.com/shorts/3i7z1pQhZkU?feature=share
  // - https://youtu.be/3i7z1pQhZkU
  // - https://www.youtube.com/watch?v=3i7z1pQhZkU
  const shortsRegex = /(?:youtube\.com\/shorts\/|youtu\.be\/|youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/;
  const ytMatch = url.match(shortsRegex);
  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    const isShorts = url.includes('/shorts/');
    return {
      type: 'youtube',
      isShorts,
      platformName: isShorts ? 'YouTube Shorts' : 'YouTube Video',
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
      watchUrl: isShorts ? `https://www.youtube.com/shorts/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  // 2. Instagram Reels veya Post
  // Formatlar:
  // - https://www.instagram.com/reel/C123456789/
  // - https://www.instagram.com/p/C123456789/
  // - https://instagram.com/reels/C123456789/
  const instaRegex = /(?:instagram\.com\/(?:reel|reels|p)\/)([a-zA-Z0-9_-]+)/;
  const instaMatch = url.match(instaRegex);
  if (instaMatch && instaMatch[1]) {
    const reelId = instaMatch[1];
    return {
      type: 'instagram',
      isShorts: true,
      platformName: 'Instagram Reels',
      reelId,
      embedUrl: `https://www.instagram.com/reel/${reelId}/embed`,
      watchUrl: `https://www.instagram.com/reel/${reelId}/`
    };
  }

  // 3. Doğrudan Video Dosyası (.mp4 / .webm)
  if (url.match(/\.(mp4|webm|mov)(\?.*)?$/i)) {
    return {
      type: 'direct',
      isShorts: false,
      platformName: 'Doğrudan Video',
      videoUrl: url
    };
  }

  return {
    type: 'unknown',
    isShorts: false,
    platformName: 'Video Bağlantısı',
    watchUrl: url
  };
}
