
import React, { ReactElement } from 'react';

interface StatCardProps {
  icon: ReactElement;
  title: string;
  value: string | number;
  bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, bgColor = 'bg-slate-100' }) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'number') {
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  const displayValue = formatValue(value);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-5">
      <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${bgColor}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-lg font-bold text-slate-800 truncate" title={displayValue}>{displayValue}</p>
      </div>
    </div>
  );
};

export default StatCard;
