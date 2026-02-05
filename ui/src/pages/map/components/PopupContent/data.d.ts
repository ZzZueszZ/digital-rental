export interface PopupContentProps {
  stationName: string;
  status: number;
  stationId: string;
  address: string;
  chargingInfo?: {
    image?: string;
    licensePlate: string;
    startTime: string;
    duration: number;
  };
} 