import React from 'react';

type ProFeaturesProps = {
  onUpgradeClick: () => void;
};

const ProFeatures: React.FC<ProFeaturesProps> = ({ onUpgradeClick }) => {
  return (
    <div className="mt-8 p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/20">
      <h2 className="font-medium text-white/90 mb-2">
        Pro Features
      </h2>
      <p className="text-xs text-white/50 mb-3">
        Unlock advanced learning tools and exclusive content
      </p>
      <button 
        onClick={onUpgradeClick} 
        className="w-full px-3 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
      >
        Upgrade Now
      </button>
    </div>
  );
};

export default ProFeatures;