/**
 * ChronosEngine.jsx
 */

import React, { useState } from 'react';
import { RRuleGenerator } from 'react-advanced-rrule-generator';
// Only needed if you are NOT using Tailwind globally:
// import 'react-advanced-rrule-generator/dist/style.css';

// ─────────────────────────────────────────────────────────────────────────────
// classNames — every key the package supports, all overridden for dark theme.
// Static const at module top-level so Tailwind JIT scanner finds every class.
// ─────────────────────────────────────────────────────────────────────────────

const CN = {
    // Root wrapper — appended to `.rrule-generator`. The base white-card styles
    // from style.css are reset via the global CSS rule documented in the header.
    container: 'bg-transparent border-0 shadow-none p-0',

    // Each logical form section (Repeat / Interval / On Days / End)
    section: [
        'mb-4 p-5 rounded-2xl transition-colors duration-200',
        'bg-white/[0.03] border border-white/[0.07]',
        'hover:border-indigo-500/30',
    ].join(' '),

    // Section heading labels
    label: 'block mb-3 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500',

    // Base class applied to ALL buttons (freq + end-mode + etc.)
    button: [
        'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider',
        'border-2 transition-all duration-200 select-none',
    ].join(' '),

    // Applied ON TOP of `button` when the button is the active/selected state
    buttonActive: 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/25 scale-[1.03]',

    // Applied ON TOP of `button` when the button is inactive
    buttonInactive: [
        'bg-white/[0.04] border-white/[0.08] text-slate-400',
        'hover:border-indigo-500/40 hover:text-slate-200 hover:bg-white/[0.07]',
    ].join(' '),

    // Number and date inputs
    input: [
        'px-3 py-2 rounded-xl text-sm font-bold text-center text-white',
        'bg-slate-900 border border-white/[0.10]',
        'focus:border-indigo-500 focus:outline-none',
        'transition-colors',
        '[appearance:textfield]',
        '[&::-webkit-inner-spin-button]:appearance-none',
        '[&::-webkit-outer-spin-button]:appearance-none',
    ].join(' '),

    // Preview panel container (right half of the internal 2-col grid)
    previewContainer: [
        'h-full p-6 rounded-2xl flex flex-col gap-4',
        'bg-white/[0.03] border border-white/[0.07]',
    ].join(' '),

    // "Preview" heading inside preview panel
    previewTitle: 'text-[9px] font-black uppercase tracking-[0.4em] text-white/20',

    // Human-readable recurrence text
    previewText: 'text-base font-bold text-white leading-snug tracking-tight capitalize',

    // RRULE code string
    previewCode: [
        'mt-2 p-4 rounded-xl',
        'font-mono text-[11px] text-indigo-300 break-all select-all leading-relaxed',
        'bg-indigo-500/[0.08] border border-indigo-500/[0.12]',
    ].join(' '),
};

// ─────────────────────────────────────────────────────────────────────────────
// Custom DayCheckbox
// Props: { label: string, checked: boolean, onChange: (checked: boolean) => void }
// ─────────────────────────────────────────────────────────────────────────────

const CustomDayCheckbox = ({ label, checked, onChange }) => (
    <button
        type="button"
        onClick={() => onChange(!checked)}
        title={label}
        className={
            checked
                ? 'w-10 h-10 rounded-full flex items-center justify-center select-none text-[11px] font-black border-2 transition-all duration-150 bg-indigo-600 border-indigo-500 text-white scale-110 shadow-md shadow-indigo-600/40'
                : 'w-10 h-10 rounded-full flex items-center justify-center select-none text-[11px] font-black border-2 transition-all duration-150 bg-white/[0.04] border-white/[0.10] text-slate-500 hover:border-indigo-500/40 hover:text-slate-200'
        }
    >
        {label.slice(0, 2)}
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Custom FrequencySelect
// Props: { value: number, label: string, selected: boolean, onClick: (value) => void }
// ─────────────────────────────────────────────────────────────────────────────

const CustomFrequencySelect = ({ value, label, selected, onClick }) => (
    <button
        type="button"
        onClick={() => onClick(value)}
        className={
            selected
                ? 'relative flex items-center justify-center px-5 py-2.5 rounded-xl select-none text-[11px] font-black uppercase tracking-wider border-2 transition-all duration-200 bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30 scale-[1.04]'
                : 'relative flex items-center justify-center px-5 py-2.5 rounded-xl select-none text-[11px] font-black uppercase tracking-wider border-2 transition-all duration-200 bg-white/[0.04] border-white/[0.08] text-slate-500 hover:border-indigo-500/40 hover:text-slate-200 hover:bg-white/[0.07]'
        }
    >
        {selected && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-indigo-400 border-2 border-slate-950" />
        )}
        {label}
    </button>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────────────────────────────────────

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

            {/* Ambient background glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] bg-indigo-600/[0.07] rounded-full blur-[140px]" />
                <div className="absolute -bottom-32 right-1/4 w-[500px] h-[500px] bg-violet-600/[0.05] rounded-full blur-[120px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-full bg-white/[0.02]" />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 space-y-10">

                {/* ── Header ── */}
                <header className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/40 shrink-0">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.35em] mb-0.5">Chronos Engine</p>
                            <h1 className="text-3xl font-black tracking-tight leading-none text-white">Recurrence Designer</h1>
                        </div>
                    </div>

                    {/* Live status badge */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.07] mt-1">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-500 ${rrule ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-700'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                            {rrule ? 'Valid Rule' : 'Pending'}
                        </span>
                    </div>
                </header>

                {/* ── Main grid: generator + output panel ── */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Generator takes 2/3 width */}
                    <div className="xl:col-span-2">
                        <RRuleGenerator
                            onChange={setRrule}
                            classNames={CN}
                            components={{
                                DayCheckbox: CustomDayCheckbox,
                                FrequencySelect: CustomFrequencySelect,
                            }}
                        />
                    </div>

                    {/* Output panel — 1/3 width, sticky */}
                    <div className="xl:col-span-1 space-y-4 xl:sticky xl:top-6 self-start">

                        {/* RRule string output */}
                        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/[0.07] space-y-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Live RRule String</p>

                            <div className="relative group min-h-[60px] flex items-center">
                                {rrule ? (
                                    <>
                                        <span className="font-mono text-sm text-indigo-300 break-all leading-relaxed select-all pr-12">
                                            {rrule}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={copy}
                                            className="absolute top-0 right-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-600/25 border border-indigo-500/25 text-indigo-300 hover:bg-indigo-600/40 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            {copied ? '✓' : 'Copy'}
                                        </button>
                                    </>
                                ) : (
                                    <span className="text-white/20 text-sm italic">Configure a rule to see output…</span>
                                )}
                            </div>
                        </div>

                        {/* Format badges */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                { label: 'Format', value: 'iCal', color: 'text-indigo-400' },
                                { label: 'Spec', value: 'RFC 5545', color: 'text-violet-400' },
                                { label: 'Pkg', value: 'v0.1.0', color: 'text-slate-400' },
                            ].map(b => (
                                <div key={b.label} className="px-3 py-1.5 bg-white/[0.04] rounded-full border border-white/[0.07]">
                                    <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                                        {b.label}: <span className={`${b.color} font-black`}>{b.value}</span>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Integration snippet */}
                        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-2">
                            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/15">Quick Integration</p>
                            <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed">{
                                `import { RRuleGenerator }
  from 'react-advanced-rrule-generator';

<RRuleGenerator
  onChange={setRrule}
  classNames={CN}
  components={{
    DayCheckbox: MyDay,
    FrequencySelect: MyFreq,
  }}
/>`
                            }</pre>
                        </div>

                    </div>
                </div>

                {/* Footer */}
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em]">
                    react-advanced-rrule-generator · MIT · omkar077
                </p>
            </div>
        </div>
    );
};

export default ChronosEngine;