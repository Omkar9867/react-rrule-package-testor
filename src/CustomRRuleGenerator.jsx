/**
 * ChronosEngine.jsx
 *
 * Demo app for react-advanced-rrule-generator.
 *
 * KEY FIXES over the original:
 * 1. classNames strings are defined as a `const` at module top-level so
 *    Tailwind's JIT scanner sees every class statically and includes them
 *    in the bundle. Dynamic strings passed inline to props are invisible
 *    to the scanner — that was why none of your styles appeared.
 *
 * 2. Custom sub-components (FrequencySelect, DayCheckbox) now receive the
 *    correct prop shapes your package actually passes down.
 *
 * 3. The preview panel gives instant copy + integration hint.
 *
 * Install:
 *   npm install react-advanced-rrule-generator
 */

import React, { useState } from 'react';
import { RRuleGenerator } from 'react-advanced-rrule-generator';
import 'react-advanced-rrule-generator/dist/style.css';

// ─────────────────────────────────────────────────────────────────────────────
// CRITICAL FIX: All Tailwind class strings must live here at module top-level.
//
// Never build them inside a render function or pass them as inline JSX
// object literals — e.g. classNames={{ section: `mb-6 ${condition ? ...}` }}
//
// The Tailwind JIT/v4 scanner reads your SOURCE FILES statically at build time.
// It cannot see strings that are computed at runtime or constructed dynamically.
// If a class string never appears literally in a source file, it never gets
// included in the CSS bundle, so the style silently does nothing.
//
// Rule of thumb: if you can't grep for the exact class name as a plain string
// in your repo, Tailwind won't include it.
// ─────────────────────────────────────────────────────────────────────────────

const CN = {
    container: 'p-0 bg-transparent border-0 shadow-none',

    section: 'mb-6 p-5 rounded-2xl border transition-colors duration-200 bg-white/[0.04] border-white/[0.08] hover:border-indigo-500/25',

    label: 'block mb-3 text-xs font-black uppercase tracking-[0.2em] text-slate-400',

    input: 'w-20 px-3 py-2 rounded-xl text-sm font-bold text-center text-white bg-slate-900 border border-white/10 focus:border-indigo-500 focus:outline-none transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',

    previewContainer: 'p-8 rounded-3xl border border-white/[0.08] bg-black/60 flex flex-col justify-center gap-6',

    previewTitle: 'text-[9px] font-black text-white/25 uppercase tracking-[0.4em]',

    previewText: 'text-xl font-bold text-white leading-snug tracking-tight',

    previewCode: 'mt-4 p-4 rounded-2xl border border-white/[0.08] font-mono text-[11px] text-indigo-300 break-all select-all bg-white/[0.04]',
};

// ─── Custom Frequency Selector ────────────────────────────────────────────────
// Props your package passes down:
//   value    – the RRule freq constant for this option
//   label    – display string ("Daily", "Weekly" …)
//   selected – boolean
//   onClick  – call with value to change frequency

const CustomFrequencySelect = ({ value, label, selected, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={
            selected
                ? 'relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl select-none text-[11px] font-black uppercase tracking-wider border-2 transition-all duration-200 bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-[1.04]'
                : 'relative flex flex-col items-center gap-1 px-4 py-3 rounded-xl select-none text-[11px] font-black uppercase tracking-wider border-2 transition-all duration-200 bg-white/[0.04] border-white/10 text-slate-500 hover:border-indigo-500/40 hover:text-slate-200'
        }
    >
        {selected && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-slate-950" />
        )}
        {label}
    </button>
);

// ─── Custom Day Checkbox ─────────────────────────────────────────────────────
// Props your package passes down:
//   value    – weekday constant (RRule.MO etc.)
//   label    – full name ("Monday" …)
//   checked  – boolean
//   onChange – call with next checked boolean

const CustomDayCheckbox = ({ label, checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        title={label}
        className={
            checked
                ? 'w-10 h-10 rounded-full flex items-center justify-center select-none text-[11px] font-black transition-all duration-150 border-2 bg-indigo-600 border-indigo-500 text-white scale-110 shadow-md shadow-indigo-600/40'
                : 'w-10 h-10 rounded-full flex items-center justify-center select-none text-[11px] font-black transition-all duration-150 border-2 bg-white/[0.04] border-white/10 text-slate-500 hover:border-indigo-500/30 hover:text-slate-300'
        }
    >
        {label.slice(0, 2)}
    </button>
);

// ─── Main App ────────────────────────────────────────────────────────────────

const ChronosEngine = () => {
    const [rrule, setRrule] = useState('');
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard?.writeText(rrule).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-indigo-600/[0.08] rounded-full blur-[130px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/[0.06] rounded-full blur-[110px]" />
            </div>

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-screen">

                {/* ── Left: Generator ─── */}
                <div className="lg:col-span-7 p-8 lg:p-14 overflow-y-auto space-y-10">

                    <header>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40 shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.35em]">Chronos Engine</p>
                                <h1 className="text-2xl font-black tracking-tight leading-none text-white">Recurrence Designer</h1>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 font-medium max-w-sm pl-[52px]">
                            Build RFC 5545–compliant iCal recurrence rules visually.
                            Powered by{' '}
                            <span className="text-indigo-400 font-semibold">react-advanced-rrule-generator</span>.
                        </p>
                    </header>

                    {/* ── The package component, fully wired ── */}
                    <RRuleGenerator
                        onChange={(newRrule) => setRrule(newRrule)}
                        classNames={CN}
                        components={{
                            FrequencySelect: CustomFrequencySelect,
                            DayCheckbox: CustomDayCheckbox,
                        }}
                    />

                    <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] pt-4">
                        react-advanced-rrule-generator · iCal RFC 5545
                    </p>
                </div>

                {/* ── Right: Preview ─── */}
                <div className="lg:col-span-5 bg-black/40 border-l border-white/[0.05] p-8 lg:p-12 flex flex-col justify-center gap-8">

                    <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.05] rounded-full border border-white/[0.08]">
                            <div className={`w-2 h-2 rounded-full transition-colors ${rrule ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                                {rrule ? 'Valid rule' : 'Pending'}
                            </span>
                        </div>
                        <div className="px-3 py-1.5 bg-white/[0.05] rounded-full border border-white/[0.08]">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                Format: <span className="text-indigo-400">iCal</span>
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Live RRule String</p>
                        <div className="relative group">
                            <div className="min-h-[72px] p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center">
                                {rrule ? (
                                    <span className="font-mono text-sm text-indigo-300 break-all leading-relaxed select-all">
                                        {rrule}
                                    </span>
                                ) : (
                                    <span className="text-white/20 text-sm italic">Configure a rule on the left…</span>
                                )}
                            </div>
                            {rrule && (
                                <button
                                    type="button"
                                    onClick={copy}
                                    className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/50 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    {copied ? '✓ Copied' : 'Copy'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Integration Snippet</p>
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                            <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">{
                                `import { RRuleGenerator } from
  'react-advanced-rrule-generator';

<RRuleGenerator
  onChange={(r) => console.log(r)}
  classNames={CN}
  components={{
    FrequencySelect: MyFreqBtn,
    DayCheckbox: MyDayPill,
  }}
/>`
                            }</pre>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ChronosEngine;