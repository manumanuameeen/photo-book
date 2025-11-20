export interface NavItem {
  id: number;
  name: string;
  icon: string; 
  active: boolean;
}

export interface MetricData {
  title: string;
  value: string;
  trend: string;
  trendColor: 'positive' | 'negative';
  icon: string;
  iconBgColor: 'blue' | 'purple' | 'green' | 'orange';
  isSmall?: boolean;
}

export interface ActivityItem {
  id: number;
  icon: string;
  title: string;
  detail: string;
  borderColor: 'green' | 'blue' | 'purple' | 'orange';
}