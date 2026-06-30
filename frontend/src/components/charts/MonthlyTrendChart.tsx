import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/utils/format';

interface MonthlyTrendChartProps {
  data: { month: string; total: number }[];
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="currentColor" />
        <YAxis tick={{ fontSize: 12 }} stroke="currentColor" />
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
        <Bar dataKey="total" fill="#2563EB" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
