import type React from 'react';
import type { PuzzleSize, Tile } from './useSlidePuzzle';
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
  uploadedImage,
}) => {
  const renderTile = (tile: Tile) => {
    const tileStyle = {
      backgroundImage: uploadedImage ? `url(${uploadedImage})` : undefined,
      backgroundPosition: uploadedImage
        ? `${-((tile.correctPosition % size) * 100)}% ${-((Math.floor(tile.correctPosition / size)) * 100)}%`
        : undefined,
    };

    return (
      <button
        type="button"
        key={tile.id}
        className={`puzzle-tile ${tile.isEmpty ? 'empty' : ''}`}
        style={tileStyle}
        onClick={() => !tile.isEmpty && onTileClick(tile.id)}
        disabled={tile.isEmpty}
        aria-label={tile.isEmpty ? '空のタイル' : `タイル ${tile.correctPosition + 1}`}
      >
        {!uploadedImage && !tile.isEmpty && (
          <span className="tile-number">{tile.correctPosition + 1}</span>
        )}
      </button>
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
        return tile ? renderTile(tile) : <div key={`empty-${index}-${size}`} className="puzzle-tile empty" />;
      })}
    </div>
  );
};
