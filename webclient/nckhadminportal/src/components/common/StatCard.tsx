import React, { ReactNode } from 'react';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  color: string;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, trend }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
          {trend && <p className="text-xs text-emerald-600 mt-1 font-medium">{trend}</p>}
        </div>
      </div>
    </div>
  );
};
export default StatCard;
