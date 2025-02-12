import React from 'react';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
  </div>
);

export default LoadingSpinner;