
import React from 'react';
import { CogIcon } from './icons';

const Settings: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center flex flex-col items-center justify-center h-full">
        <CogIcon className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
        <p className="text-slate-500 mt-2 max-w-md">
            Manage your application preferences and account settings. This section is under construction.
        </p>
    </div>
  );
};

export default Settings;
