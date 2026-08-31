import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'amber' }) => {
  return (
    <div className="glass-card glass-card-hover p-6 rounded-2xl relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">{title}</p>
          <h4 className="text-2xl lg:text-3xl font-bold font-serif text-white tracking-tight">{value}</h4>
          {subtitle && <p className="text-xs text-gray-400 mt-1.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-gold-300 group-hover:scale-110 transition-transform">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center text-xs text-amber-400/90 font-medium">
          {trend}
        </div>
      )}
    </div>
  );
};

export default StatCard;
