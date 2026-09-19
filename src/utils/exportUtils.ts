import { MCQOption, MCQQuestionItem } from '../types';

/**
 * Generate TXT format export
 * Format:
 * 1-B
 * 2-
 * 3-A
 */
export function generateTxtExport(
  startQuestion: number,
  endQuestion: number,
  answers: Record<number, MCQOption>,
  importedQuestions?: MCQQuestionItem[]
): string {
  const lines: string[] = [];
  for (let q = startQuestion; q <= endQuestion; q++) {
    const raw = answers[q];
    const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
    
    // If questions are imported, append the selected option text for clarity
    if (importedQuestions && importedQuestions[q - 1]) {
      const item = importedQuestions[q - 1];
      let selectedText = '';
      if (ans === 'A') selectedText = ` (${item.optionA})`;
      else if (ans === 'B') selectedText = ` (${item.optionB})`;
      else if (ans === 'C') selectedText = ` (${item.optionC})`;
      else if (ans === 'D') selectedText = ` (${item.optionD})`;
      lines.push(`${q}-${ans}${selectedText}`);
    } else {
      lines.push(`${q}-${ans}`);
    }
  }
  return lines.join('\n');
}

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Generate CSV format export
 * If questions are imported:
 * Question No,Question,A,B,C,D,Selected Answer,Selected Text
 * Standard format:
 * Question,Answer
 */
export function generateCsvExport(
  startQuestion: number,
  endQuestion: number,
  answers: Record<number, MCQOption>,
  importedQuestions?: MCQQuestionItem[]
): string {
  if (importedQuestions && importedQuestions.length > 0) {
    const lines: string[] = ['Question No,Question,A,B,C,D,Selected Answer,Selected Text'];
    for (let q = startQuestion; q <= endQuestion; q++) {
      const raw = answers[q];
      const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
      const item = importedQuestions[q - 1];
      
      const qText = item ? item.questionText.replace(/\r?\n/g, ' ') : '';
      const optA = item ? item.optionA : '';
      const optB = item ? item.optionB : '';
      const optC = item ? item.optionC : '';
      const optD = item ? item.optionD : '';
      
      let selText = '';
      if (ans === 'A') selText = optA;
      else if (ans === 'B') selText = optB;
      else if (ans === 'C') selText = optC;
      else if (ans === 'D') selText = optD;

      lines.push(
        [
          q,
          escapeCsvCell(qText),
          escapeCsvCell(optA),
          escapeCsvCell(optB),
          escapeCsvCell(optC),
          escapeCsvCell(optD),
          ans,
          escapeCsvCell(selText),
        ].join(',')
      );
    }
    return lines.join('\n');
  }

  const lines: string[] = ['Question,Answer'];
  for (let q = startQuestion; q <= endQuestion; q++) {
    const raw = answers[q];
    const ans = raw === 'A' || raw === 'B' || raw === 'C' || raw === 'D' ? raw : '';
    lines.push(`${q},${ans}`);
  }
  return lines.join('\n');
}

/**
 * Trigger browser file download
 */
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
