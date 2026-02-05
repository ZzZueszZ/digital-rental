import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { Button } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import { LatLng } from "leaflet";
import {useTranslation} from "react-i18next";

const LocationMarker = () => {
  const {t} = useTranslation();
  const [position, setPosition] = useState<LatLng | null>(null);
  const map = useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  const handleLocate = () => {
    map.locate();
  };

  return (
    <>
      <Button
        type="primary"
        shape="default"
        icon={<EnvironmentOutlined />}
        size="large"
        onClick={handleLocate}
      />

      {position && (
        <Marker position={position}>
          <Popup>{t("You are here")}</Popup>
        </Marker>
      )}
    </>
  );
};

export default LocationMarker;
