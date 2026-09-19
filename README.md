# MCQ Answer Pad - Native Android App

An OLED-friendly, tablet-optimized native Android application for practicing multiple-choice questions (MCQs) completely offline.

## TXT Import Format

You can import multiple MCQs at once using a standard UTF-8 `.txt` file using the **"Import MCQ TXT"** button in the app.

### Required Format

```text
[Q1]
Question: What is the capital of France?
A: Berlin
B: Madrid
C: Paris
D: Rome
[/Q1]

[Q2]
Question: Which planet is known as the Red Planet?
A: Earth
B: Mars
C: Jupiter
D: Venus
[/Q2]
```

### Multilingual Support (Hindi, Urdu, English, etc.)

```text
[Q1]
Question: भारत की राजधानी क्या है?
A: मुंबई
B: नई दिल्ली
C: कोलकाता
D: चेन्नई
[/Q1]

[Q2]
Question: پاکستان کا دارالحکومت کیا ہے؟
A: کراچی
B: اسلام آباد
C: لاہور
D: پشاور
[/Q2]
```

### Rules & Guidelines
1. **Block tags**: Each question begins with `[Q<number>]` and ends with `[/Q<number>]`.
2. **Exactly 4 options**: Each question must have `A:`, `B:`, `C:`, and `D:`. Option E is strictly not supported.
3. **No Answer Line**: There is NO correct-answer field. Do NOT include an `Answer:` line. The app records only the user's selected answer.
4. **Ordering**: Questions are imported in the order they appear in the file.
5. **Blank Lines**: Blank lines outside question blocks are ignored.
6. **Error Reporting**: If any block is missing required fields or tags, the app identifies the exact block instead of crashing.

## CSV Export Format

Exported CSV contains the following exact columns:

```csv
Question No,Question,A,B,C,D,Selected Answer,Selected Text
1,What is the capital of France?,Berlin,Madrid,Paris,Rome,C,Paris
2,Which planet is known as the Red Planet?,Earth,Mars,Jupiter,Venus,B,Mars
3,What is 2 + 2?,3,4,5,6,,
```

- Unanswered/skipped questions leave `Selected Answer` and `Selected Text` completely blank.
- Strictly NO correct answer column, calculation, or scoring is exported.
- Standard CSV escaping and UTF-8 encoding ensure proper rendering in Excel and Google Sheets.
