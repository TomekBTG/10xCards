// Dashboard Stats DTO representing statistics data
export interface DashboardStatsDTO {
  label: string;
  value: number;
  icon?: string;
}

// Navigation button DTO representing navigation actions
export interface NavButtonDTO {
  label: string;
  route: string;
  icon?: string;
}

// Dashboard summary DTO representing recent activities
export interface DashboardSummaryDTO {
  recentGenerations: {
    id: string;
    date: string;
    count: number;
  }[];
}

// Dashboard view model combining all dashboard data
export interface DashboardViewModel {
  stats: DashboardStatsDTO[];
  navButtons: NavButtonDTO[];
  summary?: DashboardSummaryDTO;
  isLoading: boolean;
  error: string | null;
}
