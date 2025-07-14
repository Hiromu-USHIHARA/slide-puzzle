import type React from 'react';
import type { PuzzleSize, Tile } from './useSlidePuzzle';
import './PuzzleBoard.css';

interface PuzzleBoardProps {
  tiles: Tile[];
  size: PuzzleSize;
  onTileClick: (tileId: number) => void;
  uploadedImage: string | null;
  tileImages: (string | null)[];
}

export const PuzzleBoard: React.FC<PuzzleBoardProps> = ({
  tiles,
  size,
  onTileClick,
  // uploadedImage,
  tileImages,
}) => {
  const renderTile = (tile: Tile) => {
    // 空きタイルは画像を表示しない
    if (tile.isEmpty) {
      return (
        <button
          type="button"
          key={tile.id}
          className="puzzle-tile empty"
          disabled
          aria-label="空のタイル"
        />
      );
    }
    // タイルごとの画像を割り当て
    const tileImg = tileImages?.[tile.correctPosition];
    const tileStyle = tileImg
      ? {
          backgroundImage: `url(${tileImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

    return (
      <button
        type="button"
        key={tile.id}
        className="puzzle-tile"
        style={tileStyle}
        onClick={() => onTileClick(tile.id)}
        aria-label={`タイル ${tile.correctPosition + 1}`}
      >
        {!tileImg && <span className="tile-number">{tile.correctPosition + 1}</span>}
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
