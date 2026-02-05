export type TileOptionKey = 'osm' | 'street' | 'satellite' | 'dark' | 'basic';

export interface TileOptionsProps {
  onTileChange: (type: TileOptionKey) => void;
  selectedTile: TileOptionKey;
}
