import {useMap} from "react-leaflet"
const DisableAttribute = () => {
  const map = useMap();
  map.attributionControl.setPrefix(false)
  return <></>;
}
export default DisableAttribute;

