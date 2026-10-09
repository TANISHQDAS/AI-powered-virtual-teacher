import React, { useState, useEffect } from 'react';
import { TeacherPersona } from '../types';
import { voiceService, VoiceState } from '../services/voiceService';
import { Volume2, VolumeX, Mic, Sparkles, Brain, Award, RefreshCw, MessageSquare } from 'lucide-react';

interface TeacherAvatarProps {
  teacher: TeacherPersona;
  emotionState?: 'explaining' | 'listening' | 'thinking' | 'celebrating' | 're-explaining';
  onInterrupted?: () => void;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  teacher,
  emotionState = 'explaining',
  onInterrupted
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [speechVolume, setSpeechVolume] = useState<number>(0);
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Subscribe to voice synthesis & recognition events
  useEffect(() => {
    const unsubState = voiceService.subscribeState((state) => {
      setVoiceState(state);
    });

    const unsubVol = voiceService.subscribeVolume((vol) => {
      setSpeechVolume(vol);
    });

    // Natural human blinking loop (every 3.5 to 5 seconds)
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4000);

    return () => {
      unsubState();
      unsubVol();
      clearInterval(blinkInterval);
    };
  }, []);

  const effectiveState = voiceState === 'listening' ? 'listening' : emotionState;

  // Mouth openness based on speech volume
  const mouthScaleY = voiceState === 'speaking' ? Math.max(0.2, Math.min(1.8, 0.4 + speechVolume * 1.6)) : 0.2;

  // Avatar specific colors
  const avatarThemes = {
    priya: {
      accent: 'from-amber-500/20 to-rose-500/20',
      border: 'border-amber-400/40',
      glow: 'shadow-amber-500/20',
      sareeColor: '#b91c1c',
      hairColor: '#1c1917',
      skinColor: '#fcd34d'
    },
    alan: {
      accent: 'from-sky-500/20 to-blue-500/20',
      border: 'border-sky-400/40',
      glow: 'shadow-sky-500/20',
      sareeColor: '#1e3a8a',
      hairColor: '#64748b',
      skinColor: '#fed7aa'
    },
    maya: {
      accent: 'from-purple-500/20 to-indigo-500/20',
      border: 'border-purple-400/40',
      glow: 'shadow-purple-500/20',
      sareeColor: '#4f46e5',
      hairColor: '#0f172a',
      skinColor: '#fbcfe8'
    },
    arjun: {
      accent: 'from-emerald-500/20 to-teal-500/20',
      border: 'border-emerald-400/40',
      glow: 'shadow-emerald-500/20',
      sareeColor: '#065f46',
      hairColor: '#292524',
      skinColor: '#fdba74'
    }
  };

  const theme = avatarThemes[teacher.avatarId] || avatarThemes.priya;

  return (
    <div className="relative flex flex-col items-center">
      {/* Dynamic Aura Glow around Avatar */}
      <div
        className={`absolute -inset-2 rounded-3xl bg-gradient-to-tr ${theme.accent} blur-xl opacity-70 transition-all duration-700 pointer-events-none ${
          voiceState === 'speaking' ? 'scale-105 opacity-90' : 'scale-100 opacity-50'
        }`}
      />

      {/* Main Avatar Video Frame */}
      <div
        className={`relative w-48 h-56 sm:w-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border-2 ${theme.border} shadow-2xl ${theme.glow} flex flex-col items-center justify-end transition-all`}
      >
        {/* State Badge Top-Left */}
        <div className="absolute top-2.5 left-2.5 z-20">
          {effectiveState === 'explaining' && (
            <div className="flex items-center gap-1.5 bg-slate-950/80 border border-brand-400/40 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-brand-300 shadow">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
              <span>Teaching</span>
            </div>
          )}
          {effectiveState === 'listening' && (
            <div className="flex items-center gap-1.5 bg-rose-950/80 border border-rose-400/50 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-rose-300 shadow animate-pulse">
              <Mic className="w-3 h-3 text-rose-400" />
              <span>Listening to You</span>
            </div>
          )}
          {effectiveState === 'celebrating' && (
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-400/50 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-emerald-300 shadow">
              <Award className="w-3 h-3 text-emerald-400" />
              <span>Great Job!</span>
            </div>
          )}
          {effectiveState === 're-explaining' && (
            <div className="flex items-center gap-1.5 bg-amber-950/80 border border-amber-400/50 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-amber-300 shadow">
              <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />
              <span>New Analogy</span>
            </div>
          )}
          {effectiveState === 'thinking' && (
            <div className="flex items-center gap-1.5 bg-indigo-950/80 border border-indigo-400/50 backdrop-blur px-2.5 py-1 rounded-full text-[11px] font-semibold text-indigo-300 shadow">
              <Brain className="w-3 h-3 text-indigo-400 animate-pulse" />
              <span>Analyzing</span>
            </div>
          )}
        </div>

        {/* Live Audio Waves (while speaking) */}
        {voiceState === 'speaking' && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-0.5 bg-slate-950/80 border border-slate-700/80 px-2 py-1 rounded-full">
            <span className="w-0.5 bg-brand-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
            <span className="w-0.5 bg-brand-400 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms' }} />
            <span className="w-0.5 bg-brand-400 rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
          </div>
        )}

        {/* Human-Like Vector Avatar Graphics with Real-time Lip-Sync */}
        <div
          className={`w-full h-full flex flex-col items-center justify-end transition-transform duration-700 ${
            effectiveState === 'listening' ? 'rotate-1' : ''
          }`}
        >
          <svg viewBox="0 0 200 240" className="w-full h-full">
            {/* Background Studio Lighting Gradient */}
            <defs>
              <radialGradient id="studioLight" cx="50%" cy="30%" r="60%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0b0f19" />
              </radialGradient>
            </defs>
            <rect width="200" height="240" fill="url(#studioLight)" />

            {/* Subtle classroom blackboard line behind */}
            <line x1="10" y1="170" x2="190" y2="170" stroke="#334155" strokeWidth="1" opacity="0.4" />

            {/* Torso / Clothes / Blazer */}
            <path
              d="M 30 240 C 30 190 70 170 100 170 C 130 170 170 190 170 240 Z"
              fill={theme.sareeColor}
              stroke="#0f172a"
              strokeWidth="2"
            />
            {/* Collar / Lapel */}
            <path d="M 85 170 L 100 195 L 115 170 Z" fill="#f8fafc" />

            {/* Neck */}
            <rect x="88" y="140" width="24" height="25" fill="#f59e0b" rx="4" />

            {/* Head Silhouette */}
            <ellipse cx="100" cy="115" rx="38" ry="46" fill="#f59e0b" />

            {/* Hair Styling according to Persona */}
            {teacher.avatarId === 'priya' && (
              <g>
                <path d="M 58 115 C 58 75 75 60 100 60 C 125 60 142 75 142 115 C 135 90 120 75 100 75 C 80 75 65 90 58 115 Z" fill="#18181b" />
                {/* Traditional Bindi */}
                <circle cx="100" cy="100" r="2" fill="#ef4444" />
              </g>
            )}
            {teacher.avatarId === 'alan' && (
              <g>
                <path d="M 60 100 C 60 68 76 60 100 60 C 124 60 140 68 140 100 C 130 75 118 70 100 70 C 82 70 70 75 60 100 Z" fill="#64748b" />
                {/* Professor Spectacles */}
                <rect x="74" y="103" width="22" height="14" rx="3" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                <rect x="104" y="103" width="22" height="14" rx="3" fill="none" stroke="#e2e8f0" strokeWidth="2" />
                <line x1="96" y1="110" x2="104" y2="110" stroke="#e2e8f0" strokeWidth="2" />
              </g>
            )}
            {teacher.avatarId === 'maya' && (
              <g>
                <path d="M 58 115 C 58 65 72 58 100 58 C 128 58 142 65 142 115 C 132 80 115 72 100 72 C 85 72 68 80 58 115 Z" fill="#09090b" />
                {/* Tech Headset Band */}
                <path d="M 58 110 C 58 70 142 70 142 110" fill="none" stroke="#818cf8" strokeWidth="3" />
                <circle cx="58" cy="110" r="6" fill="#4f46e5" />
                <circle cx="142" cy="110" r="6" fill="#4f46e5" />
              </g>
            )}
            {teacher.avatarId === 'arjun' && (
              <g>
                <path d="M 62 100 C 62 65 78 60 100 60 C 122 60 138 65 138 100 C 128 72 115 68 100 68 C 85 68 72 72 62 100 Z" fill="#27272a" />
                {/* Neat scholarly beard */}
                <path d="M 80 135 C 80 155 120 155 120 135 Z" fill="#27272a" opacity="0.6" />
              </g>
            )}

            {/* Eyebrows */}
            <path d="M 75 96 Q 85 92 95 96" stroke="#262626" strokeWidth="2.5" fill="none" />
            <path d="M 105 96 Q 115 92 125 96" stroke="#262626" strokeWidth="2.5" fill="none" />

            {/* Eyes (with blinking logic) */}
            {isBlinking ? (
              <g>
                <line x1="77" y1="108" x2="93" y2="108" stroke="#1c1917" strokeWidth="2" />
                <line x1="107" y1="108" x2="123" y2="108" stroke="#1c1917" strokeWidth="2" />
              </g>
            ) : (
              <g>
                {/* Left Eye */}
                <ellipse cx="85" cy="108" rx="7" ry="5" fill="#f8fafc" />
                <circle cx="85" cy="108" r="3" fill="#18181b" />
                <circle cx="86" cy="106" r="1" fill="#ffffff" />

                {/* Right Eye */}
                <ellipse cx="115" cy="108" rx="7" ry="5" fill="#f8fafc" />
                <circle cx="115" cy="108" r="3" fill="#18181b" />
                <circle cx="116" cy="106" r="1" fill="#ffffff" />
              </g>
            )}

            {/* Nose */}
            <path d="M 100 110 L 98 122 L 103 122" stroke="#d97706" strokeWidth="2" fill="none" />

            {/* Mouth with Dynamic Lip-Sync Motion */}
            {voiceState === 'speaking' ? (
              <g transform={`translate(0, ${136 * (1 - mouthScaleY)})`}>
                <ellipse
                  cx="100"
                  cy="136"
                  rx="9"
                  ry={Math.max(2, 6 * mouthScaleY)}
                  fill="#881337"
                  stroke="#4c0519"
                  strokeWidth="1.5"
                />
                {/* Teeth visibility during wide phonemes */}
                {mouthScaleY > 0.8 && (
                  <rect x="94" y="133" width="12" height="2" fill="#ffffff" rx="1" />
                )}
              </g>
            ) : (
              /* Resting Smile */
              <path
                d="M 92 136 Q 100 141 108 136"
                stroke="#881337"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </div>

        {/* Video Overlay Name Plate */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-2 text-center">
          <div className="text-xs font-bold text-slate-100 flex items-center justify-center gap-1">
            <span>{teacher.name}</span>
          </div>
          <p className="text-[10px] text-slate-400 truncate">{teacher.specialty}</p>
        </div>
      </div>
    </div>
  );
};
