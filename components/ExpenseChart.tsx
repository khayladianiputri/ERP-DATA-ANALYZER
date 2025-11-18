
import React, { useMemo } from 'react';
import { ChartBarIcon } from './icons';

interface ExpenseChartProps {
  data: Record<string, number>;
}

const COLORS = [
  '#4f46e5', '#7c3aed', '#db2777', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'
];

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
  const { sortedData, totalExpense } = useMemo(() => {
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a);
    const total = sorted.reduce((sum, [, amount]) => sum + amount, 0);
    return { sortedData: sorted, totalExpense: total };
  }, [data]);

  if (sortedData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <ChartBarIcon className="w-6 h-6 text-slate-500" />
          <div>
            <h3 className="text-lg font-bold text-slate-800">Expense Breakdown</h3>
            <p className="text-sm text-slate-500">Top spending categories</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {sortedData.map(([category, amount], index) => {
          const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
          const color = COLORS[index % COLORS.length];

          return (
            <div key={category} className="space-y-1.5">
              <div className="flex justify-between items-baseline text-sm">
                <span className="font-semibold text-slate-700">{category}</span>
                <span className="font-bold text-slate-800">{formatCurrency(amount)}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div
                  className="h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                  title={`${percentage.toFixed(1)}%`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExpenseChart;
