import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ label = 'Loading ShaadiSphere data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 min-h-[250px]">
      <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      <p className="text-sm font-medium text-amber-200/80 tracking-wide font-serif">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
