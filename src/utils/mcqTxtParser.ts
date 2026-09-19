import { MCQQuestionItem } from '../types';

export type ParseMCQResult =
  | { success: true; questions: MCQQuestionItem[] }
  | { success: false; error: string };

const startTagPattern = /^\[Q(\d+)\]\s*$/i;
const endTagPattern = /^\[\/Q(\d+)\]\s*$/i;

export function parseMCQTxt(content: string): ParseMCQResult {
  if (!content || !content.trim()) {
    return { success: false, error: 'The imported content is empty.' };
  }

  // Normalize line endings
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = normalized.split('\n');

  const questions: MCQQuestionItem[] = [];
  let currentBlockTag: string | null = null;
  let blockStartLine = 0;

  let questionText: string | null = null;
  let optionA: string | null = null;
  let optionB: string | null = null;
  let optionC: string | null = null;
  let optionD: string | null = null;
  let currentSection: 'Question' | 'A' | 'B' | 'C' | 'D' | null = null;

  for (let index = 0; index < lines.length; index++) {
    const lineNumber = index + 1;
    const rawLine = lines[index];
    const trimmedLine = rawLine.trim();

    if (currentBlockTag === null) {
      // Outside any question block
      if (trimmedLine.length === 0) continue;

      const startMatch = trimmedLine.match(startTagPattern);
      if (startMatch) {
        const qNum = startMatch[1];
        currentBlockTag = `[Q${qNum}]`;
        blockStartLine = lineNumber;
        questionText = null;
        optionA = null;
        optionB = null;
        optionC = null;
        optionD = null;
        currentSection = null;
      } else if (trimmedLine.startsWith('[') && /q/i.test(trimmedLine)) {
        return {
          success: false,
          error: `Line ${lineNumber}: Malformed question tag '${trimmedLine}'. Expected format: [Q1]`,
        };
      } else {
        return {
          success: false,
          error: `Line ${lineNumber}: Unexpected text outside question block: '${trimmedLine}'. Every question must start with [Q1], [Q2], etc.`,
        };
      }
    } else {
      // Inside a question block
      const endMatch = trimmedLine.match(endTagPattern);
      if (endMatch) {
        // Validate required fields
        if (!questionText || !questionText.trim()) {
          return {
            success: false,
            error: `Question block ${currentBlockTag} (started at line ${blockStartLine}): Missing 'Question:' text.`,
          };
        }
        if (!optionA || !optionA.trim()) {
          return {
            success: false,
            error: `Question block ${currentBlockTag} (started at line ${blockStartLine}): Missing 'A:' option.`,
          };
        }
        if (!optionB || !optionB.trim()) {
          return {
            success: false,
            error: `Question block ${currentBlockTag} (started at line ${blockStartLine}): Missing 'B:' option.`,
          };
        }
        if (!optionC || !optionC.trim()) {
          return {
            success: false,
            error: `Question block ${currentBlockTag} (started at line ${blockStartLine}): Missing 'C:' option.`,
          };
        }
        if (!optionD || !optionD.trim()) {
          return {
            success: false,
            error: `Question block ${currentBlockTag} (started at line ${blockStartLine}): Missing 'D:' option.`,
          };
        }

        questions.push({
          index: questions.length + 1,
          questionText: questionText.trim(),
          optionA: optionA.trim(),
          optionB: optionB.trim(),
          optionC: optionC.trim(),
          optionD: optionD.trim(),
        });

        currentBlockTag = null;
        currentSection = null;
      } else if (startTagPattern.test(trimmedLine)) {
        return {
          success: false,
          error: `Question block ${currentBlockTag} (started at line ${blockStartLine}): Block was not closed before new question block started at line ${lineNumber}.`,
        };
      } else if (/^Question:\s*/i.test(trimmedLine)) {
        const colonIndex = trimmedLine.indexOf(':');
        questionText = trimmedLine.substring(colonIndex + 1).trim();
        currentSection = 'Question';
      } else if (/^A:\s*/i.test(trimmedLine)) {
        const colonIndex = trimmedLine.indexOf(':');
        optionA = trimmedLine.substring(colonIndex + 1).trim();
        currentSection = 'A';
      } else if (/^B:\s*/i.test(trimmedLine)) {
        const colonIndex = trimmedLine.indexOf(':');
        optionB = trimmedLine.substring(colonIndex + 1).trim();
        currentSection = 'B';
      } else if (/^C:\s*/i.test(trimmedLine)) {
        const colonIndex = trimmedLine.indexOf(':');
        optionC = trimmedLine.substring(colonIndex + 1).trim();
        currentSection = 'C';
      } else if (/^D:\s*/i.test(trimmedLine)) {
        const colonIndex = trimmedLine.indexOf(':');
        optionD = trimmedLine.substring(colonIndex + 1).trim();
        currentSection = 'D';
      } else if (/^E:\s*/i.test(trimmedLine)) {
        return {
          success: false,
          error: `Question block ${currentBlockTag} (line ${lineNumber}): Option E is not allowed. Only options A, B, C, and D are supported.`,
        };
      } else if (/^(Correct\s+)?Answer:\s*/i.test(trimmedLine)) {
        return {
          success: false,
          error: `Question block ${currentBlockTag} (line ${lineNumber}): 'Answer:' line is not allowed. The app only records user-selected answers.`,
        };
      } else if (trimmedLine.length > 0) {
        // Continuation line for current section
        switch (currentSection) {
          case 'Question':
            questionText = (questionText ? questionText + '\n' : '') + trimmedLine;
            break;
          case 'A':
            optionA = (optionA ? optionA + ' ' : '') + trimmedLine;
            break;
          case 'B':
            optionB = (optionB ? optionB + ' ' : '') + trimmedLine;
            break;
          case 'C':
            optionC = (optionC ? optionC + ' ' : '') + trimmedLine;
            break;
          case 'D':
            optionD = (optionD ? optionD + ' ' : '') + trimmedLine;
            break;
          default:
            return {
              success: false,
              error: `Question block ${currentBlockTag} (line ${lineNumber}): Unrecognized line '${trimmedLine}'. Expected Question:, A:, B:, C:, or D:`,
            };
        }
      }
    }
  }

  if (currentBlockTag !== null) {
    const unclosedTag = currentBlockTag.replace(/[[\]]/g, '');
    return {
      success: false,
      error: `Question block ${currentBlockTag} (started at line ${blockStartLine}) is missing its closing tag [/${unclosedTag}].`,
    };
  }

  if (questions.length === 0) {
    return {
      success: false,
      error:
        'No valid question blocks found in file.\nExpected format:\n[Q1]\nQuestion: ...\nA: ...\nB: ...\nC: ...\nD: ...\n[/Q1]',
    };
  }

  return { success: true, questions };
}

export const SAMPLE_MCQ_TXT = `[Q1]
Question: भारत की राजधानी क्या है?
A: मुंबई
B: नई दिल्ली
C: कोलकाता
D: चेन्नई
[/Q1]

[Q2]
Question: Which planet in our Solar System is known as the Red Planet?
A: Earth
B: Mars
C: Jupiter
D: Venus
[/Q2]

[Q3]
Question: Water का chemical formula क्या है?
A: CO2
B: O2
C: H2O
D: NaCl
[/Q3]

[Q4]
Question: Who wrote the play "Romeo and Juliet"?
A: Charles Dickens
B: William Shakespeare
C: Jane Austen
D: Mark Twain
[/Q4]

[Q5]
Question: What is the primary function of chlorophyll in plant leaves?
A: Absorb sunlight for photosynthesis
B: Store water during droughts
C: Anchor the plant into the soil
D: Protect the leaves from insects
[/Q5]`;
