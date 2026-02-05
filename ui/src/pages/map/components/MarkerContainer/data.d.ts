import {LatLng} from "leaflet";

export interface MarkerContainerProps {
  pos: LatLng;
  active: boolean;
  status: number;
  stationId: string;
  stationName: string;
  address: string;
  chargingInfo?: {
    image?:string;
    licensePlate: string;
    startTime: string;
    duration: number;
  };
}
