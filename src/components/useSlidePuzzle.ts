import { Heap } from 'heap-js';
import { useCallback, useEffect, useState } from 'react';

export type PuzzleSize = 3 | 4;

export interface Tile {
  id: number;
  currentPosition: number;
  correctPosition: number;
  isEmpty: boolean;
}

// 解答用のノードクラス
interface PuzzleNode {
  tiles: Tile[];
  g: number; // 開始状態からのコスト
  h: number; // ヒューリスティック（マンハッタン距離）
  f: number; // f = g + h
  parent: PuzzleNode | null;
  movedTileId: number | null; // どのタイルIDを動かしたか
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

// タイルの状態を文字列化（重複チェック用）
const tilesToString = (tiles: Tile[]): string => {
  return tiles.map(t => t.currentPosition).join(',');
};

// A*アルゴリズムで解答を見つける
const findSolution = (tiles: Tile[], size: number): number[] | null => {
  console.log('findSolution開始 - サイズ:', size, 'タイル数:', tiles.length);
  
  const startNode: PuzzleNode = {
    tiles: [...tiles],
    g: 0,
    h: calculateManhattanDistance(tiles, size),
    f: calculateManhattanDistance(tiles, size),
    parent: null,
    movedTileId: null,
  };

  console.log('開始ノード h値:', startNode.h);

  const openSet = new Map<string, PuzzleNode>();
  const openSetHeap = new Heap<PuzzleNode>((a, b) => a.f - b.f);
  const closedSet = new Set<string>();
  
  openSet.set(tilesToString(tiles), startNode);
  openSetHeap.push(startNode);

  let iterations = 0;
  const maxIterations = 10000000; // 10倍に増やす
  
  while (openSetHeap.size() > 0 && iterations < maxIterations) {
    iterations++;
    const currentNode = openSetHeap.pop();
    if (!currentNode) break;
    const currentState = tilesToString(currentNode.tiles);
    if (!openSet.has(currentState)) continue; // 既に処理済み
    openSet.delete(currentState);
    closedSet.add(currentState);

    // ゴールチェック
    if (currentNode.h === 0) {
      console.log('解答発見! 手数:', currentNode.g);
      // 解答経路を復元
      const solution: number[] = [];
      let node: PuzzleNode | null = currentNode;
      while (node && node.parent !== null) {
        if (node.movedTileId !== null) {
          solution.unshift(node.movedTileId);
        }
        node = node.parent;
      }
      console.log('解答経路:', solution);
      return solution;
    }

    // 隣接状態を生成
    const emptyTile = currentNode.tiles.find(t => t.isEmpty);
    if (!emptyTile) continue;
    const emptyPos = emptyTile.currentPosition;
    const emptyRow = Math.floor(emptyPos / size);
    const emptyCol = emptyPos % size;
    const directions = [
      { row: -1, col: 0 }, // 上
      { row: 1, col: 0 },  // 下
      { row: 0, col: -1 }, // 左
      { row: 0, col: 1 },  // 右
    ];
    for (const dir of directions) {
      const newRow = emptyRow + dir.row;
      const newCol = emptyCol + dir.col;
      if (newRow >= 0 && newRow < size && newCol >= 0 && newCol < size) {
        const newPos = newRow * size + newCol;
        const adjacentTile = currentNode.tiles.find(t => t.currentPosition === newPos);
        if (adjacentTile) {
          // 新しい状態を生成
          const newTiles = currentNode.tiles.map(t => {
            if (t.id === emptyTile.id) {
              return { ...t, currentPosition: newPos };
            }
            if (t.id === adjacentTile.id) {
              return { ...t, currentPosition: emptyPos };
            }
            return t;
          });
          const newState = tilesToString(newTiles);
          if (closedSet.has(newState)) continue;
          const g = currentNode.g + 1;
          const h = calculateManhattanDistance(newTiles, size);
          const f = g + h;
          const existingNode = openSet.get(newState);
          if (existingNode && existingNode.g <= g) continue;
          // movedTileIdは必ずadjacentTile.id
          const newNode: PuzzleNode = {
            tiles: newTiles,
            g,
            h,
            f,
            parent: currentNode,
            movedTileId: adjacentTile.id,
          };
          openSet.set(newState, newNode);
          openSetHeap.push(newNode);
        }
      }
    }
  }

  if (iterations >= maxIterations) {
    console.log('最大イテレーション数に達しました:', maxIterations);
  } else {
    console.log('解答が見つかりませんでした。イテレーション:', iterations);
  }
  return null; // 解答が見つからない
};

// 正解配置からランダムに移動を適用してシャッフルする関数
const shuffleFromSolvedState = (
  tiles: Tile[],
  size: number,
  moves: number = 100
): Tile[] => {
  const shuffledTiles = [...tiles];

  // 指定された回数だけランダムな移動を適用
  for (let i = 0; i < moves; i++) {
    const emptyTile = shuffledTiles.find((t) => t.isEmpty);
    if (!emptyTile) continue;
    
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
      const randomAdjacentPos =
        adjacentPositions[Math.floor(Math.random() * adjacentPositions.length)];
      const adjacentTile = shuffledTiles.find(
        (t) => t.currentPosition === randomAdjacentPos
      );
      if (!adjacentTile) continue;

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
  const [isSolving, setIsSolving] = useState(false);
  const [solution, setSolution] = useState<number[]>([]);
  const [solutionIndex, setSolutionIndex] = useState(0);
  const [isPlayingSolution, setIsPlayingSolution] = useState(false);

  // パズルを初期化（シャッフルも同時に実施）
  const initializePuzzle = useCallback(() => {
    const totalTiles = size * size;
    const initialTiles: Tile[] = [];
    for (let i = 0; i < totalTiles; i++) {
      initialTiles.push({
        id: i,
        currentPosition: i,
        correctPosition: i,
        isEmpty: i === totalTiles - 1,
      });
    }

    // 正解配置からランダムに移動を適用してシャッフル
    const shuffledTiles = shuffleFromSolvedState(
      initialTiles,
      size,
      size === 3 ? 100 : 200
    );

    setTiles(shuffledTiles);
    setIsComplete(false);
    setMoves(0);
    setStartTime(new Date());
    setElapsedTime(0);
    setSolution([]);            // 解答キャッシュクリア
    setSolutionIndex(0);        // インデックスリセット
    setIsPlayingSolution(false);// 再生状態リセット
  }, [size]);

  // タイルを移動
  const moveTile = useCallback(
    (tileId: number) => {
      const tileIndex = tiles.findIndex((t) => t.id === tileId);
      if (tileIndex === -1) return;

      const tile = tiles[tileIndex];
      const emptyTile = tiles.find((t) => t.isEmpty);
      if (!emptyTile) return;

      const tilePos = tile.currentPosition;
      const emptyPos = emptyTile.currentPosition;

      // 隣接しているかチェック
      const rowDiff = Math.abs(
        Math.floor(tilePos / size) - Math.floor(emptyPos / size)
      );
      const colDiff = Math.abs((tilePos % size) - (emptyPos % size));
      const isAdjacent =
        (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);

      if (isAdjacent) {
        const newTiles = tiles.map((t) => {
          if (t.id === tileId) {
            return { ...t, currentPosition: emptyPos };
          }
          if (t.isEmpty) {
            return { ...t, currentPosition: tilePos };
          }
          return t;
        });

        setTiles(newTiles);
        setMoves((prev) => prev + 1);
      }
    },
    [tiles, size]
  );

  // サイズ変更時にパズルを初期化
  useEffect(() => {
    initializePuzzle();
  }, [initializePuzzle]);

  // tilesが初期化された直後に自動でシャッフル（不要なので削除）

  // 解答を見つける
  const findSolutionForCurrentState = useCallback(async () => {
    console.log('解答探索開始');
    setIsSolving(true);
    setSolution([]);            // キャッシュクリア
    setSolutionIndex(0);        // キャッシュクリア
    setIsPlayingSolution(false);// 再生状態もリセット

    try {
      // 非同期で解答を計算（UIをブロックしないため）
      const result = await new Promise<number[] | null>((resolve) => {
        setTimeout(() => {
          console.log('findSolution呼び出し');
          const solution = findSolution(tiles, size);
          console.log('findSolution結果:', solution);
          resolve(solution);
        }, 0);
      });

      if (result) {
        console.log('解答設定:', result);
        setSolution(result);
      } else {
        console.log('解答が見つかりませんでした');
      }
    } catch (error) {
      console.error('解答探索エラー:', error);
    } finally {
      setIsSolving(false);
    }
  }, [tiles, size]);

  // 解答を実行（1手進める）
  const executeSolution = useCallback(() => {
    if (solution.length === 0 || solutionIndex >= solution.length) return;
    const tileId = solution[solutionIndex];
    moveTile(tileId);
    setSolutionIndex(prev => prev + 1);
  }, [solution, solutionIndex, moveTile]);

  // 解答の自動再生を開始
  const startSolutionPlayback = useCallback(() => {
    if (solution.length > 0) {
      setSolutionIndex(0);
      setIsPlayingSolution(true);
    }
  }, [solution]);

  // 解答の自動再生
  useEffect(() => {
    if (isPlayingSolution && solution.length > 0 && solutionIndex < solution.length && !isComplete) {
      const timer = setTimeout(() => {
        executeSolution();
      }, 200);
      return () => clearTimeout(timer);
    }
    // 再生が終わったら自動停止
    if (isPlayingSolution && (solutionIndex >= solution.length || isComplete)) {
      setIsPlayingSolution(false);
    }
  }, [isPlayingSolution, solution, solutionIndex, isComplete, executeSolution]);

  // // 解答の自動再生を開始
  // const startSolutionPlayback = useCallback(() => {
  //   if (solution.length > 0) {
  //     setSolutionIndex(0);
  //   }
  // }, [solution]);

  // 完了チェック
  useEffect(() => {
    const isPuzzleComplete = tiles.every(
      (tile) => tile.currentPosition === tile.correctPosition
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
    moveTile,
    findSolutionForCurrentState,
    isSolving,
    solution,
    solutionIndex,
    hasSolution: solution.length > 0,
    executeSolution,
    startSolutionPlayback,
    isPlayingSolution,
  };
};
