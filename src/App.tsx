import React, { useState, useEffect } from 'react';
import {
  LearnerLevel,
  TimeDuration,
  LanguageCode,
  LessonPlan,
  TeacherPersona,
  LessonSegment
} from './types';
import { TEACHER_PERSONAS } from './data/teachers';
import { teacherEngine, StudentEvaluationResult } from './services/teacherEngine';
import { voiceService } from './services/voiceService';
import { TeacherAvatar } from './components/TeacherAvatar';
import { SmartWhiteboard } from './components/SmartWhiteboard';
import { InteractiveDialog } from './components/InteractiveDialog';
import { AssessmentReport } from './components/AssessmentReport';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { SettingsModal } from './components/SettingsModal';
import { SubjectVisualizer } from './components/SubjectVisualizer';
import {
  GraduationCap,
  Sparkles,
  Upload,
  Settings,
  Globe2,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  ArrowRight,
  Flame,
  CheckCircle2,
  MessageSquare,
  Compass,
  Layers,
  Award,
  Users,
  Clock,
  ChevronRight,
  Star,
  FileText,
  Search,
  CheckCircle,
  HelpCircle,
  Activity,
  Bookmark
} from 'lucide-react';

export const App: React.FC = () => {
  // Navigation & View Mode
  const [activePortalTab, setActivePortalTab] = useState<'lecture' | 'lab' | 'syllabus' | 'library' | 'assessment'>('lecture');

  // Core Teacher & Student Configuration
  const [currentTeacher, setCurrentTeacher] = useState<TeacherPersona>(TEACHER_PERSONAS[0]);
  const [level, setLevel] = useState<LearnerLevel>('beginner');
  const [duration, setDuration] = useState<TimeDuration>('20m');
  const [language, setLanguage] = useState<LanguageCode>('en');

  // Active Lesson State
  const [currentTopic, setCurrentTopic] = useState<string>('Physics Chapter 4: Electric Current & Ohm’s Law');
  const [topicInput, setTopicInput] = useState<string>('');
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [currentSegmentIdx, setCurrentSegmentIdx] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [detectedMisconceptions, setDetectedMisconceptions] = useState<string[]>([]);
  const [isAssessmentView, setIsAssessmentView] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);

  // Initial load: generate baseline benchmark lesson (Ohm's Law)
  useEffect(() => {
    loadTopicLesson(currentTopic);
  }, []);

  const loadTopicLesson = async (topicToLoad: string, customDocText?: string) => {
    voiceService.stop();
    setIsPlayingAudio(false);
    setIsAssessmentView(false);
    setCurrentSegmentIdx(0);

    const plan = await teacherEngine.generateLessonPlan({
      topic: topicToLoad,
      level,
      duration,
      language,
      teacher: currentTeacher,
      customDocumentText: customDocText
    });

    setLessonPlan(plan);
    setCurrentTopic(topicToLoad);

    // Auto-read first segment script to welcome student
    if (plan.segments.length > 0) {
      setTimeout(() => {
        playSegmentScript(plan.segments[0].teacherScript);
      }, 500);
    }
  };

  const playSegmentScript = (script: string) => {
    setIsPlayingAudio(true);
    voiceService.speak(script, {
      lang: language,
      gender: currentTeacher.voiceGender,
      pitch: currentTeacher.voicePitch,
      rate: currentTeacher.voiceRate,
      onEnd: () => setIsPlayingAudio(false)
    });
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      voiceService.stop();
      setIsPlayingAudio(false);
    } else if (lessonPlan && lessonPlan.segments[currentSegmentIdx]) {
      playSegmentScript(lessonPlan.segments[currentSegmentIdx].teacherScript);
    }
  };

  const handleNextSegment = () => {
    if (!lessonPlan) return;
    if (currentSegmentIdx < lessonPlan.segments.length - 1) {
      const nextIdx = currentSegmentIdx + 1;
      setCurrentSegmentIdx(nextIdx);
      playSegmentScript(lessonPlan.segments[nextIdx].teacherScript);
    } else {
      // Reached the end of lesson, launch diagnostic assessment!
      setIsAssessmentView(true);
      setActivePortalTab('assessment');
    }
  };

  const handlePrevSegment = () => {
    if (!lessonPlan || currentSegmentIdx === 0) return;
    const prevIdx = currentSegmentIdx - 1;
    setCurrentSegmentIdx(prevIdx);
    playSegmentScript(lessonPlan.segments[prevIdx].teacherScript);
  };

  const handleLanguageChange = (newLang: LanguageCode) => {
    setLanguage(newLang);
    if (lessonPlan) {
      teacherEngine
        .generateLessonPlan({
          topic: currentTopic,
          level,
          duration,
          language: newLang,
          teacher: currentTeacher
        })
        .then((updatedPlan) => {
          setLessonPlan(updatedPlan);
          playSegmentScript(updatedPlan.segments[currentSegmentIdx].teacherScript);
        });
    }
  };

  const handleAnswerSubmitted = (result: StudentEvaluationResult) => {
    if (!result.isCorrect && result.detectedMisconception) {
      setDetectedMisconceptions((prev) => [...prev, result.detectedMisconception!]);
    }
  };

  const handleReExplainWithAnalogy = (remedyAnalogy: string) => {
    voiceService.speak(
      `Let's try a clearer mental model. ${remedyAnalogy}`,
      {
        lang: language,
        gender: currentTeacher.voiceGender,
        pitch: currentTeacher.voicePitch,
        rate: currentTeacher.voiceRate
      }
    );
  };

  const activeSegment: LessonSegment | undefined = lessonPlan?.segments[currentSegmentIdx];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      {/* Top Global Portal Header */}
      <header className="border-b border-slate-800/80 bg-[#0d1322]/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  Academix
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-sky-300 border border-slate-700 px-2 py-0.5 rounded-full">
                  Learning Studio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Adaptive Virtual Faculty & Interactive Science Labs
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800/90 text-xs font-semibold">
            <button
              onClick={() => {
                setActivePortalTab('lecture');
                setIsAssessmentView(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activePortalTab === 'lecture' && !isAssessmentView
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Active Lecture</span>
            </button>
            <button
              onClick={() => {
                setActivePortalTab('lab');
                setIsAssessmentView(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activePortalTab === 'lab'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Interactive Lab</span>
            </button>
            <button
              onClick={() => {
                setActivePortalTab('syllabus');
                setIsAssessmentView(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activePortalTab === 'syllabus'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Syllabus Outline</span>
            </button>
            <button
              onClick={() => {
                setActivePortalTab('assessment');
                setIsAssessmentView(true);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition ${
                activePortalTab === 'assessment' || isAssessmentView
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Assessments & Retention</span>
            </button>
          </nav>

          {/* User & Live API Status Widget */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gemini Live API Status Badge */}
            <div
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-xl cursor-pointer hover:border-emerald-500/60 transition shadow-sm"
              title="Google Gemini 2.5 Flash Connected & Verified"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-300 font-semibold hidden md:inline">Gemini 2.5 Flash</span>
            </div>

            {/* Quick Upload / RAG Button */}
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shadow-sm"
            >
              <Upload className="w-3.5 h-3.5 text-brand-400" />
              <span className="hidden sm:inline">Textbook / RAG</span>
            </button>

            {/* Student Profile Pill */}
            <div
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded-xl cursor-pointer transition"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
                AS
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[11px] font-bold text-slate-200 leading-tight">Arnav S.</span>
                <span className="text-[9px] font-mono text-amber-400 leading-tight">🔥 4-Day Streak</span>
              </div>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
              title="Settings & Faculty"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Course Breadcrumb & Metadata Banner */}
      <section className="bg-[#0b101c] border-b border-slate-800/60 py-3 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2 text-xs text-slate-400 flex-wrap">
            <span className="hover:text-slate-200 cursor-pointer">Curriculum Catalog</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="hover:text-slate-200 cursor-pointer capitalize">{lessonPlan?.subject || 'Science'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="text-white font-semibold truncate max-w-sm">
              {lessonPlan?.title || currentTopic}
            </span>
          </div>

          {/* Social Proof & Course Stats */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="font-bold text-slate-200">4.9</span>
              <span className="text-slate-500">(1,420 ratings)</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Users className="w-3.5 h-3.5 text-sky-400" />
              <span>24,800+ Students</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{duration} Session</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        {/* Course Search & Benchmark Scenario Chips */}
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (topicInput.trim()) {
                loadTopicLesson(topicInput.trim());
                setTopicInput('');
              }
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Ask faculty to teach any concept (e.g. 'Chapter 4 Physics in Hindi', 'React State', 'Newton’s Laws', 'Black Holes')..."
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow"
            >
              <span>Launch Lesson</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Benchmark Topic Selectors */}
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/60 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Core Modules:
            </span>
            <button
              onClick={() => {
                setLanguage('hi');
                loadTopicLesson('Physics Chapter 4: Electric Current & Ohm’s Law');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition text-[11px]"
            >
              🇮🇳 NCERT Ch 4 (Hindi)
            </button>
            <button
              onClick={() => {
                setLanguage('hinglish');
                loadTopicLesson('Physics Chapter 4: Electric Current & Ohm’s Law');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-white transition text-[11px]"
            >
              🇮🇳 NCERT Ch 4 (Hinglish)
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                loadTopicLesson('React Component State, Hooks & Lifecycle');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-white transition text-[11px]"
            >
              💻 React Hooks (CS)
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                loadTopicLesson('Quadratic Functions & Parabolic Trajectories');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-300 hover:text-white transition text-[11px]"
            >
              📐 Quadratic Equations (Math)
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                loadTopicLesson('Mitochondria & ATP Synthesis in Cellular Biology');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white transition text-[11px]"
            >
              🔬 ATP Cellular Energy (Bio)
            </button>
          </div>
        </section>

        {/* --- VIEW 1: ACTIVE LECTURE & WHITEBOARD --- */}
        {activePortalTab === 'lecture' && !isAssessmentView && activeSegment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Faculty Video Lecture Panel */}
              <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl backdrop-blur-md flex flex-col items-center justify-between min-h-[470px]">
                <div className="w-full flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">Live Faculty Stream</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {language.toUpperCase()}
                  </span>
                </div>

                {/* 2.5D Animated Teacher Avatar */}
                <TeacherAvatar
                  teacher={currentTeacher}
                  emotionState={
                    activeSegment.checkpoint
                      ? 'listening'
                      : isPlayingAudio
                      ? 'explaining'
                      : 'thinking'
                  }
                />

                {/* Teacher Credentials & Speech Controls */}
                <div className="w-full mt-4 space-y-3">
                  <p className="text-[11px] text-slate-400 italic text-center px-2">
                    {currentTeacher.tagline}
                  </p>

                  <div className="flex items-center justify-center gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800">
                    <button
                      onClick={handleToggleAudio}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow transition"
                    >
                      {isPlayingAudio ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current" />
                          <span>Pause Voice</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Play Audio</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => playSegmentScript(activeSegment.teacherScript)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                      title="Repeat explanation from beginning"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Smart Whiteboard & Interactive Notes */}
              <div className="lg:col-span-8 flex flex-col min-h-[470px]">
                <SmartWhiteboard
                  segment={activeSegment}
                  totalSegments={lessonPlan?.segments.length || 1}
                  currentSegmentIndex={currentSegmentIdx}
                  onNextSegment={handleNextSegment}
                  onPrevSegment={handlePrevSegment}
                  topic={lessonPlan?.title || currentTopic}
                />
              </div>
            </div>

            {/* Socratic Checkpoint & Misconception Dialog */}
            <InteractiveDialog
              checkpoint={activeSegment.checkpoint}
              teacher={currentTeacher}
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
              onAnswerSubmitted={handleAnswerSubmitted}
              onNextSegment={handleNextSegment}
              onReExplainWithAnalogy={handleReExplainWithAnalogy}
            />

            {/* Bottom Exam Transition Banner */}
            <div className="flex justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <span className="text-xs text-slate-400">
                Ready to verify your retention and earn course certification?
              </span>
              <button
                onClick={() => {
                  setIsAssessmentView(true);
                  setActivePortalTab('assessment');
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow transition"
              >
                <span>Take Diagnostic Assessment</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW 2: DEDICATED INTERACTIVE EXPERIMENT LAB --- */}
        {activePortalTab === 'lab' && activeSegment && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white">Virtual Science & Engineering Sandbox</h3>
                <p className="text-xs text-slate-400">Experiment freely with physical constants, circuit parameters, and mathematical curves.</p>
              </div>
              <button
                onClick={() => setActivePortalTab('lecture')}
                className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-xl font-semibold text-slate-300"
              >
                ← Back to Lecture
              </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <SubjectVisualizer
                visualType={activeSegment.visualType !== 'none' ? activeSegment.visualType : 'physics-circuit'}
                visualData={activeSegment.visualData || { voltage: 12, resistance: 20 }}
              />
            </div>
          </div>
        )}

        {/* --- VIEW 3: SYLLABUS OUTLINE --- */}
        {activePortalTab === 'syllabus' && lessonPlan && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Course Syllabus & Modular Progression</h3>
              <p className="text-xs text-slate-400">Structured according to pedagogical scaffolding from first principles to mastery.</p>
            </div>

            <div className="space-y-3">
              {lessonPlan.segments.map((seg, idx) => (
                <div
                  key={seg.id}
                  onClick={() => {
                    setCurrentSegmentIdx(idx);
                    setActivePortalTab('lecture');
                    playSegmentScript(seg.teacherScript);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                    idx === currentSegmentIdx
                      ? 'bg-brand-950/60 border-brand-500/60'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        idx < currentSegmentIdx
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : idx === currentSegmentIdx
                          ? 'bg-brand-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx < currentSegmentIdx ? '✓' : idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{seg.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{seg.summary}</p>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-brand-400">
                    {idx === currentSegmentIdx ? 'Active Step' : 'Review Concept →'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 4 & ASSESSMENT: DIAGNOSTIC REPORT & ROADMAP --- */}
        {(activePortalTab === 'assessment' || isAssessmentView) && lessonPlan && (
          <AssessmentReport
            lesson={lessonPlan}
            onRestartLesson={() => {
              setIsAssessmentView(false);
              setActivePortalTab('lecture');
              setCurrentSegmentIdx(0);
              if (lessonPlan.segments.length > 0) {
                playSegmentScript(lessonPlan.segments[0].teacherScript);
              }
            }}
            onSelectTopic={(nextTopic) => {
              setActivePortalTab('lecture');
              loadTopicLesson(nextTopic);
            }}
            detectedMisconceptions={detectedMisconceptions}
          />
        )}
      </main>

      {/* Global EdTech Footer */}
      <footer className="border-t border-slate-800/80 bg-[#070b12] py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Academix Studio</span>
            <span>·</span>
            <span>Accredited STEM & Humanities Virtual Learning Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Pedagogical Standard: Socratic Method</span>
            <span>·</span>
            <span>Multi-modal Knowledge Grounding</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentLoaded={(docName, text) => {
          loadTopicLesson(docName, text);
          setActivePortalTab('lecture');
        }}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        currentTeacher={currentTeacher}
        onSelectTeacher={(teacher) => {
          setCurrentTeacher(teacher);
          if (lessonPlan && lessonPlan.segments[currentSegmentIdx]) {
            setTimeout(() => {
              playSegmentScript(lessonPlan.segments[currentSegmentIdx].teacherScript);
            }, 300);
          }
        }}
        level={level}
        onChangeLevel={(newLevel) => {
          setLevel(newLevel);
          loadTopicLesson(currentTopic);
        }}
        duration={duration}
        onChangeDuration={(newDur) => {
          setDuration(newDur);
          loadTopicLesson(currentTopic);
        }}
      />
    </div>
  );
};
