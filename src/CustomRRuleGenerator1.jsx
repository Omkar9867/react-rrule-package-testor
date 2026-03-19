/**
 * ChronosEngine.jsx
 *
 * A fully self-contained RRule generator UI built with React + rrule.js.
 * NO external rrule form library is used — we own the entire UI and wire
 * directly into rrule.js for string generation.
 *
 * Install deps:
 *   npm install rrule
 *
 * Usage:
 *   import ChronosEngine from './ChronosEngine';
 *   <ChronosEngine onChange={(rruleString) => console.log(rruleString)} />
 */

import React, { useState, useEffect, useCallback } from 'react';
import { RRule } from 'rrule';

// ─── Frequency constants ────────────────────────────────────────────────────

const FREQ_OPTIONS = [
  { value: RRule.DAILY, label: 'Daily', icon: '☀' },
  { value: RRule.WEEKLY, label: 'Weekly', icon: '📅' },
  { value: RRule.MONTHLY, label: 'Monthly', icon: '🗓' },
  { value: RRule.YEARLY, label: 'Yearly', icon: '🏔' },
];

const WEEKDAYS = [
  { value: RRule.MO, label: 'Monday', short: 'Mo' },
  { value: RRule.TU, label: 'Tuesday', short: 'Tu' },
  { value: RRule.WE, label: 'Wednesday', short: 'We' },
  { value: RRule.TH, label: 'Thursday', short: 'Th' },
  { value: RRule.FR, label: 'Friday', short: 'Fr' },
  { value: RRule.SA, label: 'Saturday', short: 'Sa' },
  { value: RRule.SU, label: 'Sunday', short: 'Su' },
];

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const ORDINALS = [
  { value: 1, label: '1st' },
  { value: 2, label: '2nd' },
  { value: 3, label: '3rd' },
  { value: 4, label: '4th' },
  { value: -1, label: 'Last' },
];

// ─── Utility: build RRule string from state ──────────────────────────────────

function buildRRule(state) {
  try {
    const opts = {
      freq: state.freq,
      interval: Math.max(1, parseInt(state.interval) || 1),
    };

    if (state.freq === RRule.WEEKLY && state.byweekday.length > 0) {
      opts.byweekday = state.byweekday;
    }

    if (state.freq === RRule.MONTHLY) {
      if (state.monthlyMode === 'bymonthday') {
        opts.bymonthday = parseInt(state.bymonthday) || 1;
      } else {
        opts.byweekday = state.monthlyByWeekday;
        opts.bysetpos = state.monthlyBySetPos;
      }
    }

    if (state.freq === RRule.YEARLY) {
      opts.bymonth = state.bymonth;
      opts.bymonthday = parseInt(state.byYearDay) || 1;
    }

    if (state.endMode === 'count') {
      opts.count = Math.max(1, parseInt(state.count) || 1);
    } else if (state.endMode === 'until' && state.until) {
      opts.until = new Date(state.until);
    }

    const rule = new RRule(opts);
    return rule.toString();
  } catch {
    return '';
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const FreqButton = ({ option, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(option.value)}
    className={`
      relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl text-xs font-bold
      tracking-wider uppercase transition-all duration-200 border-2 select-none
      ${selected
        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-[1.03]'
        : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/40 hover:text-slate-200 hover:bg-white/8'
      }
    `}
  >
    <span className="text-base leading-none">{option.icon}</span>
    <span>{option.label}</span>
    {selected && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-400 rounded-full border-2 border-slate-950" />
    )}
  </button>
);

const DayPill = ({ day, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(day.value)}
    title={day.label}
    className={`
      w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black
      transition-all duration-150 border-2 select-none
      ${selected
        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/40 scale-110'
        : 'bg-white/5 border-white/10 text-slate-500 hover:border-indigo-500/30 hover:text-slate-300'
      }
    `}
  >
    {day.short.slice(0, 2)}
  </button>
);

const NumberInput = ({ value, onChange, min = 1, max = 999, className = '' }) => (
  <input
    type="number"
    min={min}
    max={max}
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`
      w-20 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-bold
      text-sm text-center focus:border-indigo-500 focus:outline-none focus:bg-white/8
      transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none
      ${className}
    `}
  />
);

const SelectInput = ({ value, onChange, options, className = '' }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    className={`
      px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white font-semibold
      text-sm focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer
      ${className}
    `}
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>{opt.label}</option>
    ))}
  </select>
);

const SectionCard = ({ title, subtitle, icon, children }) => (
  <div className="rounded-2xl border border-white/8 bg-white/3 p-6 space-y-5 hover:border-indigo-500/20 transition-colors duration-300">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

const RadioPill = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-2 cursor-pointer group">
    <div
      onClick={onChange}
      className={`
        w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer
        ${checked ? 'border-indigo-500 bg-indigo-600' : 'border-white/20 group-hover:border-indigo-500/50'}
      `}
    >
      {checked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    <span className={`text-sm font-medium transition-colors ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
      {label}
    </span>
  </label>
);

// ─── Main Component ──────────────────────────────────────────────────────────

const ChronosEngine = ({ onChange }) => {
  const [state, setState] = useState({
    freq: RRule.WEEKLY,
    interval: 1,
    byweekday: [RRule.MO],
    monthlyMode: 'bymonthday',   // 'bymonthday' | 'bysetpos'
    bymonthday: 1,
    monthlyByWeekday: RRule.MO,
    monthlyBySetPos: 1,
    bymonth: 1,
    byYearDay: 1,
    endMode: 'never',             // 'never' | 'count' | 'until'
    count: 10,
    until: '',
  });

  const [rruleString, setRruleString] = useState('');
  const [copied, setCopied] = useState(false);

  const update = useCallback((patch) => {
    setState(prev => ({ ...prev, ...patch }));
  }, []);

  useEffect(() => {
    const str = buildRRule(state);
    setRruleString(str);
    if (onChange) onChange(str);
  }, [state, onChange]);

  const toggleWeekday = (day) => {
    const cur = state.byweekday;
    const exists = cur.some(d => d.weekday === day.weekday);
    const next = exists
      ? cur.filter(d => d.weekday !== day.weekday)
      : [...cur, day];
    update({ byweekday: next.length > 0 ? next : [day] });
  };

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(rruleString).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Human-readable description from RRule
  let humanText = '';
  try {
    if (rruleString) {
      humanText = RRule.fromString(rruleString).toText();
    }
  } catch { }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/6 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 min-h-screen">

        {/* ── Left: Control Panel ─────────────────────────────── */}
        <div className="lg:col-span-7 p-8 lg:p-14 overflow-y-auto space-y-8">

          {/* Header */}
          <header className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/40">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.35em]">Chronos Engine</div>
                <h1 className="text-2xl font-black tracking-tight leading-none text-white">Recurrence Designer</h1>
              </div>
            </div>
            <p className="text-sm text-slate-500 max-w-sm font-medium pl-[52px]">
              Build RFC 5545–compliant iCal recurrence rules with full visual control.
            </p>
          </header>

          {/* ── 1. Frequency ── */}
          <SectionCard title="Frequency" subtitle="How often the event repeats" icon="⚡">
            <div className="grid grid-cols-4 gap-2">
              {FREQ_OPTIONS.map(opt => (
                <FreqButton
                  key={opt.value}
                  option={opt}
                  selected={state.freq === opt.value}
                  onClick={(v) => update({ freq: v })}
                />
              ))}
            </div>
          </SectionCard>

          {/* ── 2. Interval ── */}
          <SectionCard title="Interval" subtitle="Repeat every N units" icon="↔">
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 font-medium">Every</span>
              <NumberInput
                value={state.interval}
                onChange={v => update({ interval: v })}
                min={1} max={999}
              />
              <span className="text-sm text-slate-400 font-medium">
                {FREQ_OPTIONS.find(f => f.value === state.freq)?.label.toLowerCase()}
                {state.interval > 1 ? 's' : ''}
              </span>
            </div>
          </SectionCard>

          {/* ── 3. Weekly: days ── */}
          {state.freq === RRule.WEEKLY && (
            <SectionCard title="Days of Week" subtitle="Select which days to repeat on" icon="🗓">
              <div className="flex flex-wrap gap-2">
                {WEEKDAYS.map(day => (
                  <DayPill
                    key={day.short}
                    day={day}
                    selected={state.byweekday.some(d => d.weekday === day.value.weekday)}
                    onClick={toggleWeekday}
                  />
                ))}
              </div>
            </SectionCard>
          )}

          {/* ── 4. Monthly options ── */}
          {state.freq === RRule.MONTHLY && (
            <SectionCard title="Monthly Rule" subtitle="When in the month it repeats" icon="📆">
              <div className="space-y-4">
                <div className="flex gap-4">
                  <RadioPill
                    checked={state.monthlyMode === 'bymonthday'}
                    onChange={() => update({ monthlyMode: 'bymonthday' })}
                    label="Day of month"
                  />
                  <RadioPill
                    checked={state.monthlyMode === 'bysetpos'}
                    onChange={() => update({ monthlyMode: 'bysetpos' })}
                    label="Day of week"
                  />
                </div>

                {state.monthlyMode === 'bymonthday' ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">On day</span>
                    <NumberInput
                      value={state.bymonthday}
                      onChange={v => update({ bymonthday: v })}
                      min={1} max={31}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm text-slate-400">On the</span>
                    <SelectInput
                      value={state.monthlyBySetPos}
                      onChange={v => update({ monthlyBySetPos: parseInt(v) })}
                      options={ORDINALS}
                    />
                    <SelectInput
                      value={state.monthlyByWeekday.weekday}
                      onChange={v => update({ monthlyByWeekday: WEEKDAYS[parseInt(v)].value })}
                      options={WEEKDAYS.map((d, i) => ({ value: i, label: d.label }))}
                    />
                  </div>
                )}
              </div>
            </SectionCard>
          )}

          {/* ── 5. Yearly options ── */}
          {state.freq === RRule.YEARLY && (
            <SectionCard title="Yearly Rule" subtitle="Which month and day" icon="🏔">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-slate-400">In</span>
                <SelectInput
                  value={state.bymonth}
                  onChange={v => update({ bymonth: parseInt(v) })}
                  options={MONTHS.map((m, i) => ({ value: i + 1, label: m }))}
                />
                <span className="text-sm text-slate-400">on day</span>
                <NumberInput
                  value={state.byYearDay}
                  onChange={v => update({ byYearDay: v })}
                  min={1} max={31}
                />
              </div>
            </SectionCard>
          )}

          {/* ── 6. End condition ── */}
          <SectionCard title="End Condition" subtitle="When the recurrence stops" icon="🛑">
            <div className="space-y-4">
              <div className="flex gap-6 flex-wrap">
                {['never', 'count', 'until'].map(mode => (
                  <RadioPill
                    key={mode}
                    checked={state.endMode === mode}
                    onChange={() => update({ endMode: mode })}
                    label={{ never: 'Never ends', count: 'After N occurrences', until: 'On date' }[mode]}
                  />
                ))}
              </div>

              {state.endMode === 'count' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">After</span>
                  <NumberInput
                    value={state.count}
                    onChange={v => update({ count: v })}
                    min={1} max={9999}
                  />
                  <span className="text-sm text-slate-400">occurrences</span>
                </div>
              )}

              {state.endMode === 'until' && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400">Until</span>
                  <input
                    type="date"
                    value={state.until}
                    onChange={e => update({ until: e.target.value })}
                    className="px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white text-sm
                               focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer
                               [color-scheme:dark]"
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* Footer */}
          <div className="text-[10px] font-black text-slate-800 uppercase tracking-[0.5em] pt-4">
            Engine Core — Powered by rrule.js
          </div>
        </div>

        {/* ── Right: Preview Panel ──────────────────────────── */}
        <div className="lg:col-span-5 bg-black/40 border-l border-white/5 p-8 lg:p-12 flex flex-col justify-center gap-8">

          {/* Human description card */}
          <div className="space-y-3">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Human Description</div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20">
              <p className="text-lg font-bold text-white leading-snug tracking-tight capitalize">
                {humanText || 'Configure a rule to see a description'}
              </p>
            </div>
          </div>

          {/* Live RRule string card */}
          <div className="space-y-3">
            <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Live RRule String</div>
            <div className="relative group">
              <div className="p-5 rounded-2xl bg-white/5 border border-white/8 font-mono text-sm text-indigo-300 break-all leading-relaxed select-all min-h-[72px] flex items-center">
                {rruleString || (
                  <span className="text-white/20 italic font-sans text-xs">Awaiting configuration…</span>
                )}
              </div>
              {rruleString && (
                <button
                  type="button"
                  onClick={copyToClipboard}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider
                             bg-indigo-600/30 border border-indigo-500/30 text-indigo-300
                             hover:bg-indigo-600/50 transition-all opacity-0 group-hover:opacity-100"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/8">
              <div className={`w-2 h-2 rounded-full ${rruleString ? 'bg-emerald-500' : 'bg-slate-600'}`} />
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                {rruleString ? 'Valid' : 'Pending'}
              </span>
            </div>
            <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/8">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Format: <span className="text-indigo-400">iCal RFC 5545</span>
              </span>
            </div>
            <div className="px-3 py-1.5 bg-white/5 rounded-full border border-white/8">
              <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                Freq: <span className="text-violet-400">
                  {FREQ_OPTIONS.find(f => f.value === state.freq)?.label}
                </span>
              </span>
            </div>
          </div>

          {/* Usage hint */}
          <div className="p-5 rounded-2xl border border-white/5 bg-white/2 space-y-2">
            <div className="text-[9px] font-black text-white/15 uppercase tracking-[0.4em]">Integration</div>
            <pre className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap">
              {`import { RRule } from 'rrule';

const rule = RRule.fromString(
  '${rruleString || 'YOUR_RRULE_STRING'}'
);

// Next 5 occurrences:
rule.all((d, i) => i < 5);`}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChronosEngine;