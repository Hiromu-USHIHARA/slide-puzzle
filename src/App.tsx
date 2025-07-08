import { useState, useCallback } from 'react';
import { useSlidePuzzle, type PuzzleSize } from './components/useSlidePuzzle';
import { PuzzleBoard } from './components/PuzzleBoard';
import { GameInfo } from './components/GameInfo';
import { GameControls } from './components/GameControls';
import { ImageUpload } from './components/ImageUpload';
import './App.css';

function App() {
  const [size, setSize] = useState<PuzzleSize>(3);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  
  const {
    tiles,
    isComplete,
    moves,
    elapsedTime,
    initializePuzzle,
    shufflePuzzle,
    moveTile
  } = useSlidePuzzle(size);

  // サイズ変更時の処理
  const handleSizeChange = useCallback((newSize: PuzzleSize) => {
    setSize(newSize);
  }, []);

  // シャッフル処理
  const handleShuffle = useCallback(() => {
    shufflePuzzle();
  }, [shufflePuzzle]);

  // リセット処理
  const handleReset = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  // 画像変更時の処理
  const handleImageChange = useCallback((image: string | null) => {
    setUploadedImage(image);
  }, []);

  // タイルクリック時の処理
  const handleTileClick = useCallback((tileId: number) => {
    moveTile(tileId);
  }, [moveTile]);

  // 初期化はuseSlidePuzzleフック内で自動的に行われるため削除

  return (
    <div className="app">
      <header className="app-header">
        <h1>スライドパズル</h1>
        {/* <p>タイルをクリックして正しい順序に並べ替えましょう！</p> */}
      </header>

      <main className="app-main">
        <div className="game-container">
          <div className="game-sidebar">
            <ImageUpload onImageChange={handleImageChange} />
            
            <GameControls
              size={size}
              onSizeChange={handleSizeChange}
              onShuffle={handleShuffle}
              onReset={handleReset}
              isComplete={isComplete}
            />

            <GameInfo
              moves={moves}
              elapsedTime={elapsedTime}
              isComplete={isComplete}
            />
          </div>

          <div className="game-main">
            <div className="puzzle-section">
              <PuzzleBoard
                tiles={tiles}
                size={size}
                onTileClick={handleTileClick}
                uploadedImage={uploadedImage}
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>designed by <a href="https://github.com/Hiromu-USHIHARA">Hiromu Ushihara</a></p>
      </footer>
    </div>
  );
}

export default App;
