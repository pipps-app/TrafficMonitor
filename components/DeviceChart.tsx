import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import type { DeviceType } from '../types';

interface DeviceChartProps {
  data: DeviceType[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

const RADIAN = Math.PI / 180;
// FIX: Corrected the signature for `renderCustomizedLabel`. The previous generic type was too strict
// for the `PieLabel` prop from `recharts`, which passes an object with optional properties.
// This change resolves both TypeScript errors by making the function signature compatible.
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// FIX: Converted from a class component to a functional component to resolve issues with `this.props` and align with project's coding style.
const DeviceChart: React.FC<DeviceChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Legend iconType="circle" wrapperStyle={{fontSize: "14px", paddingTop: "20px"}} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceChart;