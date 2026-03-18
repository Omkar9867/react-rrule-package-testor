import React, { useState } from 'react';
import { RRuleGenerator } from 'react-advanced-rrule-generator';
import 'react-advanced-rrule-generator/dist/style.css';

const CustomRRuleGenerator = () => {
  const [rrule, setRrule] = useState('');

  const customClassNames = {
    container: 'p-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none transition-shadow duration-300',
    section: 'mb-8 pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0 last:mb-0 last:pb-0',
    label: 'text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em] mb-4 block',
    button: 'px-5 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
    buttonActive: 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none',
    buttonInactive: 'bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700',
    input: 'w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 font-medium',
    previewContainer: 'mt-10 p-6 bg-slate-900 dark:bg-black rounded-2xl border border-slate-800 dark:border-slate-900 shadow-inner',
    previewTitle: 'text-sm font-bold text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2',
    previewText: 'text-slate-200 dark:text-slate-300 font-medium leading-relaxed text-base',
    previewCode: 'mt-6 font-mono text-[12px] bg-slate-800/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-700/50 text-indigo-300 dark:text-indigo-400 break-all select-all',
  };

  return (
    <div className="max-w-3xl mx-auto py-20 px-4 sm:px-6">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-2 w-10 bg-indigo-600 rounded-full"></div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Scheduler v1.0</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
          Event Recurrence
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md">
          Define complex recurring schedules with precision. Your rules are automatically generated in standard RRule format.
        </p>
      </header>

      <div className="relative">
        {/* Subtle decorative element */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <RRuleGenerator
          onChange={(newRrule) => setRrule(newRrule)}
          classNames={customClassNames}
        />
      </div>

      {rrule && (
        <div className="mt-8 flex justify-center">
          <div className="px-6 py-2.5 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 rounded-full text-[11px] font-bold uppercase tracking-widest border border-slate-200 dark:border-slate-700">
            Output: <span className="text-slate-900 dark:text-indigo-300 ml-1">{rrule}</span>
          </div>
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-400 dark:text-slate-600 text-xs font-medium uppercase tracking-[0.2em]">
          Powered by React Advanced RRule Generator
        </p>
      </footer>
    </div>
  );
};

export default CustomRRuleGenerator;
