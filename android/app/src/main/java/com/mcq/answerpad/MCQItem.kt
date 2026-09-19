package com.mcq.answerpad

/**
 * Data model for an MCQ question item.
 * NOTE: Strictly NO correct answer field exists.
 */
data class MCQItem(
    val index: Int,
    val questionText: String,
    val optionA: String,
    val optionB: String,
    val optionC: String,
    val optionD: String
)
