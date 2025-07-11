import { useCallback, useState } from 'react';

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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
          const canvas = document.createElement('canvas');
          canvas.width = minSize;
          canvas.height = minSize;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, sx, sy, minSize, minSize, 0, 0, minSize, minSize);
          const croppedDataUrl = canvas.toDataURL();
          setUploadedImage(croppedDataUrl);
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
  }, []);

  return {
    uploadedImage,
    isLoading,
    handleImageUpload,
    resetImage,
  };
};
