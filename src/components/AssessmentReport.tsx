import React, { useState, useEffect } from 'react';
import { LessonPlan, DiagnosticAssessment, Flashcard, StudentProfile } from '../types';
import { teacherEngine } from '../services/teacherEngine';
import confetti from 'canvas-confetti';
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  RotateCcw,
  Calendar,
  Layers,
  FileText,
  Download,
  Share2,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface AssessmentReportProps {
  lesson: LessonPlan;
  onRestartLesson: () => void;
  onSelectTopic: (topic: string) => void;
  detectedMisconceptions: string[];
}

export const AssessmentReport: React.FC<AssessmentReportProps> = ({
  lesson,
  onRestartLesson,
  onSelectTopic,
  detectedMisconceptions
}) => {
  // Quiz state
  const [activeTab, setActiveTab] = useState<'quiz' | 'report' | 'flashcards' | 'roadmap'>('quiz');
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Generate quiz questions
  const quizQuestions = [
    {
      id: 'q1',
      question:
        lesson.subject === 'physics'
          ? 'According to Ohm’s Law, what happens to the electric current if resistance is increased while voltage remains constant?'
          : `What is the core driving principle behind ${lesson.topic}?`,
      options:
        lesson.subject === 'physics'
          ? [
              'Current increases proportionally',
              'Current decreases inversely (I = V / R)',
              'Current remains constant',
              'Resistance has no impact on current'
            ]
          : [
              'Continuous equilibrium between drivers and resistances',
              'Operating without boundaries',
              'Maximizing friction',
              'Static unreactive state'
            ],
      correctIndex: lesson.subject === 'physics' ? 1 : 0,
      explanation: 'Ohm’s law dictates an inverse relationship: I = V / R.'
    },
    {
      id: 'q2',
      question:
        lesson.subject === 'physics'
          ? 'What is the SI unit of Electric Potential Difference (Voltage)?'
          : `How should a learner approach new concepts in ${lesson.subject}?`,
      options:
        lesson.subject === 'physics'
          ? ['Ampere (A)', 'Ohm (Ω)', 'Volt (V)', 'Coulomb (C)']
          : ['First-principles reasoning', 'Rote memorization', 'Ignoring foundations', 'Guesswork'],
      correctIndex: lesson.subject === 'physics' ? 2 : 0,
      explanation: 'Potential difference is measured in Volts (V), work done per unit charge (1 V = 1 J/C).'
    },
    {
      id: 'q3',
      question:
        lesson.subject === 'physics'
          ? 'If a wire is replaced with another wire made of the same material but twice as long, its resistance will:'
          : 'Which evaluation metric represents deep conceptual mastery?',
      options:
        lesson.subject === 'physics'
          ? ['Double (R = ρ·l/A)', 'Be cut in half', 'Remain identical', 'Drop to zero']
          : ['Ability to explain with different analogies', 'Speed of repeating text', 'Memorizing slides', 'Ignoring errors'],
      correctIndex: 0,
      explanation: 'Resistance is directly proportional to wire length (l).'
    }
  ];

  // Initialize flashcards
  useEffect(() => {
    const cards = teacherEngine.generateFlashcards(lesson);
    setFlashcards(cards);
  }, [lesson]);

  const handleSelectAnswer = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuizIndex] = optionIndex;
    setSelectedAnswers(newAnswers);

    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
    } else {
      setQuizCompleted(true);
      setActiveTab('report');
      // Fire celebratory confetti if high score!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  // Compile diagnostic report
  const formattedAnswers = quizQuestions.map((q, idx) => ({
    questionIndex: idx,
    selectedIndex: selectedAnswers[idx] ?? -1,
    isCorrect: selectedAnswers[idx] === q.correctIndex
  }));

  const report: DiagnosticAssessment = teacherEngine.generateAssessmentReport({
    lesson,
    quizAnswers: formattedAnswers,
    detectedMisconceptions
  });

  // Download Markdown summary notes
  const handleDownloadNotes = () => {
    const notesContent = `# ${lesson.title}\n\n**Subject:** ${lesson.subject} | **Level:** ${lesson.level} | **Duration:** ${lesson.duration}\n\n## Overview\n${lesson.overview}\n\n## Key Concepts Covered\n${lesson.segments.map(s => `### ${s.title}\n- **Summary:** ${s.summary}\n- **Whiteboard Points:**\n${s.whiteboardNotes.map(n => `  - ${n}`).join('\n')}\n- **Takeaway:** ${s.keyTakeaway}\n`).join('\n')}\n\n## Diagnostic Assessment Result\n- **Score:** ${report.percentage}% (${report.score}/${report.totalQuestions})\n- **Mastered Areas:** ${report.conceptsMastered.join(', ')}\n- **Needs Improvement:** ${report.conceptsNeedingWork.join(', ')}\n- **Recommendation:** ${report.recommendedRevisionAction}\n\nGenerated by GuruAI Virtual Teacher Platform.`;
    const blob = new Blob([notesContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lesson.topic.toLowerCase().replace(/\s+/g, '-')}-study-notes.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
            Comprehensive Assessment & Learning Analytics
          </h2>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'quiz' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lesson Quiz
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'report' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Diagnostic Report
          </button>
          <button
            onClick={() => setActiveTab('flashcards')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'flashcards' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Flashcards ({flashcards.length})
          </button>
          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'roadmap' ? 'bg-brand-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            7-Day Study Plan
          </button>
        </div>
      </div>

      {/* --- TAB 1: QUIZ --- */}
      {activeTab === 'quiz' && (
        <div>
          {!quizCompleted ? (
            <div className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center text-xs text-slate-400 mb-3">
                <span>Question {currentQuizIndex + 1} of {quizQuestions.length}</span>
                <span className="font-mono text-brand-400">Knowledge Verification</span>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-inner mb-5">
                <h3 className="text-base sm:text-lg font-bold text-white mb-6 leading-snug">
                  {quizQuestions[currentQuizIndex].question}
                </h3>

                <div className="space-y-3">
                  {quizQuestions[currentQuizIndex].options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectAnswer(i)}
                      className="w-full text-left p-4 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-brand-950/60 hover:border-brand-500/60 text-slate-200 text-sm font-medium transition shadow-sm flex items-center justify-between group"
                    >
                      <span>{opt}</span>
                      <span className="w-6 h-6 rounded-full border border-slate-700 flex items-center justify-center text-xs text-slate-400 group-hover:border-brand-400 group-hover:text-brand-300">
                        {String.fromCharCode(65 + i)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3 animate-bounce" />
              <h3 className="text-xl font-bold text-white mb-1">Quiz Completed!</h3>
              <p className="text-sm text-slate-300 mb-5">
                Your performance has been analyzed by the diagnostic engine.
              </p>
              <button
                onClick={() => setActiveTab('report')}
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow transition"
              >
                View Diagnostic Report →
              </button>
            </div>
          )}
        </div>
      )}

      {/* --- TAB 2: DIAGNOSTIC REPORT --- */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          {/* Top Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-slate-400 uppercase font-semibold">Mastery Score</span>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-black text-brand-400">{report.percentage}%</span>
                <span className="text-xs text-slate-500 font-mono">
                  ({report.score}/{report.totalQuestions} correct)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-700"
                  style={{ width: `${report.percentage}%` }}
                />
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Strong Concepts
              </span>
              <div className="mt-2 space-y-1">
                {report.conceptsMastered.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg mr-1 mb-1 font-medium"
                  >
                    ✓ {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
              <span className="text-xs text-rose-400 uppercase font-semibold flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5" />
                Needs Reinforcement
              </span>
              <div className="mt-2 space-y-1">
                {report.conceptsNeedingWork.map((c, i) => (
                  <span
                    key={i}
                    className="inline-block text-xs bg-rose-950/60 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-lg mr-1 mb-1 font-medium"
                  >
                    ! {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs text-amber-400 uppercase font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Suggested Next Topic
              </span>
              <p className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                {report.nextSuggestedTopic}
              </p>
              <button
                onClick={() => onSelectTopic(report.nextSuggestedTopic)}
                className="mt-3 flex items-center justify-between text-xs text-brand-300 bg-brand-950/60 border border-brand-500/40 px-3 py-1.5 rounded-xl hover:bg-brand-900/60 transition"
              >
                <span>Start Next Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Misconception Diagnostic Breakdown (PDF Section 12 & 13) */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Misconception Diagnostic Breakdown
            </h4>
            <div className="space-y-3">
              {report.misconceptionAlerts.map((alert, idx) => (
                <div key={idx} className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span className="font-semibold text-amber-300">Focus Concept: {alert.concept}</span>
                    <span className="text-slate-500">Cognitive Pattern</span>
                  </div>
                  <p className="text-slate-300 mb-2">
                    <strong className="text-rose-400">Observed Misunderstanding:</strong> {alert.identifiedMistake}
                  </p>
                  <p className="text-slate-300 bg-brand-950/40 p-2.5 rounded-lg border border-brand-500/30">
                    <strong className="text-brand-300">Pedagogical Remedy:</strong> {alert.correctiveGuidance}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleDownloadNotes}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Download className="w-4 h-4 text-brand-400" />
              Download Full Study Notes (.md)
            </button>

            <button
              onClick={onRestartLesson}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white shadow transition"
            >
              <RotateCcw className="w-4 h-4" />
              Re-take Lesson
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 3: FLASHCARDS (Active Recall) --- */}
      {activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto py-4">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-4">
            <span>Card {currentCardIndex + 1} of {flashcards.length}</span>
            <span className="text-amber-400 font-medium">Click card to flip</span>
          </div>

          {flashcards.length > 0 && (
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative h-64 w-full cursor-pointer rounded-3xl bg-slate-950 border-2 border-slate-800 hover:border-brand-500/50 p-6 flex flex-col justify-between shadow-2xl transition-all duration-300 group"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-brand-400 bg-brand-950 px-2.5 py-1 rounded-full border border-brand-500/30">
                  {flashcards[currentCardIndex].category}
                </span>
                <span className="text-xs text-slate-500">
                  {isFlipped ? 'Answer Side' : 'Question Side'}
                </span>
              </div>

              <div className="text-center px-4">
                <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {isFlipped ? flashcards[currentCardIndex].back : flashcards[currentCardIndex].front}
                </p>
              </div>

              <div className="text-center text-xs text-slate-500 group-hover:text-slate-400">
                ↺ Click anywhere to flip
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
              }}
              disabled={currentCardIndex === 0}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 disabled:opacity-40"
            >
              ← Previous Card
            </button>
            <button
              onClick={() => {
                setIsFlipped(false);
                setCurrentCardIndex(Math.min(flashcards.length - 1, currentCardIndex + 1));
              }}
              disabled={currentCardIndex === flashcards.length - 1}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white disabled:opacity-40 shadow"
            >
              Next Card →
            </button>
          </div>
        </div>
      )}

      {/* --- TAB 4: 7-DAY PERSONALIZED STUDY PLAN --- */}
      {activeTab === 'roadmap' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              AI-Generated 7-Day Mastery Roadmap (Spaced Retention)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {report.personalized7DayPlan.map((step) => (
              <div
                key={step.day}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-brand-400 bg-brand-950/70 border border-brand-500/30 px-2 py-0.5 rounded-md">
                    Day {step.day}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{step.title}</span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{step.focus}</p>
                <ul className="space-y-1">
                  {step.tasks.map((task, tIdx) => (
                    <li key={tIdx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                      <span className="text-brand-400">✦</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
