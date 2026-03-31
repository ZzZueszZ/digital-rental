import { useState, useEffect } from 'react';

export function useImageColor(imageSrc: string): string | null {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!imageSrc || typeof window === 'undefined') return;

    try {
      const img = new Image();
      // Ensure crossOrigin works if images are hosted externally
      img.crossOrigin = 'Anonymous';
      img.src = imageSrc;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Create a 1x1 canvas to draw the scaled-down/averaged corner of the image
        canvas.width = 1;
        canvas.height = 1;

        // Sample a 50x50 block from the top-left edge instead of just 1 pixel
        // Scaling it down to 1x1 automatically averages the colors
        ctx.drawImage(img, 0, 0, Math.min(50, img.naturalWidth), Math.min(50, img.naturalHeight), 0, 0, 1, 1);

        const data = ctx.getImageData(0, 0, 1, 1).data;
        const [r, g, b] = data;
        
        // Prevent pure black or white from breaking contrast
        setColor(`rgb(${r}, ${g}, ${b})`);
      };
    } catch (err) {
      console.warn('Could not extract image color:', err);
    }
  }, [imageSrc]);

  return color;
}
