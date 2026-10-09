# GuruAI: Technical Architecture & System Documentation
**AI Innovation Hackathon 2026 – Round 2 Technical Assessment**

## 1. Problem Statement
Traditional digital learning systems suffer from two distinct failure modes:
1. **Linear Monologues**: Pre-recorded lectures and video courses cannot observe whether a student understands, fails to adapt to student pace, and cannot clear real-time doubts.
2. **Text Chatbots**: Typical generative conversational agents wait passively for user prompts, lack pedagogical curriculum planning, regurgitate unstructured text walls, and treat student errors as binary right/wrong without understanding cognitive misconceptions.

The hackathon challenge mandates an **adaptive virtual educator** capable of transforming educational materials into structured, personalized, multi-sensory video teaching experiences.

---

## 2. Solution Overview
GuruAI is an end-to-end Virtual Educator Platform designed around the human pedagogical loop:
$$\mathbf{Understand} \longrightarrow \mathbf{Plan} \longrightarrow \mathbf{Explain} \longrightarrow \mathbf{Demonstrate} \longrightarrow \mathbf{Question} \longrightarrow \mathbf{Evaluate} \longrightarrow \mathbf{Adapt} \longrightarrow \mathbf{Continue}$$

Rather than a static script reader, GuruAI pairs a **2.5D animated, speech-synchronized AI Teacher Avatar** with an **interactive smart whiteboard** and **subject-aware interactive labs**. The student can speak to the teacher via voice, answer questions, trigger misconception remediations with alternative analogies, switch languages dynamically, and receive diagnostic reports with 7-day retention schedules.

---

## 3. System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                                 USER INTERFACE                                    |
|   +------------------------------------+  +-----------------------------------+   |
|   |   2.5D Animated Teacher Avatar     |  |         Smart Whiteboard          |   |
|   |  - Real-time Lip-Sync Amplitude    |  |  - KaTeX Mathematical Derivations |   |
|   |  - Blinking & Emotional Badges     |  |  - Handwritten Chalk Annotations  |   |
|   |  - Persona Selection (4 Teachers)  |  |  - Subject-Aware Interactive Labs |   |
|   +-----------------+------------------+  +-----------------+-----------------+   |
|                     |                                       |                     |
|   +-----------------+---------------------------------------+-----------------+   |
|   |              Socratic Dialog & Checkpoint Interaction                     |   |
|   |   - Microphone Speech-to-Text (STT)      - Multilingual Switcher (EN/HI)  |   |
|   |   - Multiple Choice & Concept Checks     - Dynamic Analogy Interventions  |   |
|   +---------------------------------------------------------------------------+   |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                            PEDAGOGICAL CORE SERVICES                              |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   RAG Knowledge    |  |   Teacher Engine     |  |   Misconception Engine    |  |
|  |     Grounding      |  |  - Curriculum Plan   |  |  - Cognitive Trap Mapping |  |
|  | - PDF.js Ingestion |  |  - Depth Scaling     |  |  - Analogy Switching      |  |
|  | - BM25 Term Search |  |  - Pace Control      |  |  - Adaptive Remediation   |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
|                                                                                   |
|  +--------------------+  +----------------------+  +---------------------------+  |
|  |   Voice Engine     |  |  Assessment Suite    |  |   Learner Memory          |  |
|  | - Web Speech Synth |  |  - Diagnostic Exam   |  |  - Mastery Radar          |  |
|  | - STT Recognition  |  |  - Flashcard Decks   |  |  - Persistent History     |  |
|  | - Amplitude Sync   |  |  - 7-Day Study Plan  |  |  - Weakness Taxonomy      |  |
|  +--------------------+  +----------------------+  +---------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 4. AI/ML Models & Implementation

### A. RAG and Knowledge Grounding (Weightage: 15)
- **Ingestion Pipeline**: The platform ingests documents via the HTML5 File API and PDF.js binary streams.
- **Chunking Strategy**: Employs a hierarchical heading-aware chunker that divides text at semantic boundaries (`Chapter`, `Section`, `###`), falling back to a 450-character sliding window with a 100-character overlap for continuous prose.
- **Retrieval Metric**: Computes BM25-weighted token relevance across titles and content bodies, scoring chunks and passing the top-$k$ grounding snippets with source filenames and page references.

### B. Prompt & Agent Architecture (Weightage: 20)
- The Teacher Engine orchestrates a multi-phase finite state machine:
  1. `CURRICULUM_DESIGN`: Transforms raw input or topic prompt into a multi-step lesson plan with explicit time budgets (5m, 20m, 60m, 7d).
  2. `SOCRATIC_DELIVERY`: Generates speech scripts matched to the active Teacher Persona's tone.
  3. `DIAGNOSTIC_CHECKPOINT`: Intercepts flow with a formative checkpoint question.
  4. `ADAPTIVE_REMEDIATION`: If an error is detected, the agent redirects the lesson path to clear the identified cognitive hurdle.

### C. Personalization Approach
- **Depth Adaptation**:
  - *Beginner*: Prioritizes visual metaphors, everyday analogies (e.g. water pressure in pipes for voltage), and minimal formal jargon.
  - *Intermediate*: Introduces formal definitions, structural diagrams, and practical engineering examples.
  - *Advanced*: Derives mathematical equations, boundary conditions, and implementation trade-offs.
- **Time Adaptation**:
  - *5 minutes*: High-yield summary blitz focusing on one primary mental model.
  - *20 minutes*: Structured lesson with progressive interactive checkpoints.
  - *60 minutes*: In-depth mastery session with derivation, simulation lab, and exam.
  - *7 days*: Spaced-repetition curriculum schedule with daily objectives.

### D. Multilingual Implementation (Weightage: 10)
- **Zero-Friction Switching**: The user can switch between **English**, **Hindi (हिंदी)**, and **Hinglish** at any point without restarting the lesson.
- **Cross-Lingual Ingestion**: An English textbook (e.g. NCERT Chapter 4) is parsed and taught entirely in Hindi or Hinglish with localized terminology (e.g., *विभवांतर*, *प्रतिरोध*, *धक्का*, *रुकावट*).

### E. Voice & Avatar Implementation (Weightage: 10)
- **Avatar Lip-Sync**: The `VoiceService` calculates speech syllable cadence and dispatches real-time amplitude pulses to the avatar's SVG mouth structure, modulating mouth height and vowel visemes dynamically.
- **Facial Animation**: Realistic blinking cycles (every 4000ms), head-tilt attentiveness when listening to student audio, and reactive badges.
- **Speech Synthesis & Recognition**: Configured via the Web Speech API with automatic voice matching for Hindi (`hi-IN`), Indian English (`en-IN`), and standard dialects.

### F. Subject-Aware Visualizations (Weightage: 15)
- **Mathematics**: Dynamic quadratic parabola plotter with interactive sliders for $a, b, c$, instantaneous vertex coordinate tracking, and discriminant indicator.
- **Physics**: Real-time Ohm's Law circuit simulator with live battery, resistor, and glowing bulb, driven by slider inputs for Voltage and Resistance.
- **Biology**: Interactive eukaryotic cell schematic with clickable mitochondrial and nuclear organelle inspectors.
- **Programming**: In-browser JavaScript/TypeScript execution sandbox with simulated console log capture and error handling.
- **History**: Interactive chronological epoch timeline cards.

---

## 5. Deployment & Setup Instructions

### Local Development
```bash
git clone <repository_url>
cd ai-teacher-platform
npm install
npm run dev
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

### Docker Deployment (Optional)
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## 6. Known Limitations
1. Web Speech Synthesis relies on the client's operating system voice repository. In headless or unconfigured Linux environments without speech synthesis engines, the voice falls back to on-screen text scripts.
2. Full neural lip-sync generation (e.g., SadTalker/Wav2Lip) requires heavy GPU clusters; GuruAI solves this via low-latency, 60fps client-side SVG viseme modulation that runs seamlessly on all devices without server lag.
