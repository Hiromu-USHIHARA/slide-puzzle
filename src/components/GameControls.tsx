import React from 'react';
import type { PuzzleSize } from './useSlidePuzzle';
import './GameControls.css';

interface GameControlsProps {
  size: PuzzleSize;
  onSizeChange: (size: PuzzleSize) => void;
  onShuffle: () => void;
  onReset: () => void;
  isComplete: boolean;
  onAutoSolve?: () => void; // 追加
}

export const GameControls: React.FC<GameControlsProps> = ({
  size,
  onSizeChange,
  onShuffle,
  onReset,
  isComplete,
  onAutoSolve // 追加
}) => {
  return (
    <div className="game-controls">
      <div className="control-group">
        <label className="control-label">パズルサイズ:</label>
        <div className="size-buttons">
          <button
            className={`size-button ${size === 3 ? 'active' : ''}`}
            onClick={() => onSizeChange(3)}
          >
            3×3
          </button>
          <button
            className={`size-button ${size === 4 ? 'active' : ''}`}
            onClick={() => onSizeChange(4)}
          >
            4×4
          </button>
        </div>
      </div>
      
      <div className="control-group">
        <button className="control-button shuffle" onClick={onShuffle}>
          シャッフル
        </button>
        <button className="control-button reset" onClick={onReset}>
          リセット
        </button>
        <button className="control-button auto-solve" onClick={onAutoSolve} disabled={isComplete}>
          自動解答
        </button>
      </div>
      
      {isComplete && (
        <div className="completion-controls">
          <button className="control-button new-game" onClick={onShuffle}>
            新しいゲーム
          </button>
        </div>
      )}
    </div>
  );
}; 