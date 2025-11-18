
import React from 'react';
import { TableRow } from '../types';
import { TableIcon } from './icons';

interface DataTableProps {
  headers: string[];
  data: TableRow[];
}

const DataTable: React.FC<DataTableProps> = ({ headers, data }) => {
  const MAX_ROWS_PREVIEW = 50;
  const displayedData = data.slice(0, MAX_ROWS_PREVIEW);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-200">
             <div className="flex items-center gap-3">
                <TableIcon className="w-6 h-6 text-slate-500" />
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Data Preview</h3>
                    {data.length > MAX_ROWS_PREVIEW && (
                        <p className="text-sm text-slate-500">Showing first {MAX_ROWS_PREVIEW} of {data.length} rows.</p>
                    )}
                </div>
             </div>
        </div>
        <div className="max-h-[500px] overflow-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 sticky top-0">
                    <tr>
                    {headers.map((header) => (
                        <th key={header} scope="col" className="px-6 py-3 text-left font-bold text-slate-600 uppercase tracking-wider">
                        {header}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {displayedData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-slate-50 transition-colors">
                        {headers.map((header, colIndex) => (
                        <td key={`${rowIndex}-${colIndex}`} className="px-6 py-4 whitespace-nowrap text-slate-700">
                            {row[header] === null || row[header] === undefined ? <span className="text-slate-400">N/A</span> : String(row[header])}
                        </td>
                        ))}
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
        {data.length === 0 && (
            <div className="p-6 text-center text-slate-500">
                No data to display.
            </div>
        )}
    </div>
  );
};

export default DataTable;
