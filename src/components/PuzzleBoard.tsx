import React from 'react';
import type { Tile, PuzzleSize } from './useSlidePuzzle';
import './PuzzleBoard.css';

interface PuzzleBoardProps {
  tiles: Tile[];
  size: PuzzleSize;
  onTileClick: (tileId: number) => void;
  uploadedImage: string | null;
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  tiles,
  size,
  onTileClick,
  uploadedImage
}) => {
  const renderTile = (tile: Tile) => {
    const tileStyle: React.CSSProperties = {
      backgroundImage: uploadedImage && !tile.isEmpty ? `url(${uploadedImage})` : undefined,
      backgroundSize: `${size * 100}px ${size * 100}px`,
      backgroundPosition: `-${(tile.correctPosition % size) * (100 / size)}% -${Math.floor(tile.correctPosition / size) * (100 / size)}%`,
    };

    return (
      <div
        key={tile.id}
        className={`puzzle-tile ${tile.isEmpty ? 'empty' : ''}`}
        style={tileStyle}
        onClick={() => !tile.isEmpty && onTileClick(tile.id)}
      >
        {!uploadedImage && !tile.isEmpty && (
          <span className="tile-number">{tile.correctPosition + 1}</span>
        )}
      </div>
    );
  };

  const boardStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${size}, 1fr)`,
    gridTemplateRows: `repeat(${size}, 1fr)`,
  };
  
  return (
    <div className="puzzle-board" style={boardStyle}>
      {Array.from({ length: size * size }, (_, index) => {
        const tile = tiles.find(t => t.currentPosition === index);
        return tile ? renderTile(tile) : <div key={index} className="puzzle-tile empty" />;
      })}
    </div>
  );
}; 