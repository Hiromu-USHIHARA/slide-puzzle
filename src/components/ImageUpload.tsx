import React from 'react';
import { useImageUpload } from './useImageUpload';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageChange: (image: string | null) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageChange }) => {
  const { uploadedImage, isLoading, handleImageUpload, resetImage } =
    useImageUpload();

  React.useEffect(() => {
    onImageChange(uploadedImage);
  }, [uploadedImage, onImageChange]);

  return (
    <div className="image-upload">
      <h3>画像をアップロード</h3>
      <div className="upload-controls">
        <label className="upload-button">
          {isLoading ? '読み込み中...' : '画像を選択'}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isLoading}
            style={{ display: 'none' }}
          />
        </label>
        {uploadedImage && (
          <button type="button" className="reset-button" onClick={resetImage}>
            リセット
          </button>
        )}
      </div>
      {uploadedImage && (
        <div className="preview">
          <img src={uploadedImage} alt="プレビュー" className="preview-image" />
        </div>
      )}
    </div>
  );
};
