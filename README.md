# GuruAI: Human-Like Adaptive Virtual Teacher Platform
**AI Innovation Hackathon 2026 – Round 2 Technical Assessment Submission**

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![KaTeX](https://img.shields.io/badge/KaTeX-LaTeX%20Math-00d084.svg)](https://katex.org/)

---

## 1. Problem Statement & Motivation
Traditional digital learning platforms typically rely on pre-recorded linear video lectures or generic question-answer chatbots. Both fail to provide the real pedagogical magic of a skilled human educator:
1. **Chatbots lack structure**: They wait passively for questions instead of orchestrating a lesson with progressive scaffolding.
2. **Pre-recorded videos lack adaptability**: They monologue regardless of whether the student is confused or bored.
3. **They fail at misconception detection**: When a student makes a mistake, chatbots merely state "incorrect", whereas real human teachers identify *why* the student misunderstood and switch to an intuitive, relatable analogy.

**GuruAI** solves this by implementing an interactive, human-like virtual educator that follows the authentic pedagogical loop:
$$\text{Understand} \longrightarrow \text{Plan} \longrightarrow \text{Explain} \longrightarrow \text{Demonstrate} \longrightarrow \text{Question} \longrightarrow \text{Evaluate} \longrightarrow \text{Adapt} \longrightarrow \text{Continue}$$

---

## 2. Core Architecture & Feature Matrix

### A. Learning Material Grounding & RAG (Section 3 of PDF)
- **Document Processing**: Ingests textbook chapters, lecture notes, PDFs, Word documents, Markdown, and plain text.
- **Client-Side Semantic Chunker**: Splits texts into coherent concept chunks with sentence-boundary detection and window overlapping.
- **Inverted-Index & BM25 Relevance Search**: Grounds lesson plans and teacher explanations strictly in source texts, citing document titles and page coordinates to minimize hallucinations.
- **Pre-Indexed Textbooks**: Includes pre-loaded chapters (e.g. *NCERT Physics Class 10/12 Chapter 4: Electricity & Ohm's Law*, *Computer Science: React Hooks*, *Cellular Biology: Mitochondria & ATP*).

### B. Human-Like Video Lecture Experience (Sections 9 & 10)
- **2.5D Animated Teacher Avatar**: Features synchronized lip-sync amplitude tracking, natural ocular blinking cycles, head tilt attentiveness, and dynamic emotion badges (`Teaching`, `Listening to You`, `Analyzing Misconception`, `Celebrating`, `New Analogy`).
- **Smart Whiteboard**:
  - Handwritten chalk aesthetic annotations with real-time progressive reveals.
  - Native LaTeX mathematical formulas rendered via KaTeX.
  - Code blocks with syntactic highlighting.
- **Subject-Aware Visual Explanations**:
  - **Physics**: Interactive Ohm's Law circuit simulator with live battery, resistor, and glowing bulb, driven by dynamic slider parameters ($V = I \times R$).
  - **Mathematics**: Interactive quadratic function plotter ($f(x) = ax^2 + bx + c$) with real-time vertex tracking and discriminant ($\Delta$) geometry.
  - **Biology**: Clickable eukaryotic cell schematic with mitochondrial and nuclear organelle inspectors.
  - **Programming**: In-browser JavaScript/TypeScript sandbox with live code execution and terminal output stream.
  - **History**: Chronological epoch timeline with cause-and-effect milestones.

### C. Socratic Interactivity & Misconception Detection (Sections 11 & 12)
- **No Monologues**: The teacher pauses at key checkpoints to verify comprehension via conceptual and multiple-choice questions.
- **Speech-to-Text Microphone Input**: Students can speak aloud using the Web Speech API (supporting Hindi, English, and Hinglish).
- **Cognitive Trap Analysis**:
  - *Example Scenario*: If a student answers that current increases when resistance increases, the engine detects the cognitive trap (`Confusing resistance as a conduit rather than an obstruction`), intervenes without discouragement, offers a water-pipe / highway speed-bump analogy, and verifies with a targeted follow-up.

### D. Multilingual Flexibility (Section 8)
- Native support for **English**, **Hindi (हिंदी)**, and **Hinglish** ("*Mujhe ye simple example ke saath samjhao*").
- Seamless mid-session switching: students can click or request a language change at any point, and the teacher smoothly translates the conceptual context.
- Cross-lingual grounding: can ingest an English textbook and teach the entire lesson in Hindi or Hinglish.

### E. Diagnostic Assessment & 7-Day Roadmap (Sections 13, 14, 15)
- **End-of-Lesson Diagnostic Exam**: Measures mastery percentage and isolates strong vs. weak concepts.
- **Misconception Log**: Catalogs specific errors and provides corrective pedagogical guidance.
- **Active Recall Flashcard Deck**: Interactive flip cards with spaced repetition categorization.
- **7-Day Personalized Study Roadmap**: Generates a structured multi-day retention schedule based on the student's observed weak spots.
- **Markdown Notes Export**: One-click download of the complete study summary.

---

## 3. Technology Stack & API Disclosure

| Layer | Technologies Used | Purpose |
|---|---|---|
| **Frontend Framework** | React 19, TypeScript | Reactive state, component lifecycle, type safety |
| **Build & Bundler** | Vite 8.3 | High-performance bundling and zero-lag HMR |
| **Styling & Design** | Tailwind CSS 3.4 | Bespoke educational UI, slate & brand color palettes |
| **Math Rendering** | KaTeX 0.19 | Precise LaTeX typesetting for formulas |
| **Document Ingestion** | PDF.js (CDN), HTML5 File API | Zero-dependency client-side PDF and text extraction |
| **Speech & Audio** | Web Speech API (Synthesis & Recognition) | Real-time multilingual voice and microphone STT |
| **Visual Effects** | Canvas Confetti, SVG Morphing | Interactive gamification and avatar lip-sync |
| **LLM Grounding** | Built-in Pedagogical Simulation Engine + Optional Gemini API | Zero-dependency offline operation + optional online LLM |

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Node.js (v18 or higher recommended; verified on Node v26)
- npm (v9 or higher)

### Installation
```bash
# 1. Clone repository or navigate to directory
cd ai-teacher-platform

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The application will launch immediately at `http://localhost:5173`.

### Production Build
```bash
npm run build
npm run preview
```

---

## 5. Testing the Primary Benchmark Scenario (From PDF Page 2)
To replicate the exact user scenario defined in the Hackathon brief:
> *"I am a beginner. Teach me Chapter 4 in 20 minutes. Explain it in Hindi using simple examples. Ask me questions during the lesson and test me at the end."*

1. Open the application.
2. Under **Quick Scenarios**, click **🇮🇳 NCERT Ch 4 (Hindi)** or **🇮🇳 NCERT Ch 4 (Hinglish)**.
3. Dr. Priya Sharma begins teaching Chapter 4 on the Smart Whiteboard with voice narration.
4. Interact with the **Ohm's Law Circuit Simulator** by sliding Voltage and Resistance.
5. At the checkpoint question, select an answer or click the **Microphone** button to speak your response.
6. If an incorrect answer is given, observe the **Misconception Detection Engine** explain the water-pipe analogy.
7. Click **Jump to Final Assessment** to complete the diagnostic quiz, review the 7-day study plan, practice flashcards, and export your study notes.

---

## 6. Known Limitations & Roadmap
- Browser Web Speech Synthesis voice quality is contingent upon host OS voice packs (e.g. Microsoft Swara / Google Hindi on Windows/Chrome).
- Full ElevenLabs or Deepgram real-time audio streaming sidecar can be configured for hyper-realistic voice cloning in future releases.
- WebGPU-accelerated 3D avatar rendering (e.g. Ready Player Me / Three.js) planned for v2.0.
