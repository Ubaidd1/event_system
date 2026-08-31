import React from 'react';

const EmptyState = ({ title, description, actionText, onAction, icon: Icon }) => {
  return (
    <div className="glass-card p-10 rounded-2xl text-center flex flex-col items-center justify-center space-y-4 my-4">
      {Icon && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full text-gold-400">
          <Icon className="w-10 h-10" />
        </div>
      )}
      <h3 className="text-xl font-serif font-semibold text-white">{title || 'No items found'}</h3>
      <p className="text-sm text-gray-400 max-w-md">{description || 'There is no data to display right now.'}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 bg-gold-gradient text-charcoal-900 font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/10"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
