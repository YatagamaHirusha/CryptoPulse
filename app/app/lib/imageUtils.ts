
/**
 * Compresses an image file and converts it to WebP format.
 * @param file The original image file
 * @param maxWidth The maximum width of the output image (default: 1920px)
 * @param quality The quality of the WebP image (0 to 1, default: 0.8)
 * @returns A Promise that resolves to the compressed WebP File
 */
export async function compressImage(
  file: File, 
  maxWidth: number = 1920, 
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      // Calculate new dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw image to canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(img.src);
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(img.src);
          
          if (!blob) {
            reject(new Error('Could not compress image'));
            return;
          }
          
          // Create new file with .webp extension
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const newFile = new File([blob], newFileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          
          resolve(newFile);
        },
        'image/webp',
        quality
      );
    };
    
    img.onerror = (error) => {
      URL.revokeObjectURL(img.src);
      reject(error);
    };
  });
}
