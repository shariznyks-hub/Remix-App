package com.mcq.answerpad

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class MCQTxtParserTest {

    @Test
    fun testValidEnglishQuestions() {
        val txt = """
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
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Success)
        val questions = (result as ParseResult.Success).questions
        assertEquals(2, questions.size)

        assertEquals("What is the capital of France?", questions[0].questionText)
        assertEquals("Berlin", questions[0].optionA)
        assertEquals("Madrid", questions[0].optionB)
        assertEquals("Paris", questions[0].optionC)
        assertEquals("Rome", questions[0].optionD)

        assertEquals("Which planet is known as the Red Planet?", questions[1].questionText)
        assertEquals("Earth", questions[1].optionA)
        assertEquals("Mars", questions[1].optionB)
        assertEquals("Jupiter", questions[1].optionC)
        assertEquals("Venus", questions[1].optionD)
    }

    @Test
    fun testPromptHindiAndBilingualQuestions() {
        val txt = """
            [Q1]
            Question: भारत की राजधानी क्या है?
            A: मुंबई
            B: नई दिल्ली
            C: कोलकाता
            D: चेन्नई
            [/Q1]

            [Q2]
            Question: Water का chemical formula क्या है?
            A: CO2
            B: O2
            C: H2O
            D: NaCl
            [/Q2]
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Success)
        val questions = (result as ParseResult.Success).questions
        assertEquals(2, questions.size)

        assertEquals("भारत की राजधानी क्या है?", questions[0].questionText)
        assertEquals("मुंबई", questions[0].optionA)
        assertEquals("नई दिल्ली", questions[0].optionB)
        assertEquals("कोलकाता", questions[0].optionC)
        assertEquals("चेन्नई", questions[0].optionD)

        assertEquals("Water का chemical formula क्या है?", questions[1].questionText)
        assertEquals("CO2", questions[1].optionA)
        assertEquals("O2", questions[1].optionB)
        assertEquals("H2O", questions[1].optionC)
        assertEquals("NaCl", questions[1].optionD)
    }

    @Test
    fun testValidUrduUnicode() {
        val txt = """
            [Q1]
            Question: پاکستان کا دارالحکومت کیا ہے؟
            A: کراچی
            B: اسلام آباد
            C: لاہور
            D: پشاور
            [/Q1]
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Success)
        val questions = (result as ParseResult.Success).questions
        assertEquals(1, questions.size)
        assertEquals("پاکستان کا دارالحکومت کیا ہے؟", questions[0].questionText)
        assertEquals("اسلام آباد", questions[0].optionB)
    }

    @Test
    fun testMissingOptionError() {
        val txt = """
            [Q1]
            Question: Sample Question?
            A: Opt A
            B: Opt B
            C: Opt C
            [/Q1]
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Error)
        val error = (result as ParseResult.Error).message
        assertTrue(error.contains("[Q1]"))
        assertTrue(error.contains("Missing 'D:' option"))
    }

    @Test
    fun testOptionENotAllowed() {
        val txt = """
            [Q1]
            Question: Sample?
            A: 1
            B: 2
            C: 3
            D: 4
            E: 5
            [/Q1]
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Error)
        val error = (result as ParseResult.Error).message
        assertTrue(error.contains("Option E is not allowed"))
    }

    @Test
    fun testAnswerLineNotAllowed() {
        val txt = """
            [Q1]
            Question: Sample?
            A: 1
            B: 2
            C: 3
            D: 4
            Answer: C
            [/Q1]
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Error)
        val error = (result as ParseResult.Error).message
        assertTrue(error.contains("'Answer:' line is not allowed"))
    }

    @Test
    fun testMultilineQuestionAndOptions() {
        val txt = """
            [Q1]
            Question: Consider the following statement:
            All humans are mortal.
            Socrates is a human.
            What follows?
            A: Socrates is immortal
            B: Socrates is mortal
            C: None of the above
            D: Both A and B
            [/Q1]
        """.trimIndent()

        val result = MCQTxtParser.parse(txt)
        assertTrue(result is ParseResult.Success)
        val q = (result as ParseResult.Success).questions[0]
        assertTrue(q.questionText.contains("All humans are mortal."))
        assertTrue(q.questionText.contains("Socrates is a human."))
        assertEquals("Socrates is mortal", q.optionB)
    }
}
