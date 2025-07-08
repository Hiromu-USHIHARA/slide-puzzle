import { useState, useCallback, useEffect } from 'react';

export type PuzzleSize = 3 | 4;

export interface Tile {
  id: number;
  currentPosition: number;
  correctPosition: number;
  isEmpty: boolean;
}

// ゴール可能か判定する関数
const isSolvable = (tiles: Tile[], size: number) => {
//   const totalTiles = size * size;
  let inversions = 0;
  const tilePositions = tiles
    .filter(t => !t.isEmpty)
    .map(t => t.currentPosition);

  for (let i = 0; i < tilePositions.length - 1; i++) {
    for (let j = i + 1; j < tilePositions.length; j++) {
      if (tilePositions[i] > tilePositions[j]) inversions++;
    }
  }

  if (size % 2 === 1) {
    // 奇数サイズ
    return inversions % 2 === 0;
  } else {
    // 偶数サイズ
    const emptyTile = tiles.find(t => t.isEmpty)!;
    const emptyRowFromBottom = size - Math.floor(emptyTile.currentPosition / size);
    return (inversions + emptyRowFromBottom) % 2 === 0;
  }
};

export const useSlidePuzzle = (size: PuzzleSize) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // パズルを初期化（シャッフルも同時に実施）
  const initializePuzzle = useCallback(() => {
    const totalTiles = size * size;
    let initialTiles: Tile[] = [];
    for (let i = 0; i < totalTiles; i++) {
      initialTiles.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        isEmpty: i === totalTiles - 1
      });
    }

    // --- シャッフル処理 ---
    let shuffledTiles = [...initialTiles];
    let attempts = 0;
    const maxAttempts = 1000;
    do {
      // ランダムにタイルを交換
      for (let i = 0; i < totalTiles * 2; i++) {
        const pos1 = Math.floor(Math.random() * totalTiles);
        const pos2 = Math.floor(Math.random() * totalTiles);
        if (pos1 !== pos2) {
          const temp = shuffledTiles[pos1].currentPosition;
          shuffledTiles[pos1].currentPosition = shuffledTiles[pos2].currentPosition;
          shuffledTiles[pos2].currentPosition = temp;
        }
      }
      attempts++;
    } while (!isSolvable(shuffledTiles, size) && attempts < maxAttempts);

    setTiles(shuffledTiles);
    setIsComplete(false);
    setMoves(0);
    setStartTime(new Date());
    setElapsedTime(0);
  }, [size]);

  // パズルをシャッフル（解ける状態を保証）
  const shufflePuzzle = useCallback(() => {
    const totalTiles = size * size;
    const shuffledTiles = [...tiles];
    let attempts = 0;
    const maxAttempts = 1000;
    do {
      for (let i = 0; i < totalTiles * 2; i++) {
        const pos1 = Math.floor(Math.random() * totalTiles);
        const pos2 = Math.floor(Math.random() * totalTiles);
        if (pos1 !== pos2) {
          const temp = shuffledTiles[pos1].currentPosition;
          shuffledTiles[pos1].currentPosition = shuffledTiles[pos2].currentPosition;
          shuffledTiles[pos2].currentPosition = temp;
        }
      }
      attempts++;
    } while (!isSolvable(shuffledTiles, size) && attempts < maxAttempts);
    setTiles(shuffledTiles);
    setIsComplete(false);
    setMoves(0);
    setStartTime(new Date());
    setElapsedTime(0);
  }, [tiles, size]);

  // タイルを移動
  const moveTile = useCallback((tileId: number) => {
    const tileIndex = tiles.findIndex(t => t.id === tileId);
    if (tileIndex === -1) return;
    
    const tile = tiles[tileIndex];
    const emptyTile = tiles.find(t => t.isEmpty);
    if (!emptyTile) return;
    
    const tilePos = tile.currentPosition;
    const emptyPos = emptyTile.currentPosition;
    
    // 隣接しているかチェック
    const rowDiff = Math.abs(Math.floor(tilePos / size) - Math.floor(emptyPos / size));
    const colDiff = Math.abs(tilePos % size - emptyPos % size);
    const isAdjacent = (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    
    if (isAdjacent) {
      const newTiles = tiles.map(t => {
        if (t.id === tileId) {
          return { ...t, currentPosition: emptyPos };
        }
        if (t.isEmpty) {
          return { ...t, currentPosition: tilePos };
        }
        return t;
      });
      
      setTiles(newTiles);
      setMoves(prev => prev + 1);
    }
  }, [tiles, size]);

  // サイズ変更時にパズルを初期化
  useEffect(() => {
    initializePuzzle();
  }, [size, initializePuzzle]);

  // tilesが初期化された直後に自動でシャッフル（不要なので削除）

  // 完了チェック
  useEffect(() => {
    const isPuzzleComplete = tiles.every(tile => 
      tile.currentPosition === tile.correctPosition
    );
    setIsComplete(isPuzzleComplete);
  }, [tiles]);

  // 経過時間の更新
  useEffect(() => {
    if (startTime && !isComplete) {
      const interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [startTime, isComplete]);

  return {
    tiles,
    isComplete,
    moves,
    elapsedTime,
    initializePuzzle,
    shufflePuzzle,
    moveTile
  };
}; 