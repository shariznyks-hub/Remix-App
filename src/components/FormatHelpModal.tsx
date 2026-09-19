import React, { useState } from 'react';
import { X, Copy, Check, Info, FileText } from 'lucide-react';
import { copyToClipboard } from '../utils/exportUtils';
import { SAMPLE_MCQ_TXT } from '../utils/mcqTxtParser';

interface FormatHelpModalProps {
  onClose: () => void;
}

export const FormatHelpModal: React.FC<FormatHelpModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(SAMPLE_MCQ_TXT);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-750 w-full max-w-xl max-h-[90vh] rounded-3xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">TXT Format Guide</h2>
              <p className="text-xs text-slate-400">Rules for importing questions into MCQ Answer Pad</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-xs sm:text-sm text-slate-300">
          {/* Rules list */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" />
              Strict Formatting Rules
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs leading-relaxed">
              <li>
                Each question block <strong>MUST</strong> start with <code className="text-blue-300 font-mono bg-slate-900 px-1 py-0.5 rounded">[Q1]</code>, <code className="text-blue-300 font-mono bg-slate-900 px-1 py-0.5 rounded">[Q2]</code> and end with <code className="text-blue-300 font-mono bg-slate-900 px-1 py-0.5 rounded">[/Q1]</code>, <code className="text-blue-300 font-mono bg-slate-900 px-1 py-0.5 rounded">[/Q2]</code>.
              </li>
              <li>
                Inside each block, exactly 5 lines are required: <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">Question:</code>, <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">A:</code>, <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">B:</code>, <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">C:</code>, and <code className="text-emerald-300 font-mono bg-slate-900 px-1 py-0.5 rounded">D:</code>.
              </li>
              <li>
                <strong>Strictly 4 options (A, B, C, D)</strong>. Option <code className="text-rose-300 font-mono bg-slate-900 px-1 py-0.5 rounded">E:</code> is rejected.
              </li>
              <li>
                <strong>Strictly NO answers</strong>. Do NOT include <code className="text-rose-300 font-mono bg-slate-900 px-1 py-0.5 rounded">Answer:</code> lines (the app is solely for recording test responses).
              </li>
              <li>
                Full <strong>Hindi, Urdu, English, bilingual, and math/science Unicode</strong> formatting is preserved.
              </li>
            </ul>
          </div>

          {/* Code example */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-white text-xs">Example Format (Click to Copy):</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Example'}</span>
              </button>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-2xl p-3 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{SAMPLE_MCQ_TXT}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
