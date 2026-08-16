export type Role = 'FARMER' | 'AGRONOMIST' | 'ADMIN';
export type AgronomistStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;          
  roles: Role[];       
  language: string;
  location?: string | null;
  agronomistStatus: AgronomistStatus;
  suspended: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface OutbreakPoint {
  scanId: number;
  disease: string;
  confidence: number;
  latitude: number;
  longitude: number;
  createdAt: string;
}

export interface WeeklyPoint {
  weekStart: string;
  scans: number;
}

export interface News {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  createdAt: string;
}

export interface Analytics {
  totalScans: number;
  totalUsers: number;
  totalFarmers: number;
  pendingAgronomists: number;
  scansByDisease: Record<string, number>;
  weeklyTrend: WeeklyPoint[];
}
