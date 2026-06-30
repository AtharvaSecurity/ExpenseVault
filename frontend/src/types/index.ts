export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Expense {
  id: string;
  amount: number | string;
  description: string;
  category: string;
  date: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedExpenses {
  items: Expense[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalExpenses: number;
  monthlyExpenses: number;
  weeklyExpenses: number;
  categoryBreakdown: { category: string; total: number }[];
  recentTransactions: Expense[];
}

export interface MonthlyTrendPoint {
  month: string;
  total: number;
}

export interface CategoryAnalytics {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  path?: string;
  timestamp?: string;
}
