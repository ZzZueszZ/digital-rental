export interface ChargingSession {
    id: string;
    authenticationType: string;
    location: string;
    charger: string;
    startTime: string;
    status: string;
    energyUsed: number;
    cost: number;
  }
  
  export interface ChargerStatusData {
    available: number;
    outOfOrder: number;
    offline: number;
    charging: number;
    scheduled: number;
    comingSoon: number;
  }
  
  export interface StatsData {
    feesCollected: number;
    energyUsed: number;
    sessions: number;
  }
  
  export interface DashboardData {
    chargerStatus: ChargerStatusData;
    stats: StatsData;
    recentSessions: ChargingSession[];
    monthlyStats: {
      month: string;
      value: number;
    }[];
  }