import {LatLng} from "leaflet";

export interface ChargingStation {
  pos: LatLng;
  active: boolean;
  status: number;
  stationId: string;
  stationName: string;
  address: string;
  chargingInfo?: {
    image?: string
    licensePlate: string;
    startTime: string;
    duration: number;
  }
}
export interface EditFormProps {
    showForm: {
      action: 'ADD' | 'UPDATE';
      visible: boolean;
      data: ChargingStation | undefined;
    };
    onFinish: (values?: ChargingStation) => void;
  }

export interface Location {
    lat: number;
    lng: number;
  }

export interface SearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}
