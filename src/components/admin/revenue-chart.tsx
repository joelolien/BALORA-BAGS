'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-ink/50 h-64 flex items-center justify-center">No revenue data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3E4A37" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3E4A37" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E6DAC3" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [`GHS ${v.toFixed(2)}`, 'Revenue']} />
        <Area type="monotone" dataKey="revenue" stroke="#3E4A37" fill="url(#revenueFill)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
