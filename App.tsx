
import React, { useState, useCallback, ReactNode } from 'react';
import { TableRow } from './types';
import { analyzeDataWithGemini } from './services/geminiService';
import FileUpload from './components/FileUpload';
import DataTable from './components/DataTable';
import AnalysisDisplay from './components/AnalysisDisplay';
// Fix: Import missing icons to resolve compilation errors.
import { SparklesIcon, DocumentTextIcon, LogoIcon, TableIcon, IntegrationsIcon, CogIcon, TrendingUpIcon, TrendingDownIcon, ScaleIcon, ChartBarIcon, RowsIcon, ColumnsIcon, WarningIcon } from './components/icons';
import Spinner from './components/Spinner';
import StatCard from './components/StatCard';
import DataView from './components/DataView';
import Integrations from './components/Integrations';
import Settings from './components/Settings';
import ExpenseChart from './components/ExpenseChart';


declare var Papa: any;
declare var XLSX: any;

type Page = 'dashboard' | 'data-view' | 'integrations' | 'settings';

interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<TableRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<Page>('dashboard');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [expenseByCategory, setExpenseByCategory] = useState<Record<string, number>>({});


  const resetState = () => {
    setFile(null);
    setData([]);
    setHeaders([]);
    setAnalysis('');
    setError(null);
    setIsLoading(false);
    setIsAnalyzing(false);
    setActivePage('dashboard');
    setFinancialSummary(null);
    setExpenseByCategory({});
  };

  const calculateFinancials = (dataToProcess: TableRow[]) => {
      if (dataToProcess.length === 0) return;

      const currentHeaders = Object.keys(dataToProcess[0] || {});
      const hasTipe = currentHeaders.includes('Tipe Transaksi');
      const hasJumlah = currentHeaders.includes('Jumlah (IDR)');
      const hasKategori = currentHeaders.includes('Kategori');

      if (!hasTipe || !hasJumlah || !hasKategori) {
          console.warn('File is missing one or more required financial columns: "Tipe Transaksi", "Jumlah (IDR)", "Kategori". Skipping financial calculations.');
          setFinancialSummary(null);
          setExpenseByCategory({});
          return;
      }

      let income = 0;
      let expense = 0;
      const expenseCategories: Record<string, number> = {};

      dataToProcess.forEach(row => {
          const type = row['Tipe Transaksi'];
          const amount = parseFloat(String(row['Jumlah (IDR)']));
          const category = String(row['Kategori']);

          if (!isNaN(amount)) {
              if (type === 'Pemasukan') {
                  income += amount;
              } else if (type === 'Pengeluaran') {
                  expense += amount;
                  if (category) {
                      expenseCategories[category] = (expenseCategories[category] || 0) + amount;
                  }
              }
          }
      });
      
      setFinancialSummary({
          totalIncome: income,
          totalExpense: expense,
          netBalance: income - expense,
      });
      setExpenseByCategory(expenseCategories);
  }

  const handleFileParse = useCallback((selectedFile: File) => {
    resetState();
    setFile(selectedFile);
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let parsedData: TableRow[] = [];
        let parsedHeaders: string[] = [];

        if (selectedFile.name.endsWith('.csv')) {
          Papa.parse(event.target?.result as string, {
            header: true,
            skipEmptyLines: true,
            complete: (results: { data: TableRow[]; meta: { fields: string[] } }) => {
              parsedHeaders = results.meta.fields;
              parsedData = results.data;
              setHeaders(parsedHeaders);
              setData(parsedData);
              calculateFinancials(parsedData);
              setIsLoading(false);
            },
            error: (err: any) => {
              setError(`CSV Parse Error: ${err.message}`);
              setIsLoading(false);
            }
          });
        } else if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
          const workbook = XLSX.read(event.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length < 1) {
             setError("Excel file is empty or could not be read.");
             setIsLoading(false);
             return;
          }

          parsedHeaders = jsonData[0] as string[];
          parsedData = (jsonData.slice(1) as any[][]).map(row => {
            const rowData: TableRow = {};
            parsedHeaders.forEach((header, index) => {
              rowData[header] = row[index] ?? '';
            });
            return rowData;
          });

          setHeaders(parsedHeaders);
          setData(parsedData);
          calculateFinancials(parsedData);
          setIsLoading(false);
        } else {
          setError('Unsupported file type. Please upload a .csv or .xlsx file.');
          setIsLoading(false);
        }
      } catch (e) {
         setError('An unexpected error occurred while parsing the file.');
         setIsLoading(false);
      }
    };

    reader.onerror = () => {
        setError('Failed to read the file.');
        setIsLoading(false);
    }
    
    if (selectedFile.name.endsWith('.csv')) {
        reader.readAsText(selectedFile);
    } else {
        reader.readAsBinaryString(selectedFile);
    }
  }, []);

  const handleAnalyze = async () => {
    if (data.length === 0) {
      setError("No data available to analyze.");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setAnalysis('');

    try {
      const result = await analyzeDataWithGemini(data);
      setAnalysis(result);
    } catch (e: any) {
      setError(`Analysis failed: ${e.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const DashboardContent = () => (
    <div className="space-y-6 lg:space-y-8">
        {/* Header and Analyze Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Financial Dashboard</h2>
            <p className="text-slate-500 mt-1">AI-powered insights from your financial data.</p>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 disabled:bg-indigo-400 disabled:cursor-not-allowed transform hover:scale-105"
          >
            {isAnalyzing ? <Spinner /> : <SparklesIcon className="w-5 h-5" />}
            <span className="leading-tight">{isAnalyzing ? 'Analyzing...' : 'Generate AI Analysis'}</span>
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
                icon={<DocumentTextIcon className="w-6 h-6 text-blue-500"/>} 
                title="Filename" 
                value={file?.name || 'N/A'} 
                bgColor="bg-blue-50"
            />
            {financialSummary ? (
                <>
                    <StatCard 
                        icon={<TrendingUpIcon className="w-6 h-6 text-green-500"/>} 
                        title="Total Income" 
                        value={financialSummary.totalIncome} 
                        bgColor="bg-green-50"
                    />
                    <StatCard 
                        icon={<TrendingDownIcon className="w-6 h-6 text-red-500"/>} 
                        title="Total Expense" 
                        value={financialSummary.totalExpense} 
                        bgColor="bg-red-50"
                    />
                    <StatCard 
                        icon={<ScaleIcon className="w-6 h-6 text-purple-500"/>} 
                        title="Net Balance" 
                        value={financialSummary.netBalance} 
                        bgColor="bg-purple-50"
                    />
                </>
            ) : (
                 <>
                    <StatCard 
                        icon={<RowsIcon className="w-6 h-6 text-green-500"/>} 
                        title="Total Rows" 
                        value={data.length.toLocaleString()} 
                        bgColor="bg-green-50"
                    />
                    <StatCard 
                        icon={<ColumnsIcon className="w-6 h-6 text-yellow-500"/>} 
                        title="Total Columns" 
                        value={headers.length.toLocaleString()} 
                        bgColor="bg-yellow-50"
                    />
                 </>
            )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
            <div className={`transition-all duration-500 ${analysis ? 'lg:col-span-3' : 'lg:col-span-5'}`}>
                {Object.keys(expenseByCategory).length > 0 && <ExpenseChart data={expenseByCategory} />}
            </div>
            {analysis && (
                <div className="lg:col-span-2">
                    <AnalysisDisplay analysis={analysis} />
                </div>
            )}
        </div>


        {isAnalyzing && !analysis && (
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-xl shadow-sm border border-slate-200">
              <Spinner />
              <p className="mt-4 text-slate-600">Gemini is analyzing your data... This might take a moment.</p>
          </div>
        )}
      
        <DataTable headers={headers} data={data} />
    </div>
  );

  const MainContent = () => {
    if (isLoading) {
        return (
             <div className="flex flex-col items-center justify-center h-full bg-white/50 rounded-xl">
                <Spinner />
                <p className="mt-4 text-slate-600 font-medium">Parsing your file...</p>
            </div>
        )
    }
    
    if (data.length > 0) {
        switch (activePage) {
            case 'dashboard':
                return <DashboardContent />;
            case 'data-view':
                return <DataView headers={headers} data={data} />;
            case 'integrations':
                return <Integrations />;
            case 'settings':
                return <Settings />;
            default:
                return <DashboardContent />;
        }
    }

    // Default to file upload
    return <FileUpload onFileSelect={handleFileParse} />;
  }

  const navItems: { id: Page, label: string, icon: ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5"/> },
    { id: 'data-view', label: 'Data View', icon: <TableIcon className="w-5 h-5"/> },
    { id: 'integrations', label: 'Integrations', icon: <IntegrationsIcon className="w-5 h-5"/> },
    { id: 'settings', label: 'Settings', icon: <CogIcon className="w-5 h-5"/> },
  ];

  return (
    <div className="min-h-screen font-sans text-slate-800 bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex-col justify-between hidden lg:flex">
        <div>
            <div className="flex items-center gap-3 mb-10">
                <LogoIcon className="w-8 h-8 text-indigo-600" />
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">FinAnalyzer</h1>
            </div>
            
            <nav className="space-y-2">
                 {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => file && setActivePage(item.id)}
                        disabled={!file}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                            activePage === item.id 
                            ? 'bg-indigo-50 text-indigo-700 font-bold' 
                            : 'text-slate-600 hover:bg-slate-100'
                        } ${!file ? 'cursor-not-allowed text-slate-400' : ''}`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                 ))}
            </nav>
        </div>
        <div className="text-center text-xs text-slate-400">
            <p>Powered by Gemini</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-10">
             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div className="lg:hidden flex items-center gap-3">
                    <LogoIcon className="w-7 h-7 text-indigo-600" />
                    <h1 className="text-lg font-bold text-slate-900 tracking-tight">FinAnalyzer</h1>
                </div>
                {file && (
                     <button
                        onClick={resetState}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-md hover:bg-slate-200 transition-colors text-sm ml-auto"
                    >
                        Upload New File
                    </button>
                )}
             </div>
        </header>

         <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {error && (
                <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 rounded-md shadow-sm" role="alert">
                <div className="flex items-center">
                    <WarningIcon className="w-6 h-6 mr-3 flex-shrink-0"/>
                    <div>
                    <p className="font-bold">An Error Occurred</p>
                    <p className="text-sm">{error}</p>
                    </div>
                </div>
                </div>
            )}
            <MainContent />
        </main>
      </div>
    </div>
  );
};

export default App;
