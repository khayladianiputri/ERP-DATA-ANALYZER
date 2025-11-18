
import React from 'react';
import { IntegrationsIcon } from './icons';

const Integrations: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center h-full">
        <IntegrationsIcon className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Integrations</h2>
        <p className="text-slate-500 mt-2 max-w-md">
            Connect your favorite tools and services. This feature is coming soon!
        </p>
    </div>
  );
};

export default Integrations;
