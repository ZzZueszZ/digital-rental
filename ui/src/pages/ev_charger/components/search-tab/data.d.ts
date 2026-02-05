export interface SearchOption {
    label: string;
    value: string;
    lat: string;
    lon: string;
}

export interface SearchControlProps {
    onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
    onSearch: (value: string) => void;
    searchResults: SearchResult[];
  }