import { useState, useCallback, useEffect, useRef } from 'react';
import { useSlidePuzzle, type PuzzleSize, type Tile } from './components/useSlidePuzzle';
import { PuzzleBoard } from './components/PuzzleBoard';
import { GameInfo } from './components/GameInfo';
import { GameControls } from './components/GameControls';
import { ImageUpload } from './components/ImageUpload';
import './App.css';

// 解答ステップの型定義
interface SolveStep {
  tileId: number;
  fromPosition: number;
  toPosition: number;
}

// A*アルゴリズム用のノード
interface AStarNode {
  tiles: Tile[];
  g: number; // 実際のコスト
  h: number; // ヒューリスティック（マンハッタン距離）
  f: number; // f = g + h
  parent: AStarNode | null;
  lastMove: { tileId: number; fromPosition: number; toPosition: number } | null;
}

// マンハッタン距離を計算
const calculateManhattanDistance = (tiles: Tile[], size: number): number => {
  let totalDistance = 0;
  for (const tile of tiles) {
    if (!tile.isEmpty) {
      const currentRow = Math.floor(tile.currentPosition / size);
      const currentCol = tile.currentPosition % size;
      const correctRow = Math.floor(tile.correctPosition / size);
      const correctCol = tile.correctPosition % size;
      totalDistance += Math.abs(currentRow - correctRow) + Math.abs(currentCol - correctCol);
    }
  }
  return totalDistance;
};

// タイルの配置を文字列化（状態の比較用）
const tilesToString = (tiles: Tile[]): string => {
  return tiles.map(t => t.currentPosition).join(',');
};

// 隣接する空きマスに移動可能なタイルを取得
const getMovableTiles = (tiles: Tile[], size: number): Tile[] => {
  const emptyTile = tiles.find(t => t.isEmpty);
  if (!emptyTile) return [];
  
  const emptyPos = emptyTile.currentPosition;
  const emptyRow = Math.floor(emptyPos / size);
  const emptyCol = emptyPos % size;
  
  return tiles.filter(tile => {
    if (tile.isEmpty) return false;
    const tileRow = Math.floor(tile.currentPosition / size);
    const tileCol = tile.currentPosition % size;
    const rowDiff = Math.abs(tileRow - emptyRow);
    const colDiff = Math.abs(tileCol - emptyCol);
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  });
};

// タイルを移動した新しい状態を生成
const moveTileInState = (tiles: Tile[], tileId: number, toPosition: number): Tile[] => {
  const tile = tiles.find(t => t.id === tileId);
  const emptyTile = tiles.find(t => t.isEmpty);
  if (!tile || !emptyTile) return tiles;
  
  return tiles.map(t => {
    if (t.id === tileId) {
      return { ...t, currentPosition: toPosition };
    }
    if (t.isEmpty) {
      return { ...t, currentPosition: tile.currentPosition };
    }
    return t;
  });
};

// より効率的なヒューリスティック関数（線形コンフリクト）
const calculateLinearConflict = (tiles: Tile[], size: number): number => {
  let conflicts = 0;
  
  // 行のコンフリクトをチェック
  for (let row = 0; row < size; row++) {
    for (let i = 0; i < size - 1; i++) {
      for (let j = i + 1; j < size; j++) {
        const pos1 = row * size + i;
        const pos2 = row * size + j;
        const tile1 = tiles.find(t => t.currentPosition === pos1);
        const tile2 = tiles.find(t => t.currentPosition === pos2);
        
        if (tile1 && tile2 && !tile1.isEmpty && !tile2.isEmpty) {
          const correctRow1 = Math.floor(tile1.correctPosition / size);
          const correctRow2 = Math.floor(tile2.correctPosition / size);
          
          if (correctRow1 === row && correctRow2 === row) {
            const correctCol1 = tile1.correctPosition % size;
            const correctCol2 = tile2.correctPosition % size;
            
            if ((correctCol1 < correctCol2 && i > j) || (correctCol1 > correctCol2 && i < j)) {
              conflicts += 2;
            }
          }
        }
      }
    }

  // 列のコンフリクトをチェック
  for (let col = 0; col < size; col++) {
    for (let i = 0; i < size - 1; i++) {
      for (let j = i + 1; j < size; j++) {
        const pos1 = i * size + col;
        const pos2 = j * size + col;
        const tile1 = tiles.find(t => t.currentPosition === pos1);
        const tile2 = tiles.find(t => t.currentPosition === pos2);

        if (tile1 && tile2 && !tile1.isEmpty && !tile2.isEmpty) {
          const correctCol1 = tile1.correctPosition % size;
          const correctCol2 = tile2.correctPosition % size;
          const correctRow1 = Math.floor(tile1.correctPosition / size);
          const correctRow2 = Math.floor(tile2.correctPosition / size);

          if (correctCol1 === col && correctCol2 === col) {
            if ((correctRow1 < correctRow2 && i > j) || (correctRow1 > correctRow2 && i < j)) {
              conflicts += 2;
            }
          }
        }
      }
    }
  }

  return conflicts;
};

// 総合ヒューリスティック（マンハッタン距離＋線形コンフリクト）
const calculateHeuristic = (tiles: Tile[], size: number): number => {
  return calculateManhattanDistance(tiles, size) + calculateLinearConflict(tiles, size);
};

// A*アルゴリズムで解答を見つける（改良版）
const findSolution = (tiles: Tile[], size: number): SolveStep[] => {
  const goalState = tiles.map(t => ({ ...t, currentPosition: t.correctPosition }));
  const goalString = tilesToString(goalState);
  console.log('目標状態:', goalString);
  
  const openSet = new Map<string, AStarNode>();
  const closedSet = new Set<string>();
  
  const initialNode: AStarNode = {
    tiles: [...tiles],
    g: 0,
    h: calculateHeuristic(tiles, size),
    f: calculateHeuristic(tiles, size),
    parent: null,
    lastMove: null
  };
  
  openSet.set(tilesToString(tiles), initialNode);
  let iterations = 0;
  const maxIterations = 10000; // 無限ループ防止
  
  while (openSet.size > 0 && iterations < maxIterations) {
    iterations++;
    
    // f値が最小のノードを選択
    let currentNode: AStarNode | null = null;
    let minF = Infinity;
    
    for (const node of openSet.values()) {
      if (node.f < minF) {
        minF = node.f;
        currentNode = node;
      }
    }
    
    if (!currentNode) break;
    
    const currentStateString = tilesToString(currentNode.tiles);
    
    // ゴールに到達したかチェック
    if (currentStateString === goalString) {
      console.log('解答発見！ステップ数:', currentNode.g);
      // 解答パスを構築
      const solution: SolveStep[] = [];
      let node: AStarNode | null = currentNode;
      
      while (node && node.lastMove) {
        solution.unshift({
          tileId: node.lastMove.tileId,
          fromPosition: node.lastMove.fromPosition,
          toPosition: node.lastMove.toPosition
        });
        node = node.parent;
      }
      
      console.log('解答ステップ:', solution);
      return solution;
    }
    
    // 現在のノードを閉じた集合に移動
    openSet.delete(currentStateString);
    closedSet.add(currentStateString);
    
    // 隣接する状態を生成
    const movableTiles = getMovableTiles(currentNode.tiles, size);
    
    for (const tile of movableTiles) {
      const emptyTile = currentNode.tiles.find(t => t.isEmpty);
      if (!emptyTile) continue;
      
      const newTiles = moveTileInState(currentNode.tiles, tile.id, emptyTile.currentPosition);
      const newStateString = tilesToString(newTiles);
      
      if (closedSet.has(newStateString)) continue;
      
      const newG = currentNode.g + 1;
      const newH = calculateHeuristic(newTiles, size);
      const newF = newG + newH;
      
      const existingNode = openSet.get(newStateString);
      if (existingNode && existingNode.g <= newG) continue;
      
      const newNode: AStarNode = {
        tiles: newTiles,
        g: newG,
        h: newH,
        f: newF,
        parent: currentNode,
        lastMove: {
          tileId: tile.id,
          fromPosition: tile.currentPosition,
          toPosition: emptyTile.currentPosition
        }
      };
      
      openSet.set(newStateString, newNode);
    }
  }
  
  console.log('解答が見つかりませんでした。反復回数:', iterations);
  return []; // 解答が見つからない場合
};

// IDDFS（Iterative Deepening Depth-First Search）で解答を見つける
const findSolutionIDDFS = (tiles: Tile[], size: number): SolveStep[] => {
  const goalState = tiles.map(t => ({ ...t, currentPosition: t.correctPosition }));
  const goalString = tilesToString(goalState);
  
  // 深さ制限付きDFS
  const dfs = (currentTiles: Tile[], depth: number, maxDepth: number, path: SolveStep[]): SolveStep[] | null => {
    const currentStateString = tilesToString(currentTiles);
    
    if (currentStateString === goalString) {
      return path;
    }
    
    if (depth >= maxDepth) {
      return null;
    }
    
    const movableTiles = getMovableTiles(currentTiles, size);
    
    for (const tile of movableTiles) {
      const emptyTile = currentTiles.find(t => t.isEmpty);
      if (!emptyTile) continue;
      
      const newTiles = moveTileInState(currentTiles, tile.id, emptyTile.currentPosition);
      const newStep: SolveStep = {
        tileId: tile.id,
        fromPosition: tile.currentPosition,
        toPosition: emptyTile.currentPosition
      };
      
      const result = dfs(newTiles, depth + 1, maxDepth, [...path, newStep]);
      if (result) {
        return result;
      }
    }
    
    return null;
  };
  
  // 深さを段階的に増やして探索
  for (let maxDepth = 1; maxDepth <= 50; maxDepth++) {
    console.log(`深さ${maxDepth}で探索中...`);
    const result = dfs([...tiles], 0, maxDepth, []);
    if (result) {
      console.log(`解答発見！深さ: ${maxDepth}, ステップ数: ${result.length}`);
      return result;
    }
  }
  
  console.log('解答が見つかりませんでした');
  return [];
};

function App() {
  const [size, setSize] = useState<PuzzleSize>(3);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAutoSolving, setIsAutoSolving] = useState(false);
  const solveStepsRef = useRef<SolveStep[]>([]);
  const currentStepIndexRef = useRef(0);
  const solveIntervalRef = useRef<number | null>(null);
  
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

  // 自動解答の停止
  const stopAutoSolve = useCallback(() => {
    if (solveIntervalRef.current) {
      clearInterval(solveIntervalRef.current);
      solveIntervalRef.current = null;
    }
    setIsAutoSolving(false);
    currentStepIndexRef.current = 0;
  }, []);

  // 1手ずつ解答を実行
  const executeNextStep = useCallback(() => {
    console.log('ステップ実行:', currentStepIndexRef.current, '/', solveStepsRef.current.length);
    
    if (currentStepIndexRef.current >= solveStepsRef.current.length) {
      console.log('解答完了');
      stopAutoSolve();
      return;
    }
    
    const step = solveStepsRef.current[currentStepIndexRef.current];
    console.log('移動:', step);
    moveTile(step.tileId);
    currentStepIndexRef.current++;
  }, [moveTile, stopAutoSolve]);

  // 自動解答処理
  const handleAutoSolve = useCallback(() => {
    if (!window.confirm('本当に解答を表示しますか？')) {
      return;
    }

    // 既に解答中なら停止
    if (isAutoSolving) {
      stopAutoSolve();
      return;
    }

    // 解答が見つからない場合
    if (isComplete) {
      alert('パズルは既に完成しています！');
      return;
    }

    setIsAutoSolving(true);
    
    // 解答を計算（IDDFSを使用）
    console.log('現在のタイル状態:', tiles);
    const solution = findSolution(tiles, size);
    
    if (solution.length === 0) {
      alert('解答が見つかりませんでした。パズルをシャッフルしてから再試行してください。');
      setIsAutoSolving(false);
      return;
    }
    
    console.log('解答ステップ数:', solution.length);
    solveStepsRef.current = solution;
    currentStepIndexRef.current = 0;
    
    // 1秒間隔で1手ずつ実行
    solveIntervalRef.current = setInterval(executeNextStep, 1000);
  }, [tiles, size, isComplete, isAutoSolving, stopAutoSolve, executeNextStep]);

  // コンポーネントのアンマウント時にインターバルをクリア
  useEffect(() => {
    return () => {
      if (solveIntervalRef.current) {
        clearInterval(solveIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>スライドパズル</h1>
        {isAutoSolving && (
          <div className="auto-solve-status">
            <span>自動解答中...</span>
            <button onClick={stopAutoSolve} className="stop-solve-btn">
              停止
            </button>
          </div>
        )}
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
              onAutoSolve={handleAutoSolve}
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
