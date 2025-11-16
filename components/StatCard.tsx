
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-400">{title}</p>
        {icon}
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
