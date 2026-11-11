/**
 * Altın Emlak - Otomatik WebP Dönüştürücü ve Boyut Sıkıştırıcı
 * Telefon kamerasından veya galeriden gelen 5-10 MB'lık fotoğrafları 
 * gözle görülür kalite kaybı olmadan 150-250 KB'lık Full HD WebP formatına çevirir.
 */
export async function compressToWebP(file, maxWidth = 1920, quality = 0.82) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // 1920px'den büyükse orantılı olarak küçült
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Şeffaf PNG'ler siyah olmasın diye beyaz zemin
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve(file);
            }
            const cleanName = (file.name || 'foto').replace(/\.[^/.]+$/, '');
            const webpFile = new File([blob], `${cleanName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now()
            });
            console.log(`[WebP Optimizer] ${(file.size / 1024 / 1024).toFixed(2)} MB -> ${(webpFile.size / 1024).toFixed(1)} KB (%${Math.round((1 - webpFile.size / file.size) * 100)} tasarruf)`);
            resolve(webpFile);
          },
          'image/webp',
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = readerEvent.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Birden fazla fotoğrafı sırayla WebP'ye dönüştürür
 */
export async function compressMultipleToWebP(files, onProgress) {
  const fileList = Array.from(files || []);
  const results = [];
  for (let i = 0; i < fileList.length; i++) {
    const compressed = await compressToWebP(fileList[i]);
    results.push(compressed);
    if (onProgress) {
      onProgress(i + 1, fileList.length);
    }
  }
  return results;
}
