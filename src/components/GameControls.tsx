import type React from 'react';
import type { PuzzleSize } from './useSlidePuzzle';
import './GameControls.css';

interface GameControlsProps {
  size: PuzzleSize;
  onSizeChange: (size: PuzzleSize) => void;
  onShuffle: () => void;
  onReset: () => void;
  isComplete: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  size,
  onSizeChange,
  onShuffle,
  onReset,
  isComplete,
}) => {
  return (
    <div className="game-controls">
      <div className="control-group">
        <div className="control-label">パズルサイズ:</div>
        <div className="size-buttons">
          <button
            type="button"
            className={`size-button ${size === 3 ? 'active' : ''}`}
            onClick={() => onSizeChange(3)}
          >
            3×3
          </button>
          <button
            type="button"
            className={`size-button ${size === 4 ? 'active' : ''}`}
            onClick={() => onSizeChange(4)}
          >
            4×4
          </button>
        </div>
      </div>

      <div className="control-group">
        <button type="button" className="control-button shuffle" onClick={onShuffle}>
          シャッフル
        </button>
        <button type="button" className="control-button reset" onClick={onReset}>
          リセット
        </button>
      </div>

      {isComplete && (
        <div className="completion-controls">
          <button type="button" className="control-button new-game" onClick={onShuffle}>
            新しいゲーム
          </button>
        </div>
      )}
    </div>
  );
};
