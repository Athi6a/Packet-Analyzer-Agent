import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ProtocolStats } from '../types';

interface ProtocolChartProps {
  stats: ProtocolStats[];
}

const COLORS = ['#141414', '#333333', '#666666', '#999999', '#CCCCCC', '#E4E3E0'];

export const ProtocolChart: React.FC<ProtocolChartProps> = ({ stats }) => {
  return (
    <div className="h-[300px] w-full p-4 bg-white border border-[#141414] rounded-sm">
      <h3 className="font-serif italic text-xs uppercase opacity-50 mb-4 tracking-widest">Protocol Distribution</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={stats} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EEEEEE" />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontFamily: 'monospace', fontSize: 10, fill: '#141414' }}
            width={60}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(20,20,20,0.05)' }}
            contentStyle={{ 
              backgroundColor: '#141414', 
              color: '#FFFFFF', 
              border: 'none',
              fontFamily: 'monospace',
              fontSize: 10
            }}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} barSize={20}>
            {stats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
