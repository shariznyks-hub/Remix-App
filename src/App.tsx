import React, { useState } from 'react';
import { useMCQState } from './hooks/useMCQState';
import { usePWAInstall } from './hooks/usePWAInstall';
import { Header } from './components/Header';
import { AnswerPad } from './components/AnswerPad';
import { NavigationControls } from './components/NavigationControls';
import { UnansweredModal } from './components/UnansweredModal';
import { ExportModal } from './components/ExportModal';
import { SetupModal } from './components/SetupModal';
import { ClearConfirmModal } from './components/ClearConfirmModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { ImportTxtModal } from './components/ImportTxtModal';
import { FormatHelpModal } from './components/FormatHelpModal';
import { ActiveModal } from './types';

export default function App() {
  const {
    startQuestion,
    totalQuestions,
    endQuestion,
    currentQuestion,
    optionsCount,
    answers,
    importedQuestions,
    activeQuestionItem,
    stats,
    answerCurrent,
    skipCurrent,
    goToNext,
    goToPrevious,
    jumpToQuestion,
    clearCurrentAnswer,
    clearAllAnswers,
    importQuestions,
    clearImportedQuestions,
    updateRange,
  } = useMCQState();

  const { isInstallable, install } = usePWAInstall();
  const [activeModal, setActiveModal] = useState<ActiveModal>('none');

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-slate-950 text-slate-100 font-sans select-none overflow-hidden">
      {/* Header with Title, Status & Counters */}
      <Header
        currentQuestion={currentQuestion}
        startQuestion={startQuestion}
        endQuestion={endQuestion}
        totalQuestions={totalQuestions}
        answeredCount={stats.answeredCount}
        unansweredCount={stats.unansweredCount}
        currentAnswer={stats.currentAnswer}
        importedCount={importedQuestions.length}
        onOpenModal={setActiveModal}
        isPWAInstallable={isInstallable}
        onInstallPWA={install}
      />

      {/* Primary MCQ Buttons & Skip (Dominates vertical height, smooth scroll on mobile if needed) */}
      <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col justify-start">
        <AnswerPad
          optionsCount={optionsCount}
          currentAnswer={stats.currentAnswer}
          activeQuestion={activeQuestionItem}
          currentQuestionNumber={currentQuestion}
          onSelectOption={answerCurrent}
          onSkip={skipCurrent}
          onPrevious={goToPrevious}
          onNext={goToNext}
          onOpenImport={() => setActiveModal('importTxt')}
        />
      </main>

      {/* Bottom Navigation (Prev, Jump, Clear Ans, Next) */}
      <NavigationControls
        currentQuestion={currentQuestion}
        startQuestion={startQuestion}
        endQuestion={endQuestion}
        hasAnswer={stats.hasAnswer}
        onPrevious={goToPrevious}
        onNext={goToNext}
        onClearCurrentAnswer={clearCurrentAnswer}
        onJumpTo={jumpToQuestion}
      />

      {/* Modals & Dialogs */}
      {activeModal === 'importTxt' && (
        <ImportTxtModal
          currentlyImportedCount={importedQuestions.length}
          onImport={importQuestions}
          onClearImported={clearImportedQuestions}
          onOpenHelp={() => setActiveModal('formatHelp')}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'formatHelp' && (
        <FormatHelpModal onClose={() => setActiveModal('none')} />
      )}

      {activeModal === 'unanswered' && (
        <UnansweredModal
          unansweredList={stats.unansweredList}
          onJumpTo={jumpToQuestion}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'export' && (
        <ExportModal
          startQuestion={startQuestion}
          endQuestion={endQuestion}
          answers={answers}
          importedQuestions={importedQuestions}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'setup' && (
        <SetupModal
          currentStart={startQuestion}
          currentTotal={totalQuestions}
          currentOptionsCount={optionsCount}
          onSave={updateRange}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'clearConfirm' && (
        <ClearConfirmModal
          answeredCount={stats.answeredCount}
          onConfirm={clearAllAnswers}
          onClose={() => setActiveModal('none')}
        />
      )}

      {activeModal === 'androidInstall' && (
        <AndroidInstallModal
          isPWAInstallable={isInstallable}
          onInstallPWA={install}
          onClose={() => setActiveModal('none')}
        />
      )}
    </div>
  );
}
