import styles from './style.module.less';

import { InsertRowLeftOutlined } from "@ant-design/icons";
import { Avatar, Popover, Radio, RadioChangeEvent } from "antd";
import {TileOptionKey, TileOptionsProps} from "./data";
import { useRef } from 'react';

const TileOptions = ({ onTileChange, selectedTile }: TileOptionsProps) => {
  const containerRef = useRef(null);

  const handleTileChange = (e: RadioChangeEvent) => {
    const selectedOption = e.target.value as TileOptionKey;
    onTileChange(selectedOption);
  };

  const content = (
    <Radio.Group
      onChange={handleTileChange}
      value={selectedTile}
      className={styles.radioGroupVertical}
    >
      <Radio.Button value="osm">OSM</Radio.Button>
      <Radio.Button value="street">Street</Radio.Button>
      <Radio.Button value="satellite">Satellite</Radio.Button>
      <Radio.Button value="dark">Dark</Radio.Button>
      <Radio.Button value="basic">Basic</Radio.Button>
    </Radio.Group>
  );

  return (
    <div ref={containerRef}>
      <Popover 
        content={content} 
        trigger="hover" 
        placement="left"
        getPopupContainer={() => containerRef.current || document.body}
      >
        <Avatar
          shape="square"
          size="large"
          icon={<InsertRowLeftOutlined style={{ color: 'black' }} />}
          className={styles.avatar}
        />
      </Popover>
    </div>
  );
}

export default TileOptions;
