export interface ChargingSession {
  key: string;
  authenticationType: string;
  location: string;
  address: string;
  charger: string;
  startTime?: string;
  status: string;
  energyUsed: number;
  cost: number;
  duration?: number;
  licensePlate?: string;
}

export const markers = [
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