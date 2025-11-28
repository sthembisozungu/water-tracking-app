import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { WaterLog } from '../types';

interface Props {
  logs: WaterLog[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 shadow-lg rounded-lg border border-gray-100 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400">
          {`${payload[0].value} ml`}
        </p>
      </div>
    );
  }
  return null;
};

const Charts: React.FC<Props> = ({ logs }) => {
  // Aggregate logs by day for the last 7 days
  const processData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const data = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toDateString();
      
      const dayTotal = logs
        .filter(l => new Date(l.created_at).toDateString() === dateStr)
        .reduce((sum, curr) => sum + curr.amount_ml, 0);

      data.push({
        name: days[d.getDay()],
        amount: dayTotal,
        fullDate: dateStr
      });
    }
    return data;
  };

  const data = processData();

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#6b7280', fontSize: 12 }} 
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.amount >= 2000 ? '#3b82f6' : '#93c5fd'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;