import React, { useEffect, useRef } from 'react';
import { LessonSegment } from '../types';
import { SubjectVisualizer } from './SubjectVisualizer';
import katex from 'katex';
import { BookOpen, Sparkles, CheckCircle2, Bookmark, Download, Lightbulb } from 'lucide-react';

interface SmartWhiteboardProps {
  segment: LessonSegment;
  totalSegments: number;
  currentSegmentIndex: number;
  onNextSegment: () => void;
  onPrevSegment: () => void;
  topic: string;
}

export const SmartWhiteboard: React.FC<SmartWhiteboardProps> = ({
  segment,
  totalSegments,
  currentSegmentIndex,
  onNextSegment,
  onPrevSegment,
  topic
}) => {
  const equationsContainerRef = useRef<HTMLDivElement | null>(null);

  // Render LaTeX equations via KaTeX safely
  useEffect(() => {
    if (!equationsContainerRef.current || !segment.latexEquations) return;
    equationsContainerRef.current.innerHTML = '';

    segment.latexEquations.forEach((latexStr) => {
      const eqDiv = document.createElement('div');
      eqDiv.className = 'py-2 px-3 bg-slate-900/80 border border-slate-800 rounded-xl my-1.5 overflow-x-auto text-sky-300 text-center font-serif text-sm shadow-sm';
      try {
        katex.render(latexStr, eqDiv, {
          throwOnError: false,
          displayMode: true
        });
      } catch (err) {
        eqDiv.textContent = latexStr;
      }
      equationsContainerRef.current?.appendChild(eqDiv);
    });
  }, [segment]);

  return (
    <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md flex flex-col justify-between overflow-hidden">
      {/* Top Blackboard Header */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Lesson Step {currentSegmentIndex + 1} of {totalSegments}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-xs sm:max-w-md">
              {topic}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Interactive Whiteboard</span>
          </div>
        </div>

        {/* Segment Title */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-2">
          {segment.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mb-4 leading-relaxed font-normal">
          {segment.summary}
        </p>

        {/* Live Handwritten Chalkboard Notes & KaTeX */}
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 mb-4 shadow-inner relative overflow-hidden">
          {/* Subtle Chalkboard Texture Accent */}
          <div className="absolute top-2 right-3 text-[11px] font-mono text-slate-600 uppercase tracking-widest pointer-events-none">
            Smart Whiteboard
          </div>

          <div className="space-y-2.5">
            {segment.whiteboardNotes.map((note, idx) => (
              <div key={idx} className="flex items-start gap-2.5 group">
                <span className="text-amber-400 font-bold text-sm leading-5">✦</span>
                <p className="text-sm text-slate-200 font-chalk text-base tracking-wide leading-snug">
                  {note}
                </p>
              </div>
            ))}
          </div>

          {/* Rendered Math Equations */}
          {segment.latexEquations && segment.latexEquations.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Formal Mathematical Derivation:
              </span>
              <div ref={equationsContainerRef} className="space-y-1" />
            </div>
          )}

          {/* Code snippet if present */}
          {segment.codeSnippet && (
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block mb-1">
                Syntactic Structure:
              </span>
              <pre className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto whitespace-pre">
                {segment.codeSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Interactive Subject-Aware Visualizer Widget */}
        {segment.visualType !== 'none' && (
          <div className="my-4">
            <SubjectVisualizer
              visualType={segment.visualType}
              visualData={segment.visualData}
            />
          </div>
        )}

        {/* Core Takeaway Box */}
        <div className="bg-brand-950/40 border border-brand-500/30 rounded-xl p-3.5 flex items-start gap-3 shadow-sm">
          <Lightbulb className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-brand-300 uppercase tracking-wide block">
              Core Pedagogical Insight
            </span>
            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed">
              {segment.keyTakeaway}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-4">
        <button
          onClick={onPrevSegment}
          disabled={currentSegmentIndex === 0}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Previous Concept
        </button>

        {/* Segment Progress Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSegments }).map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentSegmentIndex
                  ? 'w-6 bg-brand-500 shadow-sm shadow-brand-500/50'
                  : i < currentSegmentIndex
                  ? 'w-2 bg-emerald-500'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onNextSegment}
          disabled={currentSegmentIndex === totalSegments - 1}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow transition"
        >
          Next Concept →
        </button>
      </div>
    </div>
  );
};
