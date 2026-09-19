package com.mcq.answerpad

import android.app.Application
import android.content.Context
import android.net.Uri
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import org.json.JSONArray
import org.json.JSONObject

data class MCQUiState(
    val startQuestion: Int = 1,
    val totalQuestions: Int = 500,
    val currentQuestion: Int = 1,
    val answers: Map<Int, String> = emptyMap(),
    val optionsCount: Int = 4,
    val importedQuestions: List<MCQItem> = emptyList(),
    val showUnansweredDialog: Boolean = false,
    val showExportDialog: Boolean = false,
    val showClearAllDialog: Boolean = false,
    val showSetupDialog: Boolean = false,
    val showImportDialog: Boolean = false,
    val showHelpDialog: Boolean = false,
    val importErrorMessage: String? = null,
    val importSuccessMessage: String? = null
) {
    val endQuestion: Int get() = if (importedQuestions.isNotEmpty()) importedQuestions.size else (startQuestion + totalQuestions - 1)
    val effectiveTotal: Int get() = if (importedQuestions.isNotEmpty()) importedQuestions.size else totalQuestions
    val answeredCount: Int get() = answers.count { it.key in startQuestion..endQuestion && it.value.isNotBlank() }
    val unansweredCount: Int get() = effectiveTotal - answeredCount
    val currentAnswer: String? get() = answers[currentQuestion]
    val currentMCQ: MCQItem? get() = if (importedQuestions.isNotEmpty()) importedQuestions.getOrNull(currentQuestion - 1) else null
    
    val unansweredList: List<Int> get() {
        val list = mutableListOf<Int>()
        for (q in startQuestion..endQuestion) {
            if (answers[q].isNullOrBlank()) {
                list.add(q)
            }
        }
        return list
    }
}

class MCQViewModel(application: Application) : AndroidViewModel(application) {
    private val prefs = application.getSharedPreferences("mcq_answer_pad_prefs", Context.MODE_PRIVATE)

    private val _uiState = MutableStateFlow(loadInitialState())
    val uiState: StateFlow<MCQUiState> = _uiState.asStateFlow()

    private fun loadInitialState(): MCQUiState {
        val importedList = mutableListOf<MCQItem>()
        val questionsJson = prefs.getString("questions_json", null)
        if (!questionsJson.isNullOrBlank()) {
            try {
                val jsonArr = JSONArray(questionsJson)
                for (i in 0 until jsonArr.length()) {
                    val obj = jsonArr.getJSONObject(i)
                    importedList.add(
                        MCQItem(
                            index = obj.optInt("index", i + 1),
                            questionText = obj.getString("question"),
                            optionA = obj.getString("A"),
                            optionB = obj.getString("B"),
                            optionC = obj.getString("C"),
                            optionD = obj.getString("D")
                        )
                    )
                }
            } catch (e: Exception) {
                // Ignore parse errors on saved cache
            }
        }

        val start = if (importedList.isNotEmpty()) 1 else prefs.getInt("start_question", 1)
        val total = if (importedList.isNotEmpty()) importedList.size else prefs.getInt("total_questions", 500)
        val current = prefs.getInt("current_question", start)
        val optionsCount = 4

        val answersMap = mutableMapOf<Int, String>()
        val answersJson = prefs.getString("answers_json", null)
        if (!answersJson.isNullOrBlank()) {
            try {
                val json = JSONObject(answersJson)
                val keys = json.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    val qNum = key.toIntOrNull()
                    if (qNum != null) {
                        answersMap[qNum] = json.getString(key)
                    }
                }
            } catch (e: Exception) {
                // ignore
            }
        }

        val end = if (importedList.isNotEmpty()) importedList.size else (start + total - 1)
        return MCQUiState(
            startQuestion = start,
            totalQuestions = total,
            currentQuestion = current.coerceIn(start, end),
            answers = answersMap,
            optionsCount = optionsCount,
            importedQuestions = importedList
        )
    }

    private fun persistState() {
        val state = _uiState.value
        val answersJson = JSONObject()
        state.answers.forEach { (q, ans) ->
            answersJson.put(q.toString(), ans)
        }

        val questionsJson = JSONArray()
        state.importedQuestions.forEach { q ->
            val obj = JSONObject()
            obj.put("index", q.index)
            obj.put("question", q.questionText)
            obj.put("A", q.optionA)
            obj.put("B", q.optionB)
            obj.put("C", q.optionC)
            obj.put("D", q.optionD)
            questionsJson.put(obj)
        }

        prefs.edit()
            .putInt("start_question", state.startQuestion)
            .putInt("total_questions", state.totalQuestions)
            .putInt("current_question", state.currentQuestion)
            .putInt("options_count", 4)
            .putString("answers_json", answersJson.toString())
            .putString("questions_json", questionsJson.toString())
            .apply()
    }

    fun answerCurrent(option: String) {
        if (option !in listOf("A", "B", "C", "D")) return
        _uiState.update { state ->
            val updated = state.answers.toMutableMap()
            updated[state.currentQuestion] = option
            val nextQ = if (state.currentQuestion < state.endQuestion) state.currentQuestion + 1 else state.currentQuestion
            state.copy(answers = updated, currentQuestion = nextQ)
        }
        persistState()
    }

    fun skipCurrent() {
        // Does NOT save skip as answer; leaves blank
        _uiState.update { state ->
            val nextQ = if (state.currentQuestion < state.endQuestion) state.currentQuestion + 1 else state.currentQuestion
            state.copy(currentQuestion = nextQ)
        }
        persistState()
    }

    fun nextQuestion() {
        _uiState.update { state ->
            if (state.currentQuestion < state.endQuestion) {
                state.copy(currentQuestion = state.currentQuestion + 1)
            } else state
        }
        persistState()
    }

    fun previousQuestion() {
        _uiState.update { state ->
            if (state.currentQuestion > state.startQuestion) {
                state.copy(currentQuestion = state.currentQuestion - 1)
            } else state
        }
        persistState()
    }

    fun jumpTo(questionNumber: Int) {
        _uiState.update { state ->
            val clamped = questionNumber.coerceIn(state.startQuestion, state.endQuestion)
            state.copy(currentQuestion = clamped, showUnansweredDialog = false)
        }
        persistState()
    }

    fun clearCurrentAnswer() {
        _uiState.update { state ->
            val updated = state.answers.toMutableMap()
            updated.remove(state.currentQuestion)
            state.copy(answers = updated)
        }
        persistState()
    }

    fun clearAllAnswers() {
        _uiState.update { state ->
            state.copy(
                answers = emptyMap(),
                currentQuestion = state.startQuestion,
                showClearAllDialog = false
            )
        }
        persistState()
    }

    fun updateRange(start: Int, total: Int, options: Int = 4) {
        val validStart = start.coerceAtLeast(1)
        val validTotal = total.coerceIn(1, 500)
        _uiState.update { state ->
            state.copy(
                importedQuestions = emptyList(), // revert to manual range if custom range set
                startQuestion = validStart,
                totalQuestions = validTotal,
                currentQuestion = validStart,
                optionsCount = 4,
                showSetupDialog = false
            )
        }
        persistState()
    }

    fun importTxtFromUri(context: Context, uri: Uri) {
        try {
            val content = context.contentResolver.openInputStream(uri)?.use { stream ->
                stream.bufferedReader(Charsets.UTF_8).readText()
            } ?: throw Exception("Could not open file from selected source.")
            importTxtContent(content)
        } catch (e: Exception) {
            _uiState.update { it.copy(importErrorMessage = "Failed to open file: ${e.localizedMessage}") }
        }
    }

    fun importTxtContent(content: String) {
        when (val result = MCQTxtParser.parse(content)) {
            is ParseResult.Success -> {
                _uiState.update { state ->
                    state.copy(
                        importedQuestions = result.questions,
                        startQuestion = 1,
                        totalQuestions = result.questions.size,
                        currentQuestion = 1,
                        answers = emptyMap(), // new questions start with fresh answer set
                        optionsCount = 4,
                        showImportDialog = false,
                        importErrorMessage = null,
                        importSuccessMessage = "Successfully imported ${result.questions.size} questions!"
                    )
                }
                persistState()
            }
            is ParseResult.Error -> {
                _uiState.update { it.copy(importErrorMessage = result.message) }
            }
        }
    }

    fun dismissImportError() = _uiState.update { it.copy(importErrorMessage = null) }
    fun dismissImportSuccess() = _uiState.update { it.copy(importSuccessMessage = null) }

    fun setUnansweredDialog(show: Boolean) = _uiState.update { it.copy(showUnansweredDialog = show) }
    fun setExportDialog(show: Boolean) = _uiState.update { it.copy(showExportDialog = show) }
    fun setClearAllDialog(show: Boolean) = _uiState.update { it.copy(showClearAllDialog = show) }
    fun setSetupDialog(show: Boolean) = _uiState.update { it.copy(showSetupDialog = show) }
    fun setImportDialog(show: Boolean) = _uiState.update { it.copy(showImportDialog = show, importErrorMessage = null) }
    fun setHelpDialog(show: Boolean) = _uiState.update { it.copy(showHelpDialog = show) }

    fun generateTxtExport(): String {
        val state = _uiState.value
        val sb = StringBuilder()
        val start = state.startQuestion
        val end = state.endQuestion

        for (q in start..end) {
            val ans = state.answers[q] ?: ""
            val valid = if (ans in listOf("A", "B", "C", "D")) ans else ""
            sb.append("$q-$valid\n")
        }
        return sb.toString().trimEnd()
    }

    fun generateCsvExport(): String {
        val state = _uiState.value
        val sb = StringBuilder("Question No,Question,A,B,C,D,Selected Answer,Selected Text\n")
        val start = state.startQuestion
        val end = state.endQuestion

        for (q in start..end) {
            val mcq = if (state.importedQuestions.isNotEmpty()) state.importedQuestions.getOrNull(q - 1) else null
            val ans = state.answers[q] ?: ""
            val validAns = if (ans in listOf("A", "B", "C", "D")) ans else ""

            val qText = mcq?.questionText ?: "Question $q"
            val optA = mcq?.optionA ?: ""
            val optB = mcq?.optionB ?: ""
            val optC = mcq?.optionC ?: ""
            val optD = mcq?.optionD ?: ""

            val selectedText = when (validAns) {
                "A" -> optA
                "B" -> optB
                "C" -> optC
                "D" -> optD
                else -> ""
            }

            sb.append(
                "${q},${escapeCsv(qText)},${escapeCsv(optA)},${escapeCsv(optB)},${escapeCsv(optC)},${escapeCsv(optD)},${escapeCsv(validAns)},${escapeCsv(selectedText)}\n"
            )
        }
        return sb.toString().trimEnd()
    }

    private fun escapeCsv(value: String): String {
        if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
            return "\"" + value.replace("\"", "\"\"") + "\""
        }
        return value
    }
}
