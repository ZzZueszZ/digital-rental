import {Markers} from "@/pages/map/data";


export interface WarningIndicatorComponentProps {
  markers: Markers[];
  isSelected: number;
  handleSelect: (isSelected:number) => void;
}

