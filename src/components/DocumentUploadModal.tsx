import React, { useState } from 'react';
import { ragService, SAMPLE_TEXTBOOKS } from '../services/ragService';
import { RAGChunk } from '../types';
import {
  UploadCloud,
  FileText,
  BookOpen,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  Search,
  Database
} from 'lucide-react';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentLoaded: (docName: string, text: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentLoaded
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'sample' | 'rag-explorer'>('sample');
  const [indexedChunks, setIndexedChunks] = useState<RAGChunk[]>(ragService.getAllIndexedChunks());
  const [searchQuery, setSearchQuery] = useState<string>('Ohm');

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      let extractedText = '';
      if (file.name.endsWith('.pdf')) {
        extractedText = await ragService.extractTextFromPDF(file);
      } else {
        extractedText = await file.text();
      }

      // Index into RAG vector/keyword search engine
      const chunks = ragService.indexDocument(file.name, extractedText);
      setIndexedChunks(ragService.getAllIndexedChunks());
      setIsProcessing(false);
      onDocumentLoaded(file.name, extractedText);
      onClose();
    } catch (err) {
      console.error("Upload parsing error:", err);
      setIsProcessing(false);
    }
  };

  const handleSelectSampleBook = (bookId: string) => {
    const book = SAMPLE_TEXTBOOKS.find(b => b.id === bookId);
    if (!book) return;

    onDocumentLoaded(book.title, book.content);
    onClose();
  };

  const filteredChunks = searchQuery
    ? ragService.search(searchQuery, 8).map(r => r.chunk)
    : indexedChunks.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-brand-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Knowledge Grounding & Document Processing (RAG)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('sample')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'sample'
                ? 'border-brand-500 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-Loaded Textbooks (1-Click)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-brand-500 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Upload Custom Document (PDF / DOCX / TXT)
          </button>
          <button
            onClick={() => setActiveTab('rag-explorer')}
            className={`pb-3 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'rag-explorer'
                ? 'border-brand-500 text-brand-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            RAG Chunk Explorer ({indexedChunks.length} chunks)
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: PRE-LOADED SAMPLES */}
          {activeTab === 'sample' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose a pre-indexed curriculum chapter to immediately verify the AI Teacher's comprehension, grounding, and teaching capabilities without uploading your own file:
              </p>

              <div className="grid grid-cols-1 gap-3">
                {SAMPLE_TEXTBOOKS.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleSelectSampleBook(book.id)}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-850 hover:border-brand-500/50 cursor-pointer transition flex items-start justify-between group shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-950 border border-brand-500/30 text-brand-400 shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white group-hover:text-brand-300 transition">
                          {book.title}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {book.content.slice(0, 180)}...
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-brand-400 opacity-0 group-hover:opacity-100 transition shrink-0 ml-2">
                      Teach this Chapter →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: UPLOAD CUSTOM FILE */}
          {activeTab === 'upload' && (
            <div>
              <label className="border-2 border-dashed border-slate-700 hover:border-brand-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer bg-slate-950/60 hover:bg-slate-950 transition group">
                <UploadCloud className="w-12 h-12 text-slate-500 group-hover:text-brand-400 transition mb-3" />
                <span className="text-sm font-bold text-white group-hover:text-brand-300">
                  {isProcessing ? 'Processing & Indexing Material...' : 'Click to Upload or Drag and Drop'}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  Supported formats: PDF, DOCX, TXT, Markdown, Lecture Notes
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt,.docx,.md,.json"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                  className="hidden"
                />
              </label>

              {isProcessing && (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-brand-300 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                  <span>Extracting sections, segmenting concepts, and indexing vectors...</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RAG CHUNK EXPLORER */}
          {activeTab === 'rag-explorer' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Test retrieval query (e.g. 'Ohm', 'Resistance', 'ATP', 'State')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-white placeholder-slate-500 flex-1 focus:outline-none"
                />
              </div>

              <div className="space-y-2.5 max-h-72 overflow-y-auto">
                {filteredChunks.map((chunk, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span className="font-semibold text-brand-300 truncate max-w-xs">{chunk.documentName}</span>
                      <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">
                        Page {chunk.pageNumber || 1}
                      </span>
                    </div>
                    {chunk.sectionTitle && (
                      <span className="text-amber-400 font-bold block mb-1">{chunk.sectionTitle}</span>
                    )}
                    <p className="text-slate-300 leading-relaxed">{chunk.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
