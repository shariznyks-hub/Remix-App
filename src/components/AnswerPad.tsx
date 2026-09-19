import React, { useEffect } from 'react';
import { Check, FastForward, FileText } from 'lucide-react';
import { MCQOption, MCQQuestionItem } from '../types';

interface AnswerPadProps {
  optionsCount?: number;
  currentAnswer?: MCQOption;
  activeQuestion?: MCQQuestionItem;
  currentQuestionNumber: number;
  onSelectOption: (option: MCQOption) => void;
  onSkip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenImport?: () => void;
}

const ALL_OPTIONS: MCQOption[] = ['A', 'B', 'C', 'D'];

export const AnswerPad: React.FC<AnswerPadProps> = ({
  currentAnswer,
  activeQuestion,
  currentQuestionNumber,
  onSelectOption,
  onSkip,
  onPrevious,
  onNext,
  onOpenImport,
}) => {
  const options = ALL_OPTIONS;

  const getOptionText = (opt: MCQOption): string | null => {
    if (!activeQuestion) return null;
    switch (opt) {
      case 'A':
        return activeQuestion.optionA;
      case 'B':
        return activeQuestion.optionB;
      case 'C':
        return activeQuestion.optionC;
      case 'D':
        return activeQuestion.optionD;
    }
  };

  // Tablet keyboard support (physical keyboard or Bluetooth remote)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if an input is focused
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') {
        e.preventDefault();
        onSelectOption('A');
      } else if (key === 'B' || key === '2') {
        e.preventDefault();
        onSelectOption('B');
      } else if (key === 'C' || key === '3') {
        e.preventDefault();
        onSelectOption('C');
      } else if (key === 'D' || key === '4') {
        e.preventDefault();
        onSelectOption('D');
      } else if (key === 'S' || key === ' ' || key === 'TAB') {
        e.preventDefault();
        onSkip();
      } else if (key === 'ARROWLEFT') {
        e.preventDefault();
        onPrevious();
      } else if (key === 'ARROWRIGHT') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectOption, onSkip, onPrevious, onNext]);

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 py-2 sm:py-3 flex flex-col flex-1 select-none">
      {/* If Questions are imported, display active Question Text card */}
      {activeQuestion ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-2 sm:mb-3 shadow-md shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[10px] sm:text-xs font-bold tracking-wider text-blue-400 bg-blue-950/70 border border-blue-800/50 px-2 py-0.5 rounded-full uppercase">
              Question {currentQuestionNumber}
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-400">
              TXT Question Paper
            </span>
          </div>
          <p className="text-sm sm:text-base md:text-lg font-medium text-white whitespace-pre-line leading-relaxed select-text">
            {activeQuestion.questionText}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/60 border border-slate-800/80 rounded-xl mb-2 text-xs text-slate-400 shrink-0">
          <span className="text-[11px] sm:text-xs">Numbered Answer Pad Mode</span>
          {onOpenImport && (
            <button
              onClick={onOpenImport}
              className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition text-[11px] sm:text-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Import MCQ (.txt)</span>
            </button>
          )}
        </div>
      )}

      {/* Primary A, B, C, D Answer Buttons */}
      <div className="flex flex-col gap-2 sm:gap-2.5 w-full flex-1 justify-center">
        {options.map((option) => {
          const isSelected = currentAnswer === option;
          const optionText = getOptionText(option);

          return (
            <button
              key={option}
              id={`option-btn-${option}`}
              onClick={() => onSelectOption(option)}
              className={`w-full min-h-[50px] sm:min-h-[62px] md:min-h-[72px] rounded-xl sm:rounded-2xl flex items-center justify-between px-3.5 sm:px-6 border-2 transition-all active:scale-[0.98] ${
                isSelected
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/30'
                  : 'bg-slate-900 hover:bg-slate-850 hover:border-slate-600 border-slate-750 text-slate-100 active:bg-slate-800'
              }`}
              aria-label={`Option ${option}${optionText ? `: ${optionText}` : ''}`}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Option Letter Badge */}
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                <span className={`w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-lg sm:text-xl md:text-2xl ${
                  isSelected
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'bg-slate-800 border border-slate-700 text-slate-200'
                }`}>
                  {option}
                </span>
                {isSelected && !optionText && (
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-blue-700/80 text-blue-100 border border-blue-400/40">
                    Selected
                  </span>
                )}
              </div>

              {/* Option Text if questions imported */}
              {optionText ? (
                <span className="flex-1 px-2.5 sm:px-4 text-left text-xs sm:text-sm md:text-base font-medium text-slate-100 line-clamp-3 leading-snug select-text">
                  {optionText}
                </span>
              ) : null}

              {/* Visual indicator on right side of button */}
              <div
                className={`w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center border-2 transition-all shrink-0 ${
                  isSelected
                    ? 'bg-white border-white text-blue-600'
                    : 'border-slate-700 bg-slate-950/60 text-slate-500'
                }`}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 stroke-[3]" />
                ) : (
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">{option}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Large SKIP Button (Clearly separated, directly under Option D, never overlaps) */}
      <div className="mt-2.5 sm:mt-3 mb-1 shrink-0">
        <button
          id="skip-btn"
          onClick={onSkip}
          className="w-full h-11 sm:h-13 md:h-14 rounded-xl sm:rounded-2xl bg-amber-950/40 hover:bg-amber-950/60 border-2 border-amber-500/80 hover:border-amber-400 text-amber-300 active:bg-amber-900/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2 sm:gap-3 font-black text-sm sm:text-lg md:text-xl tracking-widest shadow-md"
          aria-label="Skip question"
          style={{ touchAction: 'manipulation' }}
        >
          <FastForward className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-amber-400 stroke-[2.5]" />
          <span>SKIP QUESTION</span>
        </button>
      </div>
    </div>
  );
};
