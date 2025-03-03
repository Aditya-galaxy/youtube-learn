"use client"
import React from 'react';

const BuyMeACoffee = () => {
  const handleSupport = () => {
    window.open(`https://www.buymeacoffee.com/${process.env.NEXT_PUBLIC_BUYMEACOFFEE_USERNAME}`, '_blank');
  };

  return (
    <div className="mt-12">
      <button
        onClick={handleSupport}
        className="w-full px-2 py-2 rounded-lg flex items-center space-x-0.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium transition-colors"
      ><img 
          src="/coffee.svg" 
          alt="Coffee cup" 
          className="w-5 h-4"
        />
        <span className= "text-white">
          <span className="opacity-90">Buy me a</span> Coffee
        </span>
      </button>
    </div>
  );
};

export default BuyMeACoffee;