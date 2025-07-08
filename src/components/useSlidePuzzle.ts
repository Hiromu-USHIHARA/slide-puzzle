import { useState, useCallback, useEffect } from 'react';

export type PuzzleSize = 3 | 4;

export interface Tile {
  id: number;
  currentPosition: number;
  correctPosition: number;
  isEmpty: boolean;
}

export const useSlidePuzzle = (size: PuzzleSize) => {
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // パズルを初期化
  const initializePuzzle = useCallback(() => {
    const totalTiles = size * size;
    const initialTiles: Tile[] = [];
    
    for (let i = 0; i < totalTiles; i++) {
      initialTiles.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        isEmpty: i === totalTiles - 1
      });
    }
    
    setTiles(initialTiles);
    setIsComplete(false);
    setMoves(0);
    setStartTime(new Date());
    setElapsedTime(0);
  }, [size]);

  // パズルをシャッフル（解ける状態を保証）
  const shufflePuzzle = useCallback(() => {
    const totalTiles = size * size;
    const shuffledTiles = [...tiles];
    
    // 解ける状態を保証するため、偶数の反転数を持つ配置にする
    let inversions = 0;
    let attempts = 0;
    const maxAttempts = 100;
    
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
      
      // 反転数を計算
      inversions = 0;
      for (let i = 0; i < totalTiles - 1; i++) {
        for (let j = i + 1; j < totalTiles; j++) {
          const tile1 = shuffledTiles.find(t => t.currentPosition === i);
          const tile2 = shuffledTiles.find(t => t.currentPosition === j);
          if (tile1 && tile2 && !tile1.isEmpty && !tile2.isEmpty) {
            if (tile1.correctPosition > tile2.correctPosition) {
              inversions++;
            }
          }
        }
      }
      
      attempts++;
    } while (inversions % 2 !== 0 && attempts < maxAttempts);
    
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