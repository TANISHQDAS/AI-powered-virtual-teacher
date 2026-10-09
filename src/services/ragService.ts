import { RAGChunk } from '../types';

export interface GroundedSearchResult {
  chunk: RAGChunk;
  relevanceScore: number;
}

// Built-in textbook database for immediate out-of-the-box demo
export const SAMPLE_TEXTBOOKS: { id: string; title: string; subject: string; content: string }[] = [
  {
    id: 'physics-ch4',
    title: 'NCERT Physics - Chapter 4: Electric Current, Potential Difference & Ohm’s Law',
    subject: 'physics',
    content: `Chapter 4: Electricity and Ohm's Law

Section 4.1: Electric Current and Circuit
An electric current is expressed by the amount of charge flowing through a particular area in unit time. In other words, it is the rate of flow of electric charges. In circuits using metallic wires, electrons constitute the flow of charges. However, electrons were not known at the time when the phenomenon of electricity was first observed. So, electric current was considered to be the flow of positive charges and the direction of flow of positive charges was taken to be the direction of electric current. Conventionally, in an electric circuit the direction of electric current is taken as opposite to the direction of the flow of electrons, which are negative charges.
Formula: I = Q / t, where I is current in Amperes (A), Q is net charge in Coulombs (C), and t is time in seconds. 1 Ampere is constituted by the flow of one coulomb of charge per second (1 A = 1 C/s).

Section 4.2: Electric Potential and Potential Difference
What makes the electric charge flow? Consider an analogy of water flow. Charges do not flow in a copper wire by themselves, just as water in a perfectly horizontal tube does not flow. If one end of the tube is connected to a higher reservoir of water, water flows out of the other end. For flow of charges in a conducting metallic wire, the gravity of course has no role to play; the electrons move only if there is a difference of electric pressure – called the potential difference – along the conductor. This difference of potential may be produced by a battery.
The electric potential difference V between two points in an electric circuit carrying some current is the work done W to move a unit charge Q from one point to the other:
V = W / Q. The SI unit of electric potential difference is Volt (V), named after Alessandro Volta.

Section 4.3: Ohm's Law
In 1827, a German physicist Georg Simon Ohm found out the relationship between the current I flowing in a metallic wire and the potential difference across its terminals. Ohm's law states that the electric current flowing through a metallic conductor is directly proportional to the potential difference V across its ends, provided its temperature remains constant:
V ∝ I, or V = I * R.
Here R is a constant for the given metallic wire at a given temperature and is called its resistance. It is the property of a conductor to resist the flow of charges through it. Its SI unit is ohm, represented by the Greek letter Ω.
If the potential difference across the two ends of a conductor is 1 V and the current through it is 1 A, then the resistance R of the conductor is 1 Ω.
From Ohm's law, we have: I = V / R.
Crucial insight: The current through a resistor is inversely proportional to its resistance. If the resistance is doubled, the current gets halved. In many practical cases it is necessary to increase or decrease the current in an electric circuit. A component used to regulate current without changing the voltage source is called variable resistance or rheostat.

Section 4.4: Factors on which Resistance of a Conductor Depends
Resistance of a uniform metallic conductor is directly proportional to its length (l) and inversely proportional to the area of cross-section (A):
R = ρ * (l / A), where ρ (rho) is electrical resistivity of the material.`
  },
  {
    id: 'cs-react',
    title: 'Modern Software Engineering: React Component Lifecycle, Hooks & State Management',
    subject: 'programming',
    content: `Chapter 7: React Declarative UI, State & Hook Mechanics

Section 7.1: Declarative vs Imperative UI
In imperative programming, you tell the computer how to change the DOM step-by-step (e.g. document.getElementById('btn').style.background = 'blue'). React utilizes declarative UI: you describe what the UI should look like for a given state, and React handles efficient DOM updates via reconciliation and the Virtual DOM.

Section 7.2: The useState Hook and Immutability
State represents data that changes over time and triggers component re-renders.
Syntax: const [count, setCount] = useState(initialValue);
Rule of Immutability: Never mutate state directly (e.g., state.items.push(newItem) will not trigger a reliable re-render). Always pass a new reference or state updater function: setCount(prev => prev + 1).

Section 7.3: The useEffect Hook and Side Effects
useEffect lets you synchronize a component with external systems such as network requests, timers, or manual DOM subscriptions.
Syntax: useEffect(() => { ... return () => cleanup(); }, [dependencies]);
Dependency Array Rules:
1. Empty array []: Runs once on mount and cleans up on unmount.
2. Values array [dep1, dep2]: Runs on mount and whenever dependencies change.
3. No array: Runs after every single render (often causes infinite loops if state is set inside).

Section 7.4: Component Rendering Cycle & Memoization
When state updates, React re-renders the component and all of its child components recursively by default. To prevent expensive recalculations, React provides useMemo (for memoizing computed values) and useCallback (for memoizing callback references).`
  },
  {
    id: 'bio-respiration',
    title: 'Cellular Biology: Mitochondria, ATP Synthesis and Cellular Respiration',
    subject: 'biology',
    content: `Chapter 3: Energy Currency of the Cell - Cellular Respiration

Section 3.1: Overview of Cellular Respiration
Cellular respiration is the biochemical pathway by which cells harvest energy stored in organic molecules (primarily glucose) to generate adenosine triphosphate (ATP).
Overall Equation: C6H12O6 + 6O2 → 6CO2 + 6H2O + ~30-32 ATP.

Section 3.2: Glycolysis in the Cytoplasm
Glycolysis is an anaerobic process taking place in the cytosol. One 6-carbon glucose molecule is broken down into two 3-carbon pyruvate molecules, yielding a net gain of 2 ATP and 2 NADH.

Section 3.3: The Citric Acid Cycle (Krebs Cycle) in Mitochondria
Pyruvate enters the mitochondrial matrix and is converted to Acetyl-CoA. Inside the matrix, the citric acid cycle oxidizes Acetyl-CoA to CO2, generating high-energy electron carriers: NADH and FADH2, plus 2 ATP/GTP.

Section 3.4: Oxidative Phosphorylation & ATP Synthase
The electron transport chain (ETC) is located in the inner mitochondrial membrane (cristae). Electrons from NADH and FADH2 pass through complexes I to IV, pumping protons (H+) into the intermembrane space, creating a steep electrochemical proton gradient (proton-motive force). Protons flow back into the matrix through the rotary motor enzyme ATP Synthase, driving the phosphorylation of ADP into ATP.`
  }
];

class RAGService {
  private chunks: RAGChunk[] = [];

  constructor() {
    this.indexSampleTextbooks();
  }

  // Pre-index built-in textbooks
  private indexSampleTextbooks() {
    SAMPLE_TEXTBOOKS.forEach(book => {
      this.indexDocument(book.title, book.content);
    });
  }

  // Index any document text into searchable chunks
  public indexDocument(docName: string, text: string): RAGChunk[] {
    const newChunks: RAGChunk[] = [];
    const sections = text.split(/(?=Section \d+|Chapter \d+|### |## )/gi);

    sections.forEach((section, index) => {
      const trimmed = section.trim();
      if (!trimmed) return;

      const lines = trimmed.split('\n');
      const sectionTitle = lines[0].replace(/^#+\s*/, '').trim();

      // Chunk long sections into ~450 char windows with overlap
      if (trimmed.length > 500) {
        const paragraphs = trimmed.split(/\n\s*\n/);
        paragraphs.forEach((p, pIdx) => {
          if (p.trim().length > 30) {
            newChunks.push({
              id: `${docName}-${index}-${pIdx}`,
              documentName: docName,
              sectionTitle: sectionTitle,
              content: p.trim(),
              pageNumber: Math.floor(index / 2) + 1
            });
          }
        });
      } else {
        newChunks.push({
          id: `${docName}-${index}`,
          documentName: docName,
          sectionTitle: sectionTitle,
          content: trimmed,
          pageNumber: Math.floor(index / 2) + 1
        });
      }
    });

    this.chunks.push(...newChunks);
    return newChunks;
  }

  // Search RAG index for grounding context using BM25-style keyword matching
  public search(query: string, limit: number = 3): GroundedSearchResult[] {
    if (!query || this.chunks.length === 0) return [];

    const queryTerms = query.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(t => t.length > 2);
    if (queryTerms.length === 0) return [];

    const results: GroundedSearchResult[] = [];

    this.chunks.forEach(chunk => {
      const lowerContent = chunk.content.toLowerCase();
      const lowerTitle = (chunk.sectionTitle || '').toLowerCase();
      let score = 0;

      queryTerms.forEach(term => {
        // Higher weight if in title
        if (lowerTitle.includes(term)) score += 5;
        // Frequency in body
        const matches = lowerContent.split(term).length - 1;
        score += matches * 2;
      });

      if (score > 0) {
        results.push({
          chunk,
          relevanceScore: score
        });
      }
    });

    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  // Parse text from uploaded PDF file using browser PDF.js
  public async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // @ts-ignore
      if (window.pdfjsLib) {
        // @ts-ignore
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items.map((item: any) => item.str);
          fullText += `\n--- Page ${i} ---\n` + pageStrings.join(' ');
        }
        return fullText;
      } else {
        // Fallback text decoder
        const text = await file.text();
        return text;
      }
    } catch (err) {
      console.warn("PDF extraction fallback:", err);
      return await file.text();
    }
  }

  public getAllIndexedChunks(): RAGChunk[] {
    return this.chunks;
  }

  public clearCustomChunks() {
    this.chunks = [];
    this.indexSampleTextbooks();
  }
}

export const ragService = new RAGService();
