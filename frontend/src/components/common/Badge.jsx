import React from 'react';

const Badge = ({ status, variant }) => {
  const label = status || 'Pending';

  const getStyle = () => {
    switch (label.toLowerCase()) {
      case 'confirmed':
      case 'paid':
      case 'verified':
      case 'admin':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
      case 'partially paid':
      case 'manager':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      case 'declined':
      case 'overdue':
      case 'invalid':
      case 'flagged':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'staff':
      case 'vip':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()}`}
    >
      {label}
    </span>
  );
};

export default Badge;
