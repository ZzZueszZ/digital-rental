import { LatLng } from "leaflet";

export interface ChargingStation {
  pos: LatLng;
  active: boolean;
  status: number;
  stationId: string;
  stationName: string;
  address: string;
  chargingInfo?: {
    image?: string;
    licensePlate: string;
    startTime: string;
    duration: number;
  };
}

export interface EvChargerContainerProps {
  stations: ChargingStation[];
  onAdd: (newStation: ChargingStation) => void;
  onUpdate: (stationId: string, updatedData: ChargingStation) => void;
}
