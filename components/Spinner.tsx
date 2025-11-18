
import React from 'react';

const Spinner: React.FC<{className?: string}> = ({className = "h-5 w-5"}) => {
  return (
    <div className={`animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500 ${className}`}></div>
  );
};

export default Spinner;
