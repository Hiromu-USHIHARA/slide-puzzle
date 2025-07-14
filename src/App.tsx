import { useCallback, useState } from 'react';
import { GameControls } from './components/GameControls';
import { GameInfo } from './components/GameInfo';
import { ImageUpload } from './components/ImageUpload';
import { PuzzleBoard } from './components/PuzzleBoard';
import { type PuzzleSize, useSlidePuzzle } from './components/useSlidePuzzle';
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
    moveTile,
    findSolutionForCurrentState,
    isSolving,
    hasSolution,
    // executeSolution,
    startSolutionPlayback,
  } = useSlidePuzzle(size);

  // サイズ変更時の処理
  const handleSizeChange = useCallback((newSize: PuzzleSize) => {
    setSize(newSize);
  }, []);

  // リセット処理
  const handleReset = useCallback(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  // 解答を見つける or 表示する処理
  const handleFindOrShowSolution = useCallback(() => {
    if (hasSolution) {
      startSolutionPlayback();
    } else {
      findSolutionForCurrentState();
    }
  }, [hasSolution, startSolutionPlayback, findSolutionForCurrentState]);

  // 画像変更時の処理
  const handleImageChange = useCallback((image: string | null) => {
    setUploadedImage(image);
  }, []);

  // タイルクリック時の処理
  const handleTileClick = useCallback(
    (tileId: number) => {
      moveTile(tileId);
    },
    [moveTile]
  );

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
              onReset={handleReset}
              onFindSolution={handleFindOrShowSolution}
              isComplete={isComplete}
              isSolving={isSolving}
              hasSolution={hasSolution}
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
        <p>
          <a href="https://github.com/Hiromu-USHIHARA/slide-puzzle">
            <img src="https://img.shields.io/github/stars/Hiromu-USHIHARA/slide-puzzle?style=social" alt="GitHub Repository" />
          </a>
          <br />
          designed by{' '}
          <a href="https://github.com/Hiromu-USHIHARA">Hiromu Ushihara</a>
        </p>
      </footer>
    </div>
  );
}

export default App;
