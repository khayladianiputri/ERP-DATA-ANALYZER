
import React from 'react';
import { SparklesIcon } from './icons';

// A more robust markdown-like text to HTML converter
const renderMarkdown = (text: string): { __html: string } => {
  let html = text
    // Sanitize basic HTML to prevent injection
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // Bold: **text**
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Headers: #, ##, ###
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')

    // Unordered list items: - or *
    .replace(/^\s*[-*] (.*)/gim, '<li class="list-disc ml-5 mb-1">$1</li>')

    // Wrap list items in <ul>
    .replace(/(<li.*<\/li>)/gs, (match) => `<ul>${match}</ul>`)
    // Remove duplicate <ul> tags that might be created
    .replace(/<\/ul>\s*<ul>/gs, '')

    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-slate-800 px-1.5 py-1 rounded-md text-sm font-mono">$1</code>')
    
    // Block code: ```...```
     .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-slate-800 text-white p-4 rounded-lg overflow-x-auto"><code class="font-mono text-sm">$2</code></pre>')

    // Newlines to <br>
    .replace(/\n/g, '<br />')
    // Remove <br> inside list wrappers and after headers
    .replace(/<ul><br \/>/g, '<ul>')
    .replace(/<\/li><br \/>/g, '</li>')
    .replace(/<\/ul><br \/>/g, '</ul>')
    .replace(/<\/h[1-3]><br \/>/g, (match) => match.replace('<br />', ''));

  return { __html: html };
};


interface AnalysisDisplayProps {
  analysis: string;
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
            <SparklesIcon className="w-6 h-6 text-indigo-500" />
            <h3 className="text-lg font-bold text-slate-800">AI-Powered Analysis</h3>
        </div>
      </div>
      <div 
        className="p-6 text-slate-700 space-y-4 prose prose-slate max-w-none prose-sm"
        dangerouslySetInnerHTML={renderMarkdown(analysis)}
      />
    </div>
  );
};

export default AnalysisDisplay;
