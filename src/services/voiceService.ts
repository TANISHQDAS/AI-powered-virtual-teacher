import { LanguageCode } from '../types';

export type VoiceState = 'idle' | 'speaking' | 'listening' | 'thinking';

class VoiceService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private isListeningActive = false;
  private onStateChangeCallbacks: ((state: VoiceState) => void)[] = [];
  private onSpeechVolumeCallbacks: ((volume: number) => void)[] = [];
  private volumeInterval: any = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    if (typeof window === 'undefined') return;

    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
    }
  }

  public subscribeState(cb: (state: VoiceState) => void) {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter(c => c !== cb);
    };
  }

  public subscribeVolume(cb: (volume: number) => void) {
    this.onSpeechVolumeCallbacks.push(cb);
    return () => {
      this.onSpeechVolumeCallbacks = this.onSpeechVolumeCallbacks.filter(c => c !== cb);
    };
  }

  private notifyState(state: VoiceState) {
    this.onStateChangeCallbacks.forEach(cb => cb(state));
  }

  private notifyVolume(volume: number) {
    this.onSpeechVolumeCallbacks.forEach(cb => cb(volume));
  }

  // Get optimal voice based on language and gender preference
  private selectVoice(lang: LanguageCode, gender: 'female' | 'male'): SpeechSynthesisVoice | null {
    if (!this.synth) return null;
    const voices = this.synth.getVoices();
    if (voices.length === 0) return null;

    let targetLangPrefix = 'en';
    if (lang === 'hi' || lang === 'hinglish') targetLangPrefix = 'hi';
    else if (lang === 'es') targetLangPrefix = 'es';
    else if (lang === 'fr') targetLangPrefix = 'fr';

    // First try finding matching language + gender clue
    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(targetLangPrefix));
    if (langVoices.length > 0) {
      if (gender === 'female') {
        const femaleVoice = langVoices.find(v => /female|zira|priya|swara|kalpana|samantha|victoria|google/i.test(v.name));
        if (femaleVoice) return femaleVoice;
      } else {
        const maleVoice = langVoices.find(v => /male|david|rishi|neil|george|alex|daniel/i.test(v.name));
        if (maleVoice) return maleVoice;
      }
      return langVoices[0];
    }

    // Fallback: pick any natural sounding voice (e.g. Google, Natural, Microsoft)
    const naturalVoice = voices.find(v => /natural|online|google/i.test(v.name));
    return naturalVoice || voices[0];
  }

  // Speak script aloud with synchronized lip-sync amplitude
  public speak(
    text: string,
    options: {
      lang: LanguageCode;
      gender: 'female' | 'male';
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ) {
    this.stop();

    if (!this.synth) {
      console.warn("Speech synthesis not supported in this browser.");
      if (options.onStart) options.onStart();
      if (options.onEnd) options.onEnd();
      return;
    }

    // Clean text of markdown formatting for speech
    const cleanSpeech = text
      .replace(/\[.*?\]/g, '')
      .replace(/[#*`_~]/g, '')
      .replace(/\\frac\{.*?\}\{.*?\}/g, 'fraction')
      .replace(/\\\w+/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanSpeech);
    const voice = this.selectVoice(options.lang, options.gender);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.pitch = options.pitch || (options.gender === 'female' ? 1.05 : 0.95);
    utterance.rate = options.rate || 0.98;

    utterance.onstart = () => {
      this.notifyState('speaking');
      if (options.onStart) options.onStart();

      // Simulate natural speech cadence amplitude for lipsync
      let cycle = 0;
      this.volumeInterval = setInterval(() => {
        cycle += 0.2;
        // Periodic fluctuations mimicking human syllables
        const simulatedVolume = Math.abs(Math.sin(cycle * 3) * 0.7) + (Math.random() * 0.3);
        this.notifyVolume(simulatedVolume);
      }, 70);
    };

    utterance.onend = () => {
      this.stopVolumeSimulation();
      this.notifyState('idle');
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis notice:", e);
      this.stopVolumeSimulation();
      this.notifyState('idle');
      this.currentUtterance = null;
      if (options.onEnd) options.onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  private stopVolumeSimulation() {
    if (this.volumeInterval) {
      clearInterval(this.volumeInterval);
      this.volumeInterval = null;
    }
    this.notifyVolume(0);
  }

  // Stop currently playing speech
  public stop() {
    this.stopVolumeSimulation();
    if (this.synth) {
      this.synth.cancel();
    }
    this.currentUtterance = null;
    this.notifyState('idle');
  }

  // Start microphone speech recognition
  public startListening(
    lang: LanguageCode,
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (err: string) => void
  ) {
    if (!this.recognition) {
      if (onError) onError("Microphone recognition not supported in this browser. Please type your answer.");
      return;
    }

    this.stop(); // Stop teacher voice while student speaks
    this.isListeningActive = true;
    this.notifyState('listening');

    if (lang === 'hi' || lang === 'hinglish') {
      this.recognition.lang = 'hi-IN';
    } else if (lang === 'es') {
      this.recognition.lang = 'es-ES';
    } else {
      this.recognition.lang = 'en-US';
    }

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      onResult(activeText, Boolean(finalTranscript));
    };

    this.recognition.onerror = (err: any) => {
      console.warn("Speech recognition error:", err);
      this.isListeningActive = false;
      this.notifyState('idle');
      if (onError) onError(err.error || "Could not hear audio");
    };

    this.recognition.onend = () => {
      this.isListeningActive = false;
      this.notifyState('idle');
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn("Recognition already active", e);
    }
  }

  public stopListening() {
    if (this.recognition && this.isListeningActive) {
      this.recognition.stop();
    }
    this.isListeningActive = false;
    this.notifyState('idle');
  }
}

export const voiceService = new VoiceService();
