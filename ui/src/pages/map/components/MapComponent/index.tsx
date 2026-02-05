import "leaflet/dist/leaflet.css";
import "react-leaflet-fullscreen/styles.css";

import Leaflet, { latLng } from "leaflet";
import {MapContainer, TileLayer} from "react-leaflet";

import MarkerClusterGroup from "react-leaflet-cluster";
import MarkerContainer from "@/pages/map/components/MarkerContainer";
import LocationMarker from "@/pages/map/components/LocationMarker";
import { FullscreenControl } from "react-leaflet-fullscreen";
import 'leaflet-control-geocoder';
import "./override.module.less";
import DisableAttribute from "@/pages/map/components/DisableAttribute";
import WarningIndicator from "@/pages/map/components/WarningIndicator";
import { useState } from "react";
Leaflet.Icon.Default.imagePath = "//cdnjs.cloudflare.com/ajax/libs/leaflet/1.0.0/images/";
import styles from "./styles.module.less";
import CustomControl from "@/pages/map/components/CustomControl";
import {TileOptionKey} from "./data"
import TileOptions from "@/pages/map/components/TileOptions";

const MapComponent = () => {
  const markers = [
    {
      pos: latLng(10.770579465246364, 106.6691086035144),
      active: true,
      status: 1,
      stationId: "CS001",
      stationName: "Trạm sạc 1",
      address: "Vạn Hạnh Mall, 11, Su Van Hanh, Ward 12, District 10, Ho Chi Minh City, Vietnam",
      chargingInfo: {
        image: "/images/leaflet/cars/car_1.jpg",
        licensePlate: "51F-123.45",
        startTime: "14:30",
        duration: 45
      }
    },
    {
      pos: latLng(10.74511416241487, 106.63974165963765),
      active: true,
      status: 1,
      stationId: "CS002",
      stationName: "Trạm sạc 2",
      address: "962, Lò Gốm, Ward 8, District 6, Ho Chi Minh City, Vietnam",
      chargingInfo: {
        image: "/images/leaflet/cars/car_2.jpg",
        licensePlate: "51F-123.45",
        startTime: "14:30",
        duration: 45
      }
    },
    {
      pos: latLng(10.753546620004627, 106.67013902259782),
      active: true,
      status: 1,
      stationId: "CS003",
      stationName: "Trạm sạc 3",
      address: "433, Tran Phu Avenue, Ward 7, District 5, Ho Chi Minh City, Vietnam",
      chargingInfo: {
        image: "/images/leaflet/cars/car_3.jpg",
        licensePlate: "51G-678.90",
        startTime: "15:45",
        duration: 30
      }
    },
    {
      pos: latLng(10.7586059814377, 106.70843626519736),
      active: true,
      status: 1,
      stationId: "CS004",
      stationName: "Trạm sạc 4",
      address: "Ward 15, District 4, Ho Chi Minh City, Vietnam",
      chargingInfo: {
        image: "/images/leaflet/cars/car_4.jpg",
        licensePlate: "51H-456.78",
        startTime: "16:00",
        duration: 60
      }
    },
    {
      pos: latLng(10.793513259691235, 106.74226835843554),
      active: true,
      status: 1,
      stationId: "CS005",
      stationName: "Trạm sạc 5",
      address: "Đường Cao Đức Lân, An Phu Ward, Thủ Đức, Ho Chi Minh City, Vietnam",
      chargingInfo: {
        image: "/images/leaflet/cars/car_5.jpg",
        licensePlate: "51I-234.56",
        startTime: "16:30",
        duration: 25
      }
    },
    {
      pos: latLng(10.796717106446879, 106.67975626737618),
      active: false,
      status: 2,
      stationId: "CS006",
      stationName: "Trạm sạc 6",
      address: "Hẻm 33 Nguyễn Đình Chính, Ward 15, Phú Nhuận District, Ho Chi Minh City, Vietnam",
    },
    {
      pos: latLng(10.861629790190392, 106.66028777379663),
      active: true,
      status: 1,
      stationId: "CS007",
      stationName: "Trạm sạc 7",
      address: "Quốc lộ 1, Phường Thới An, District 12, Ho Chi Minh City, Vietnam",
      chargingInfo: {
        image: "/images/leaflet/cars/car_7.jpg",
        licensePlate: "51L-234.56",
        startTime: "17:00",
        duration: 40
      }
    },
  ];

  const [isSelected, setSelect] = useState(0);

  const tileOptions = {
    osm: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    street: "https://api.maptiler.com/maps/bright-v2/256/{z}/{x}/{y}.png?key=7EnxFxqALfXLAq3D1woq",
    satellite: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    dark : "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    basic: "https://api.maptiler.com/maps/basic-v2/256/{z}/{x}/{y}.png?key=7EnxFxqALfXLAq3D1woq"
  };

  const [tileUrl, setTileUrl] = useState<string>(tileOptions.osm);
  const handleTileChange = (type: keyof typeof tileOptions) => {
    setTileUrl(tileOptions[type]);
  };

  return (
    <div>


      <MapContainer
        center={[10.833708295365664, 106.75594522593435]}
        zoom={13}
      >
        <TileLayer url={tileUrl}/>
        <DisableAttribute/>
        <FullscreenControl position="topright"/>
        <CustomControl>
          <TileOptions
            onTileChange={handleTileChange}
            selectedTile={Object.keys(tileOptions).find(key => tileOptions[key as TileOptionKey] === tileUrl) as TileOptionKey}
          />
        </CustomControl>

        <div className={styles.container}>
          <WarningIndicator markers={markers} isSelected={isSelected} handleSelect={setSelect}/>
          <LocationMarker/>
        </div>

        <MarkerClusterGroup chunkedLoading>
          {(isSelected > 0
              ? markers.filter(marker => marker.status === isSelected)
              : markers
          ).map((marker, index) => (
            <MarkerContainer marker={marker} key={index}/>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
};

export default MapComponent;
