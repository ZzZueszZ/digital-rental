import React from "react";

interface StatusBadgeProps {
  count: number;
  icon: React.ReactNode;
  colorClass: string;
  isSelected: boolean;
  handleSelect: () => void;
}
