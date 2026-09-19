package com.mcq.answerpad

sealed class ParseResult {
    data class Success(val questions: List<MCQItem>) : ParseResult()
    data class Error(val message: String) : ParseResult()
}

object MCQTxtParser {

    private val startTagPattern = Regex("""^\[Q(\d+)\]\s*$""", RegexOption.IGNORE_CASE)
    private val endTagPattern = Regex("""^\[/Q(\d+)\]\s*$""", RegexOption.IGNORE_CASE)

    fun parse(content: String): ParseResult {
        if (content.isBlank()) {
            return ParseResult.Error("The imported file is empty.")
        }

        // Normalize line endings
        val normalized = content.replace("\r\n", "\n").replace("\r", "\n")
        val lines = normalized.split("\n")

        val questions = mutableListOf<MCQItem>()
        var currentBlockTag: String? = null
        var blockStartLine = 0

        var questionText: String? = null
        var optionA: String? = null
        var optionB: String? = null
        var optionC: String? = null
        var optionD: String? = null
        var currentSection: String? = null

        for ((index, rawLine) in lines.withIndex()) {
            val lineNumber = index + 1
            val trimmedLine = rawLine.trim()

            if (currentBlockTag == null) {
                // Outside any question block
                if (trimmedLine.isEmpty()) continue

                val startMatch = startTagPattern.find(trimmedLine)
                if (startMatch != null) {
                    val qNum = startMatch.groupValues[1]
                    currentBlockTag = "[Q$qNum]"
                    blockStartLine = lineNumber
                    questionText = null
                    optionA = null
                    optionB = null
                    optionC = null
                    optionD = null
                    currentSection = null
                } else if (trimmedLine.startsWith("[") && trimmedLine.contains("Q", ignoreCase = true)) {
                    return ParseResult.Error("Line $lineNumber: Malformed question tag '$trimmedLine'. Expected format: [Q1]")
                } else {
                    return ParseResult.Error("Line $lineNumber: Unexpected text outside question block: '$trimmedLine'. Questions must start with [Q1], [Q2], etc.")
                }
            } else {
                // Inside a question block
                val endMatch = endTagPattern.find(trimmedLine)
                if (endMatch != null) {
                    // Check for missing fields
                    if (questionText.isNullOrBlank()) {
                        return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine): Missing 'Question:' text.")
                    }
                    if (optionA.isNullOrBlank()) {
                        return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine): Missing 'A:' option.")
                    }
                    if (optionB.isNullOrBlank()) {
                        return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine): Missing 'B:' option.")
                    }
                    if (optionC.isNullOrBlank()) {
                        return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine): Missing 'C:' option.")
                    }
                    if (optionD.isNullOrBlank()) {
                        return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine): Missing 'D:' option.")
                    }

                    questions.add(
                        MCQItem(
                            index = questions.size + 1,
                            questionText = questionText.trim(),
                            optionA = optionA.trim(),
                            optionB = optionB.trim(),
                            optionC = optionC.trim(),
                            optionD = optionD.trim()
                        )
                    )

                    currentBlockTag = null
                    currentSection = null
                } else if (startTagPattern.find(trimmedLine) != null) {
                    return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine): Block was not closed before new question block started at line $lineNumber.")
                } else if (trimmedLine.startsWith("Question:", ignoreCase = true)) {
                    questionText = trimmedLine.substringAfter(":").trim()
                    currentSection = "Question"
                } else if (trimmedLine.startsWith("A:", ignoreCase = true)) {
                    optionA = trimmedLine.substringAfter(":").trim()
                    currentSection = "A"
                } else if (trimmedLine.startsWith("B:", ignoreCase = true)) {
                    optionB = trimmedLine.substringAfter(":").trim()
                    currentSection = "B"
                } else if (trimmedLine.startsWith("C:", ignoreCase = true)) {
                    optionC = trimmedLine.substringAfter(":").trim()
                    currentSection = "C"
                } else if (trimmedLine.startsWith("D:", ignoreCase = true)) {
                    optionD = trimmedLine.substringAfter(":").trim()
                    currentSection = "D"
                } else if (trimmedLine.startsWith("E:", ignoreCase = true)) {
                    return ParseResult.Error("Question block $currentBlockTag (line $lineNumber): Option E is not allowed. Only options A, B, C, and D are supported.")
                } else if (trimmedLine.startsWith("Answer:", ignoreCase = true) || trimmedLine.startsWith("Correct Answer:", ignoreCase = true)) {
                    return ParseResult.Error("Question block $currentBlockTag (line $lineNumber): 'Answer:' line is not allowed. The app only records user-selected answers.")
                } else if (trimmedLine.isNotEmpty()) {
                    // Multi-line continuation for current field if non-empty
                    when (currentSection) {
                        "Question" -> questionText = (questionText ?: "") + "\n" + trimmedLine
                        "A" -> optionA = (optionA ?: "") + " " + trimmedLine
                        "B" -> optionB = (optionB ?: "") + " " + trimmedLine
                        "C" -> optionC = (optionC ?: "") + " " + trimmedLine
                        "D" -> optionD = (optionD ?: "") + " " + trimmedLine
                        else -> {
                            return ParseResult.Error("Question block $currentBlockTag (line $lineNumber): Unrecognized line '$trimmedLine'. Expected Question:, A:, B:, C:, or D:")
                        }
                    }
                }
            }
        }

        if (currentBlockTag != null) {
            return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine) is missing its closing tag [/${currentBlockTag.removeSurrounding("[", "]")}].")
        }

        if (questions.isEmpty()) {
            return ParseResult.Error("No valid question blocks found in file.\nExpected format:\n[Q1]\nQuestion: ...\nA: ...\nB: ...\nC: ...\nD: ...\n[/Q1]")
        }

        return ParseResult.Success(questions)
    }
}
