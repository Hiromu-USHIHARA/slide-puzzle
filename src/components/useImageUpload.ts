import { useState, useCallback } from 'react';

export const useImageUpload = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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
      setUploadedImage(result);
      setIsLoading(false);
    };
    reader.onerror = () => {
      alert('画像の読み込みに失敗しました。');
      setIsLoading(false);
    };
    reader.readAsDataURL(file);
  }, []);

  const resetImage = useCallback(() => {
    setUploadedImage(null);
  }, []);

  return {
    uploadedImage,
    isLoading,
    handleImageUpload,
    resetImage
  };
}; 