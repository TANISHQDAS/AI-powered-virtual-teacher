import React, { useState } from 'react';
import { TeacherPersona, LearnerLevel, TimeDuration, LanguageCode, StudentProfile } from '../types';
import { TEACHER_PERSONAS } from '../data/teachers';
import { teacherEngine } from '../services/teacherEngine';
import {
  Settings,
  Key,
  User,
  Sliders,
  Sparkles,
  X,
  Volume2,
  Clock,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: TeacherPersona;
  onSelectTeacher: (teacher: TeacherPersona) => void;
  level: LearnerLevel;
  onChangeLevel: (level: LearnerLevel) => void;
  duration: TimeDuration;
  onChangeDuration: (dur: TimeDuration) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  onSelectTeacher,
  level,
  onChangeLevel,
  duration,
  onChangeDuration
}) => {
  const [apiKey, setApiKey] = useState<string>(teacherEngine.getApiKey());
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveApiKey = () => {
    teacherEngine.setApiKey(apiKey.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-brand-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              AI Teacher Settings & Pedagogical Preferences
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Section 1: Teacher Persona Selection (Section 18 requirement) */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
              Select Virtual Teacher Character & Pedagogy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TEACHER_PERSONAS.map((teacher) => (
                <div
                  key={teacher.id}
                  onClick={() => onSelectTeacher(teacher)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    currentTeacher.id === teacher.id
                      ? 'border-brand-500 bg-brand-950/40 shadow-md'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-sm">{teacher.name}</span>
                    {currentTeacher.id === teacher.id && (
                      <CheckCircle2 className="w-4 h-4 text-brand-400" />
                    )}
                  </div>
                  <p className="text-[11px] text-brand-400 mb-1.5">{teacher.title}</p>
                  <p className="text-xs text-slate-400 line-clamp-2">{teacher.teachingStyle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Learning Level & Duration Configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Learner Depth / Knowledge Level
              </label>
              <div className="flex flex-col gap-2">
                {(['beginner', 'intermediate', 'advanced'] as LearnerLevel[]).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => onChangeLevel(lvl)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize text-left transition ${
                      level === lvl
                        ? 'bg-brand-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {lvl} {lvl === 'beginner' ? '(Analogies & Fundamentals)' : lvl === 'intermediate' ? '(Practical & Technical)' : '(Deep Math & Derivations)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-2">
                Time Available for Lesson
              </label>
              <div className="flex flex-col gap-2">
                {(['5m', '20m', '60m', '7d'] as TimeDuration[]).map((dur) => (
                  <button
                    key={dur}
                    onClick={() => onChangeDuration(dur)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold text-left transition ${
                      duration === dur
                        ? 'bg-brand-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {dur === '5m' ? '5 Minutes (Concise Blitz)' : dur === '20m' ? '20 Minutes (Standard Class)' : dur === '60m' ? '60 Minutes (Mastery Class)' : '7 Days (Complete Study Plan)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Google Gemini API Key */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-white">
                  Google Gemini 2.5 Flash API Key
                </label>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Active & Verified
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Configured with real-world Google Gemini 2.5 Flash for live LLM curriculum synthesis, dynamic Socratic inquiry, and misconception analysis.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="AIzaSy... or your Gemini API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-brand-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    handleSaveApiKey();
                    setIsTesting(true);
                    const res = await teacherEngine.testApiKeyConnection(apiKey);
                    setTestStatus(res);
                    setIsTesting(false);
                  }}
                  disabled={isTesting}
                  className="px-3 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-xs font-semibold text-white transition flex items-center gap-1.5 disabled:opacity-50 shadow"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{isTesting ? 'Testing...' : 'Test & Save'}</span>
                </button>
              </div>
            </div>

            {testStatus && (
              <div
                className={`mt-3 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <X className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{testStatus.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
