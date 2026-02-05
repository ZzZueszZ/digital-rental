import { useEffect, ReactNode } from 'react';
import { useMap } from 'react-leaflet';
import * as Leaflet from 'leaflet';
import ReactDOM from 'react-dom/client';

interface CustomControlProps {
  position?: Leaflet.ControlPosition;
  children: ReactNode;
}

const CustomControl = ({ position = "topright", children }: CustomControlProps) => {
  const map = useMap();

  useEffect(() => {
    const controlDiv = Leaflet.DomUtil.create('div', );

    const root = ReactDOM.createRoot(controlDiv);
    root.render(<>{children}</>);

    const control = new Leaflet.Control({ position });
    control.onAdd = () => controlDiv;
    control.addTo(map);

    return () => {
      root.unmount();
      control.remove();
    };
  }, [map, children, position]);

  return (
    <></>
  );
};

export default CustomControl;
