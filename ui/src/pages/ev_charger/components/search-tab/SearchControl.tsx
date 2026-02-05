import { AutoComplete } from 'antd';
import { useMap } from 'react-leaflet';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.less';
import { SearchControlProps, SearchOption } from './data';

const SearchControl = ({ onLocationSelect, onSearch, searchResults }: SearchControlProps) => {
  const { t } = useTranslation();
  const map = useMap();

  const handleSelect = (_: string, option: SearchOption) => {
    const location = {
      lat: parseFloat(option.lat),
      lng: parseFloat(option.lon),
      address: option.label
    };
    
    onLocationSelect(location);
    map.setView([location.lat, location.lng], 16);
  };

  return (
    <div className={styles.searchBox}>
      <AutoComplete
        className={styles.searchInput}
        placeholder={t('Tìm kiếm địa điểm')}
        onSearch={onSearch}
        onSelect={handleSelect}
        options={searchResults.map((result): SearchOption => ({
          label: result.display_name,
          value: result.display_name,
          lat: result.lat,
          lon: result.lon
        }))}
      />
    </div>
  );
};

export default SearchControl; 