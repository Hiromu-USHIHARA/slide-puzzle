import React from 'react';
import './GameInfo.css';

interface GameInfoProps {
  moves: number;
  elapsedTime: number;
  isComplete: boolean;
}

export const GameInfo: React.FC<GameInfoProps> = ({
  moves,
  elapsedTime,
  isComplete
}) => {
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="game-info">
      <div className="info-item">
        <span className="label">手数:</span>
        <span className="value">{moves}</span>
      </div>
      <div className="info-item">
        <span className="label">時間:</span>
        <span className="value">{formatTime(elapsedTime)}</span>
      </div>
      {isComplete && (
        <div className="completion-message">
          🎉 パズル完成！おめでとうございます！ 🎉
        </div>
      )}
    </div>
  );
}; 