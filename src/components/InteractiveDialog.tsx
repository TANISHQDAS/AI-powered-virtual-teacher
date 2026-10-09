import React, { useState, useEffect } from 'react';
import { CheckpointQuestion, LanguageCode, TeacherPersona } from '../types';
import { teacherEngine, StudentEvaluationResult } from '../services/teacherEngine';
import { voiceService } from '../services/voiceService';
import {
  Mic,
  MicOff,
  Send,
  HelpCircle,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Globe2,
  Volume2
} from 'lucide-react';

interface InteractiveDialogProps {
  checkpoint?: CheckpointQuestion;
  teacher: TeacherPersona;
  currentLanguage: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onAnswerSubmitted: (result: StudentEvaluationResult) => void;
  onNextSegment: () => void;
  onReExplainWithAnalogy: (remedyAnalogy: string) => void;
}

export const InteractiveDialog: React.FC<InteractiveDialogProps> = ({
  checkpoint,
  teacher,
  currentLanguage,
  onLanguageChange,
  onAnswerSubmitted,
  onNextSegment,
  onReExplainWithAnalogy
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [customTextAnswer, setCustomTextAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<StudentEvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Reset evaluation when checkpoint changes
  useEffect(() => {
    setEvaluation(null);
    setSelectedOption('');
    setCustomTextAnswer('');
  }, [checkpoint]);

  const handleSubmitAnswer = async (answer: string) => {
    if (!checkpoint || !answer.trim()) return;

    setIsEvaluating(true);
    voiceService.stopListening();
    setIsRecording(false);

    // Evaluate response using Misconception Detection Engine (augmented by Gemini 2.5 Flash)
    const result = await teacherEngine.evaluateStudentResponseAsync({
      question: checkpoint,
      studentAnswer: answer,
      teacher,
      language: currentLanguage
    });

    setEvaluation(result);
    setIsEvaluating(false);
    onAnswerSubmitted(result);

    // Teacher speaks the feedback immediately
    voiceService.speak(result.feedbackMessage, {
      lang: currentLanguage,
      gender: teacher.voiceGender,
      pitch: teacher.voicePitch,
      rate: teacher.voiceRate
    });
  };

  // Handle Speech-to-Text microphone recording
  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      voiceService.stopListening();
      setIsRecording(false);
    } else {
      setIsRecording(true);
      voiceService.startListening(
        currentLanguage,
        (transcript, isFinal) => {
          setCustomTextAnswer(transcript);
          if (isFinal) {
            setIsRecording(false);
            handleSubmitAnswer(transcript);
          }
        },
        (err) => {
          console.warn("STT Notice:", err);
          setIsRecording(false);
        }
      );
    }
  };

  // If no checkpoint for current segment, show conversational check-in bar
  if (!checkpoint) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-semibold text-slate-200">
              {teacher.name} is ready for questions or to proceed to the next step.
            </span>
          </div>

          {/* Quick Multilingual Switch Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                currentLanguage === 'en' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => onLanguageChange('hi')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                currentLanguage === 'hi' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => onLanguageChange('hinglish')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                currentLanguage === 'hinglish' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl backdrop-blur-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400 animate-bounce" />
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            Interactive Checkpoint with {teacher.name}
          </span>
        </div>

        {/* Multilingual Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
          <Globe2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400 mr-1">Language:</span>
          {(['en', 'hi', 'hinglish'] as LanguageCode[]).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                currentLanguage === lang ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'Hinglish'}
            </button>
          ))}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="mb-4">
        <p className="text-sm sm:text-base font-semibold text-slate-100 leading-snug">
          {checkpoint.question}
        </p>
      </div>

      {/* Multiple Choice Options */}
      {checkpoint.options && checkpoint.options.length > 0 && !evaluation && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
          {checkpoint.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedOption(opt);
                handleSubmitAnswer(opt);
              }}
              className="text-left p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-brand-950/50 hover:border-brand-500/50 text-slate-200 text-xs sm:text-sm font-medium transition shadow-sm flex items-center justify-between group"
            >
              <span>{opt}</span>
              <span className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 group-hover:border-brand-400 group-hover:text-brand-300">
                {String.fromCharCode(65 + idx)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Voice / Custom Answer Input */}
      {!evaluation && (
        <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
          <input
            type="text"
            placeholder={
              currentLanguage === 'hi'
                ? "यहाँ अपना उत्तर लिखें या माइक दबाकर बोलें..."
                : currentLanguage === 'hinglish'
                ? "Apna answer yahan type karein ya mic dabakar bolein..."
                : "Type your explanation in your own words, or click the mic to speak..."
            }
            value={customTextAnswer}
            onChange={(e) => setCustomTextAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmitAnswer(customTextAnswer);
            }}
            className="flex-1 bg-transparent px-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            onClick={handleToggleVoiceRecord}
            className={`p-2.5 rounded-xl transition ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Speak your answer"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSubmitAnswer(customTextAnswer)}
            disabled={!customTextAnswer.trim()}
            className="p-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Evaluating State */}
      {isEvaluating && (
        <div className="flex items-center justify-center gap-2 p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-brand-300 animate-pulse my-2">
          <Sparkles className="w-4 h-4 animate-spin text-brand-400" />
          <span>{teacher.name} is analyzing your response with Gemini 2.5 Flash...</span>
        </div>
      )}

      {/* Misconception Feedback & Adaptive Pedagogical Guidance */}
      {evaluation && !isEvaluating && (
        <div
          className={`p-4 rounded-xl border mt-3 transition-all ${
            evaluation.isCorrect
              ? 'bg-emerald-950/40 border-emerald-500/40'
              : 'bg-amber-950/40 border-amber-500/40'
          }`}
        >
          <div className="flex items-start gap-3">
            {evaluation.isCorrect ? (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    evaluation.isCorrect ? 'text-emerald-300' : 'text-amber-300'
                  }`}
                >
                  {evaluation.isCorrect
                    ? 'Concept Mastered!'
                    : 'Cognitive Misconception Intercepted'}
                </span>
                {evaluation.detectedMisconception && (
                  <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                    Trap: {evaluation.detectedMisconception}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-slate-100 mt-1.5 leading-relaxed">
                {evaluation.feedbackMessage}
              </p>

              {evaluation.adaptiveScriptAddition && (
                <div className="mt-2.5 p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-brand-400 block mb-1">
                    Pedagogical Remedy & Clarification:
                  </span>
                  {evaluation.adaptiveScriptAddition}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2 border-t border-slate-800/80">
                {!evaluation.isCorrect && evaluation.remedyAnalogy && (
                  <button
                    onClick={() => onReExplainWithAnalogy(evaluation.remedyAnalogy!)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white transition shadow"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Try With Analogy
                  </button>
                )}

                <button
                  onClick={() => {
                    setEvaluation(null);
                    onNextSegment();
                  }}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-600 hover:bg-brand-500 text-white transition shadow ml-auto"
                >
                  <span>Continue Lesson</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
