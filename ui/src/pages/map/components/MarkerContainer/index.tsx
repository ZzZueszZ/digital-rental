import {Marker, Popup} from "react-leaflet";
import {icon} from "leaflet";
import {MarkerContainerProps} from "./data";
import PopupContent from "@/pages/map/components/PopupContent";

const   MarkerContainer = ({ marker }: { marker: MarkerContainerProps }) => {
  const markerIcon = (status : number) =>
    icon({
      iconSize: [41, 41],
      iconAnchor: [10, 41],
      popupAnchor: [2, -40],
      iconUrl: status === 1
        ? "/images/leaflet/icons/charging-station-14-svgrepo-com_green.svg"
        : status === 2
          ? "/images/leaflet/icons/charging-station-14-svgrepo-com_red.svg"
          : "/images/leaflet/icons/charging-station-14-svgrepo-com_orange.svg",
    });

  return  (
    <Marker position={marker.pos} icon={markerIcon(marker.status)}>
      <Popup >
        <PopupContent
          stationName={marker.stationName}
          status={marker.status}
          stationId={marker.stationId}
          address={marker.address}
          chargingInfo={marker.chargingInfo}
        />
      </Popup>
    </Marker>
  )
}
export default MarkerContainer;
