import { useCallback, useState } from 'react';

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [tileImages, setTileImages] = useState<(string | null)[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // size: タイル分割数（3 or 4）
  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, size: number) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // 画像ファイルかチェック
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルを選択してください。');
        return;
      }

      setIsLoading(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        // 画像をHTMLImageElementとして読み込む
        const img = new window.Image();
        img.onload = () => {
          const minSize = Math.min(img.width, img.height);
          const sx = (img.width - minSize) / 2;
          const sy = (img.height - minSize) / 2;
          // 正方形クロップ
          const canvas = document.createElement('canvas');
          canvas.width = minSize;
          canvas.height = minSize;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, minSize, minSize);
          const croppedDataUrl = canvas.toDataURL();
          setUploadedImage(croppedDataUrl);

          // タイルごとに分割
          const tileSize = minSize / size;
          const images: (string | null)[] = [];
          for (let i = 0; i < size * size; i++) {
            if (i === size * size - 1) {
              // 空きタイルはnull
              images.push(null);
              continue;
            }
            const tx = i % size;
            const ty = Math.floor(i / size);
            const tileCanvas = document.createElement('canvas');
            tileCanvas.width = tileSize;
            tileCanvas.height = tileSize;
            const tileCtx = tileCanvas.getContext('2d')!;
            tileCtx.drawImage(
              canvas,
              tx * tileSize,
              ty * tileSize,
              tileSize,
              tileSize,
              0,
              0,
              tileSize,
              tileSize
            );
            images.push(tileCanvas.toDataURL());
          }
          setTileImages(images);
          setIsLoading(false);
        };
        img.onerror = () => {
          alert('画像の読み込みに失敗しました。');
          setIsLoading(false);
        };
        img.src = result;
      };
      reader.onerror = () => {
        alert('画像の読み込みに失敗しました。');
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const resetImage = useCallback(() => {
    setUploadedImage(null);
    setTileImages([]);
  }, []);

  return {
    uploadedImage,
    tileImages,
    isLoading,
    handleImageUpload,
    resetImage,
  };
};
