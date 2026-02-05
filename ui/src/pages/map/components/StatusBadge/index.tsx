import { Badge, Avatar } from "antd";
import styles from "./styles.module.less";
import {StatusBadgeProps} from "@/pages/map/components/StatusBadge/data";


const StatusBadge = ({ count, icon, colorClass, isSelected, handleSelect } : StatusBadgeProps) => {

  return (
    <Badge count={count} showZero>
      <Avatar
        shape="circle"
        size="large"
        className={`${styles.avatar} ${colorClass} ${isSelected ? styles.selected : ''}`}
        icon={icon}
        onClick={handleSelect}
      />
    </Badge>
  );
};

export default StatusBadge;
