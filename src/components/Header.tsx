import React from 'react';
import { Settings, Share2, Trash2, ListOrdered, Download, Tablet, FileText } from 'lucide-react';
import { ActiveModal } from '../types';

interface HeaderProps {
  currentQuestion: number;
  startQuestion: number;
  endQuestion: number;
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  currentAnswer?: string;
  importedCount?: number;
  onOpenModal: (modal: ActiveModal) => void;
  isPWAInstallable: boolean;
  onInstallPWA: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentQuestion,
  startQuestion,
  endQuestion,
  totalQuestions,
  answeredCount,
  unansweredCount,
  currentAnswer,
  importedCount = 0,
  onOpenModal,
  isPWAInstallable,
  onInstallPWA,
}) => {
  const percent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <header className="w-full bg-slate-900 border-b border-slate-800 px-3 py-2 sm:px-4 sm:py-2.5 select-none shrink-0">
      {/* Top row: App title + Quick actions */}
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center font-black text-white text-base sm:text-lg shadow-sm shrink-0">
            M
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-white truncate">
                MCQ Answer Pad
              </h1>
              {importedCount > 0 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {importedCount} MCQs
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Offline Tablet & Mobile Companion
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Prominent Import MCQ TXT Button */}
          <button
            id="open-import-txt-btn"
            onClick={() => onOpenModal('importTxt')}
            className="flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg transition active:scale-95 shadow-sm shadow-emerald-950"
            title="Import MCQ Questions (.txt)"
          >
            <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0" />
            <span>{importedCount > 0 ? 'Change' : 'Import TXT'}</span>
          </button>

          {isPWAInstallable && (
            <button
              id="install-pwa-btn"
              onClick={onInstallPWA}
              className="p-1.5 sm:px-2.5 sm:py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition active:scale-95 flex items-center gap-1"
              title="Install App"
            >
              <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden md:inline">Install</span>
            </button>
          )}

          <button
            id="open-install-guide-btn"
            onClick={() => onOpenModal('androidInstall')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition active:scale-95 flex items-center gap-1 text-xs"
            title="Install APK"
          >
            <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
            <span className="hidden lg:inline">APK</span>
          </button>

          <button
            id="open-setup-btn"
            onClick={() => onOpenModal('setup')}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition active:scale-95"
            title="Question Range & Settings"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <button
            id="open-export-btn"
            onClick={() => onOpenModal('export')}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-lg border border-slate-700 transition active:scale-95 flex items-center gap-1 text-xs font-semibold"
            title="Export TXT / CSV"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            id="open-clear-all-btn"
            onClick={() => onOpenModal('clearConfirm')}
            className="p-1.5 sm:p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 bg-slate-800 rounded-lg border border-slate-700 transition active:scale-95"
            title="Clear all answers"
            aria-label="Clear all answers"
          >
            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Primary Status Card - Compact on mobile */}
      <div className="max-w-4xl mx-auto mt-2 sm:mt-2.5 bg-slate-950/80 rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-slate-800/80 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-1.5">
          {/* Current Question Display */}
          <div className="flex items-baseline gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs uppercase tracking-wider font-bold text-slate-400">
              Q.
            </span>
            <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {currentQuestion}
            </span>
            <span className="text-xs sm:text-base font-semibold text-slate-400">
              / {endQuestion}
            </span>
          </div>

          {/* Current saved answer badge */}
          <div>
            {currentAnswer ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400"></span>
                Saved: <strong className="text-emerald-200 text-sm sm:text-lg font-black">{currentAnswer}</strong>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl bg-slate-800/90 border border-slate-700 text-slate-400 text-[11px] sm:text-xs font-medium">
                Unanswered
              </span>
            )}
          </div>
        </div>

        {/* Stats Row & Unanswered trigger */}
        <div className="mt-1.5 sm:mt-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-400 text-[11px] sm:text-xs">Answered:</span>
              <strong className="text-emerald-400 font-bold text-xs sm:text-sm">{answeredCount}</strong>
            </div>

            <button
              id="unanswered-btn"
              onClick={() => onOpenModal('unanswered')}
              className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/70 border border-amber-600/40 text-amber-300 font-bold text-[11px] sm:text-xs transition active:scale-95"
              title="Click to view all unanswered questions and jump to them"
            >
              <ListOrdered className="w-3 h-3 text-amber-400" />
              <span>Unanswered:</span>
              <strong className="text-amber-400 font-black">{unansweredCount}</strong>
            </button>
          </div>

          <span className="text-slate-400 text-[11px] sm:text-xs font-medium">
            {percent}% done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-1.5 sm:mt-2 w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full rounded-full transition-all duration-200 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    </header>
  );
};
