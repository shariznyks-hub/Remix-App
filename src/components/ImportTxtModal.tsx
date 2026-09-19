import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle2, HelpCircle, Sparkles } from 'lucide-react';
import { MCQQuestionItem } from '../types';
import { parseMCQTxt, SAMPLE_MCQ_TXT } from '../utils/mcqTxtParser';

interface ImportTxtModalProps {
  onImport: (questions: MCQQuestionItem[]) => void;
  onOpenHelp: () => void;
  onClose: () => void;
  currentlyImportedCount?: number;
  onClearImported?: () => void;
}

export const ImportTxtModal: React.FC<ImportTxtModalProps> = ({
  onImport,
  onOpenHelp,
  onClose,
  currentlyImportedCount = 0,
  onClearImported,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedQuestions, setParsedQuestions] = useState<MCQQuestionItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (text: string) => {
    setPastedText(text);
    setErrorMessage(null);
    if (!text.trim()) {
      setParsedQuestions(null);
      return;
    }
    const result = parseMCQTxt(text);
    if (result.success) {
      setParsedQuestions(result.questions);
      setErrorMessage(null);
    } else {
      setParsedQuestions(null);
      setErrorMessage(result.error);
    }
  };

  const handleFileSelect = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      setPastedText(content);
      const result = parseMCQTxt(content);
      if (result.success) {
        setParsedQuestions(result.questions);
        setErrorMessage(null);
      } else {
        setParsedQuestions(null);
        setErrorMessage(result.error);
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file. Ensure it is a valid UTF-8 text file.');
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSample = () => {
    handleTextChange(SAMPLE_MCQ_TXT);
    setActiveTab('paste');
  };

  const handleConfirmImport = () => {
    if (parsedQuestions && parsedQuestions.length > 0) {
      onImport(parsedQuestions);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-2xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Import MCQ Questions (.txt)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Load full questions with options A, B, C, D from formatted TXT
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenHelp}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
              title="View format guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Format Help</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Existing imported status banner */}
        {currentlyImportedCount > 0 && (
          <div className="px-5 py-2.5 bg-blue-950/40 border-b border-blue-900/40 flex items-center justify-between text-xs">
            <span className="text-blue-300">
              Currently using <strong>{currentlyImportedCount}</strong> imported questions.
            </span>
            {onClearImported && (
              <button
                onClick={() => {
                  onClearImported();
                  onClose();
                }}
                className="text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2"
              >
                Revert to Blank Answer Pad
              </button>
            )}
          </div>
        )}

        {/* Tab Controls & Sample Action */}
        <div className="p-3 sm:px-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              id="tab-paste-btn"
              onClick={() => setActiveTab('paste')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'paste'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              Paste Text Directly
            </button>
            <button
              id="tab-upload-btn"
              onClick={() => setActiveTab('upload')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-850 text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload .txt File</span>
            </button>
          </div>

          <button
            id="load-sample-btn"
            onClick={handleLoadSample}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 transition active:scale-95"
            title="Load sample English & Hindi questions to test"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Load Sample MCQs</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-3">
          {activeTab === 'upload' ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 hover:bg-slate-950 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition min-h-[180px]"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,text/plain"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelect(e.target.files[0]);
                  }
                }}
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-white">
                {fileName ? fileName : 'Choose a .txt file or drag & drop here'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Plain text file formatted with [Q1]...[/Q1] tags (UTF-8 supported)
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-[220px]">
              <label htmlFor="mcq-paste-area" className="text-xs font-semibold text-slate-400 mb-1.5 flex justify-between items-center">
                <span>Paste your formatted questions below:</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  [Q1] Question: ... A: ... B: ... C: ... D: ... [/Q1]
                </span>
              </label>
              <textarea
                id="mcq-paste-area"
                value={pastedText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={`[Q1]\nQuestion: भारत की राजधानी क्या है?\nA: मुंबई\nB: नई दिल्ली\nC: कोलकाता\nD: चेन्नई\n[/Q1]\n\n[Q2]\nQuestion: Water का chemical formula क्या है?\nA: CO2\nB: O2\nC: H2O\nD: NaCl\n[/Q2]`}
                className="w-full flex-1 min-h-[200px] bg-slate-950 border border-slate-800 rounded-2xl p-3.5 font-mono text-xs sm:text-sm text-slate-200 focus:outline-none focus:border-blue-500 leading-relaxed resize-none"
                spellCheck={false}
              />
            </div>
          )}

          {/* Validation Feedback */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-600/50 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-bold text-rose-200 block mb-0.5">Format Error</strong>
                <p className="whitespace-pre-line leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {parsedQuestions && (
            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="font-bold text-emerald-300 block mb-0.5">
                  Ready to Import: {parsedQuestions.length} Questions Detected
                </strong>
                <p className="text-slate-300 line-clamp-2">
                  Q1: {parsedQuestions[0].questionText} (A: {parsedQuestions[0].optionA}, B: {parsedQuestions[0].optionB}...)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold border border-slate-700 transition"
          >
            Cancel
          </button>

          <button
            id="confirm-import-btn"
            onClick={handleConfirmImport}
            disabled={!parsedQuestions || parsedQuestions.length === 0}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition shadow-md ${
              parsedQuestions && parsedQuestions.length > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {parsedQuestions
                ? `Import ${parsedQuestions.length} Questions`
                : 'Import Questions'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
