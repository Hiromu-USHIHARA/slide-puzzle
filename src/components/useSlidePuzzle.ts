import { useState, useCallback, useEffect } from 'react';

export type PuzzleSize = 3 | 4;

export interface Tile {
  id: number;
  currentPosition: number;
  correctPosition: number;
  isEmpty: boolean;
}

// ゴール可能か判定する関数
// const isSolvable = (tiles: Tile[], size: number): { solvable: boolean; inversions: number; emptyRowFromBottom?: number } => {
//   let inversions = 0;

//   // 現在の配置でのタイルの位置を取得
//   const currentPositions = tiles
//     .filter(t => !t.isEmpty)
//     .map(t => t.currentPosition);

//   // 反転数を計算（現在の位置を正しい順序と比較）
//   for (let i = 0; i < currentPositions.length - 1; i++) {
//     for (let j = i + 1; j < currentPositions.length; j++) {
//       if (currentPositions[i] > currentPositions[j]) {
//         inversions++;
//       }
//     }
//   }

//   if (size % 2 === 1) {
//     // 奇数サイズ：反転数が偶数なら解ける
//     const solvable = inversions % 2 === 0;
//     return { solvable, inversions };
//   } else {
//     // 偶数サイズ：反転数 + 空きタイルの行番号（下から数えて）が偶数なら解ける
//     const emptyTile = tiles.find(t => t.isEmpty)!;
//     const emptyRowFromBottom = size - Math.floor(emptyTile.currentPosition / size);
//     const solvable = (inversions + emptyRowFromBottom) % 2 === 0;
    
//     return { solvable, inversions, emptyRowFromBottom };
//   }
// };

// 正解配置からランダムに移動を適用してシャッフルする関数
const shuffleFromSolvedState = (tiles: Tile[], size: number, moves: number = 100): Tile[] => {
  const shuffledTiles = [...tiles];
  
  // 指定された回数だけランダムな移動を適用
  for (let i = 0; i < moves; i++) {
    const emptyTile = shuffledTiles.find(t => t.isEmpty)!;
    const emptyPos = emptyTile.currentPosition;
    const emptyRow = Math.floor(emptyPos / size);
    const emptyCol = emptyPos % size;
    
    // 空きタイルの隣接するタイルをランダムに選択
    const adjacentPositions: number[] = [];
    
    // 上
    if (emptyRow > 0) {
      adjacentPositions.push(emptyPos - size);
    }
    // 下
    if (emptyRow < size - 1) {
      adjacentPositions.push(emptyPos + size);
    }
    // 左
    if (emptyCol > 0) {
      adjacentPositions.push(emptyPos - 1);
    }
    // 右
    if (emptyCol < size - 1) {
      adjacentPositions.push(emptyPos + 1);
    }
    
    // ランダムに隣接タイルを選択して移動
    if (adjacentPositions.length > 0) {
      const randomAdjacentPos = adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
      const adjacentTile = shuffledTiles.find(t => t.currentPosition === randomAdjacentPos)!;
      
      // 位置を交換
      emptyTile.currentPosition = randomAdjacentPos;
      adjacentTile.currentPosition = emptyPos;
    }
  }
  
  return shuffledTiles;
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

    // 正解配置からランダムに移動を適用してシャッフル
    const shuffledTiles = shuffleFromSolvedState(initialTiles, size, size === 3 ? 150 : 300);
    
    // 検証（確認のため）
    // const validation = isSolvable(shuffledTiles, size);
    
    setTiles(shuffledTiles);
    setIsComplete(false);
    setMoves(0);
    setStartTime(new Date());
    setElapsedTime(0);
  }, [size]);

  // パズルをシャッフル（解ける状態を保証）
  const shufflePuzzle = useCallback(() => {
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

    // 正解配置からランダムに移動を適用してシャッフル
    const shuffledTiles = shuffleFromSolvedState(initialTiles, size, size === 3 ? 150 : 300);
    
    // 検証（確認のため）
    // const validation = isSolvable(shuffledTiles, size);
    
    setTiles(shuffledTiles);
    setIsComplete(false);
    setMoves(0);
    setStartTime(new Date());
    setElapsedTime(0);
  }, [size]);

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