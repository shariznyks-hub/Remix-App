package com.mcq.answerpad.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.mcq.answerpad.MCQViewModel
import com.mcq.answerpad.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MCQScreen(viewModel: MCQViewModel) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // Standard Android File Picker launcher for .txt files
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) {
            viewModel.importTxtFromUri(context, uri)
        }
    }

    // Handle toast messages
    LaunchedEffect(state.importSuccessMessage) {
        state.importSuccessMessage?.let {
            Toast.makeText(context, it, Toast.LENGTH_LONG).show()
            viewModel.dismissImportSuccess()
        }
    }

    val options = listOf("A", "B", "C", "D")
    var showMenu by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "MCQ Answer Pad",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                        if (state.importedQuestions.isNotEmpty()) {
                            Text(
                                text = "Imported MCQ (${state.importedQuestions.size} Qs)",
                                fontSize = 11.sp,
                                color = EmeraldAccent,
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                },
                actions = {
                    // Import MCQ TXT button
                    IconButton(
                        onClick = { viewModel.setImportDialog(true) }
                    ) {
                        Icon(Icons.Default.FileOpen, contentDescription = "Import MCQ TXT")
                    }
                    // Export button
                    IconButton(onClick = { viewModel.setExportDialog(true) }) {
                        Icon(Icons.Default.Share, contentDescription = "Export")
                    }
                    // Overflow menu for Range, Help, Clear All
                    Box {
                        IconButton(onClick = { showMenu = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "More Options")
                        }
                        DropdownMenu(
                            expanded = showMenu,
                            onDismissRequest = { showMenu = false },
                            modifier = Modifier.background(Slate900)
                        ) {
                            DropdownMenuItem(
                                text = { Text("Range Settings", color = Slate100) },
                                leadingIcon = { Icon(Icons.Default.Tune, contentDescription = null, tint = BlueAccent) },
                                onClick = {
                                    showMenu = false
                                    viewModel.setSetupDialog(true)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("TXT Format Help", color = Slate100) },
                                leadingIcon = { Icon(Icons.Default.HelpOutline, contentDescription = null, tint = EmeraldAccent) },
                                onClick = {
                                    showMenu = false
                                    viewModel.setHelpDialog(true)
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("Clear All Answers", color = RoseClear) },
                                leadingIcon = { Icon(Icons.Default.DeleteSweep, contentDescription = null, tint = RoseClear) },
                                onClick = {
                                    showMenu = false
                                    viewModel.setClearAllDialog(true)
                                }
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Slate900,
                    titleContentColor = Slate100,
                    actionIconContentColor = Slate100
                )
            )
        },
        bottomBar = {
            Surface(
                color = Slate900,
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 8.dp)
                        .navigationBarsPadding()
                ) {
                    // Quick Question Jump Strip (Horizontal Scroll)
                    LazyRow(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        items(state.endQuestion - state.startQuestion + 1) { index ->
                            val qNum = state.startQuestion + index
                            val isCurrent = state.currentQuestion == qNum
                            val isAnswered = !state.answers[qNum].isNullOrBlank()
                            val chipColor = when {
                                isCurrent -> BlueAccent
                                isAnswered -> EmeraldAccent.copy(alpha = 0.25f)
                                else -> Slate800
                            }
                            val textColor = when {
                                isCurrent -> Color.White
                                isAnswered -> EmeraldAccent
                                else -> Slate400
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = chipColor,
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isCurrent) Color.White else if (isAnswered) EmeraldAccent else Slate700
                                ),
                                modifier = Modifier
                                    .height(32.dp)
                                    .clickable { viewModel.jumpTo(qNum) }
                            ) {
                                Box(
                                    modifier = Modifier.padding(horizontal = 10.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "$qNum",
                                        fontSize = 13.sp,
                                        fontWeight = if (isCurrent) FontWeight.Black else FontWeight.Bold,
                                        color = textColor
                                    )
                                }
                            }
                        }
                    }

                    // Bottom Navigation Buttons: Prev, Clear, Skip, Next
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // PREV Button
                        Button(
                            onClick = { viewModel.previousQuestion() },
                            enabled = state.currentQuestion > state.startQuestion,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Slate800,
                                contentColor = Slate100,
                                disabledContainerColor = Slate800.copy(alpha = 0.4f),
                                disabledContentColor = Slate700
                            ),
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Prev", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Prev", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }

                        // CLEAR ANSWER Button
                        Button(
                            onClick = { viewModel.clearCurrentAnswer() },
                            enabled = !state.currentAnswer.isNullOrBlank(),
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = RoseClear.copy(alpha = 0.15f),
                                contentColor = RoseClear,
                                disabledContainerColor = Slate800.copy(alpha = 0.4f),
                                disabledContentColor = Slate700
                            ),
                            border = androidx.compose.foundation.BorderStroke(
                                1.dp,
                                if (!state.currentAnswer.isNullOrBlank()) RoseClear.copy(alpha = 0.5f) else Slate700
                            ),
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Icon(Icons.Default.Clear, contentDescription = "Clear", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(3.dp))
                            Text("Clear", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        }

                        // SKIP Button (Amber, Tactile)
                        Button(
                            onClick = { viewModel.skipCurrent() },
                            modifier = Modifier
                                .weight(1.1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = AmberSkip.copy(alpha = 0.2f),
                                contentColor = AmberSkip
                            ),
                            border = androidx.compose.foundation.BorderStroke(1.5.dp, AmberSkip),
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Icon(Icons.Default.Redo, contentDescription = "Skip", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("SKIP", fontSize = 14.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        }

                        // NEXT Button (Blue Accent)
                        Button(
                            onClick = { viewModel.nextQuestion() },
                            enabled = state.currentQuestion < state.endQuestion,
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = BlueAccent,
                                contentColor = Color.White,
                                disabledContainerColor = Slate800.copy(alpha = 0.4f),
                                disabledContentColor = Slate700
                            ),
                            contentPadding = PaddingValues(horizontal = 6.dp)
                        ) {
                            Text("Next", fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.width(4.dp))
                            Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = "Next", modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        },
        containerColor = Slate950
    ) { paddingValues ->
        // MAIN SCROLLABLE CONTENT (QUESTION + MULTI-LINE SENTENCE CHOICES)
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 14.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // PROGRESS & STATS CARD (INCLUDING QUESTION TEXT IF IMPORTED)
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Slate900),
                shape = RoundedCornerShape(16.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Question ${state.currentQuestion} / ${state.endQuestion}",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = BlueAccent
                        )

                        // Current saved answer badge
                        if (!state.currentAnswer.isNullOrBlank()) {
                            Surface(
                                color = EmeraldAccent.copy(alpha = 0.2f),
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(1.5.dp, EmeraldAccent)
                            ) {
                                Text(
                                    text = "Saved: ${state.currentAnswer?.lowercase()}",
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = EmeraldAccent
                                )
                            }
                        } else {
                            Surface(
                                color = Slate800,
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Text(
                                    text = "Unanswered",
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp),
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 13.sp,
                                    color = Slate400
                                )
                            }
                        }
                    }

                    // QUESTION TEXT DISPLAY (When MCQ items are loaded)
                    val currentMCQ = state.currentMCQ
                    if (currentMCQ != null) {
                        Spacer(modifier = Modifier.height(10.dp))
                        Surface(
                            color = Slate950,
                            shape = RoundedCornerShape(12.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = currentMCQ.questionText,
                                modifier = Modifier.padding(14.dp),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate100,
                                lineHeight = 24.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Answered: ${state.answeredCount}",
                            color = EmeraldAccent,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp
                        )
                        Button(
                            onClick = { viewModel.setUnansweredDialog(true) },
                            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
                            shape = RoundedCornerShape(10.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 3.dp)
                        ) {
                            Text(
                                text = "Unanswered: ${state.unansweredCount}",
                                color = AmberSkip,
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    val progress = if (state.effectiveTotal > 0) state.answeredCount.toFloat() / state.effectiveTotal else 0f
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = BlueAccent,
                        trackColor = Slate800
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // MAIN MCQ BUTTONS: Exactly FOUR options A, B, C, D (EXPANDABLE FOR FULL SENTENCES)
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val currentMCQ = state.currentMCQ
                options.forEach { opt ->
                    val isSelected = state.currentAnswer == opt
                    val optText = when (opt) {
                        "A" -> currentMCQ?.optionA
                        "B" -> currentMCQ?.optionB
                        "C" -> currentMCQ?.optionC
                        "D" -> currentMCQ?.optionD
                        else -> null
                    }

                    Button(
                        onClick = { viewModel.answerCurrent(opt) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .defaultMinSize(minHeight = 58.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (isSelected) BlueSelected else Slate900,
                            contentColor = if (isSelected) Color.White else Slate100
                        ),
                        border = androidx.compose.foundation.BorderStroke(
                            width = if (isSelected) 2.5.dp else 1.5.dp,
                            color = if (isSelected) BlueAccent else Slate800
                        ),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Start,
                            verticalAlignment = Alignment.Top
                        ) {
                            // Large tactile badge for Option Letter
                            Surface(
                                color = if (isSelected) BlueAccent else Slate800,
                                shape = RoundedCornerShape(10.dp),
                                border = androidx.compose.foundation.BorderStroke(
                                    1.dp,
                                    if (isSelected) Color.White.copy(alpha = 0.5f) else Slate700
                                ),
                                modifier = Modifier.size(if (optText != null) 36.dp else 48.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = opt,
                                        fontSize = if (optText != null) 18.sp else 24.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }
                            }

                            if (optText != null) {
                                Spacer(modifier = Modifier.width(12.dp))
                                // Option full sentence text (auto-wraps to as many lines as needed, never cut off!)
                                Text(
                                    text = optText,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = if (isSelected) Color.White else Slate100,
                                    modifier = Modifier
                                        .weight(1f)
                                        .padding(top = 4.dp),
                                    textAlign = TextAlign.Start,
                                    lineHeight = 22.sp,
                                    softWrap = true
                                )
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }

                            if (isSelected) {
                                Spacer(modifier = Modifier.width(8.dp))
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = Color.White,
                                    modifier = Modifier
                                        .size(24.dp)
                                        .padding(top = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))
        }
    }

    // IMPORT MCQ TXT DIALOG
    if (state.showImportDialog) {
        var pastedText by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { viewModel.setImportDialog(false) },
            containerColor = Slate900,
            title = {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(Icons.Default.FileOpen, contentDescription = null, tint = BlueAccent)
                    Text(
                        text = "Import MCQ TXT",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Import a plain UTF-8 .txt file containing MCQ questions (supports English, Hindi, Urdu, etc.):",
                        fontSize = 13.sp,
                        color = Slate400
                    )

                    // Choose file button (Standard Android File Picker)
                    Button(
                        onClick = { filePickerLauncher.launch("text/plain") },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = BlueAccent)
                    ) {
                        Icon(Icons.Default.UploadFile, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Select .TXT File from Device", fontWeight = FontWeight.Bold)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        HorizontalDivider(modifier = Modifier.weight(1f), color = Slate700)
                        Text(
                            text = " OR PASTE TXT ",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Slate400,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        HorizontalDivider(modifier = Modifier.weight(1f), color = Slate700)
                    }

                    OutlinedTextField(
                        value = pastedText,
                        onValueChange = { pastedText = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(150.dp),
                        placeholder = {
                            Text(
                                "[Q1]\nQuestion: What is the capital of France?\nA: Berlin\nB: Madrid\nC: Paris\nD: Rome\n[/Q1]",
                                fontSize = 12.sp,
                                color = Slate700
                            )
                        },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedBorderColor = BlueAccent,
                            unfocusedBorderColor = Slate700,
                            focusedContainerColor = Slate950,
                            unfocusedContainerColor = Slate950
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TextButton(
                            onClick = {
                                pastedText = """
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

[Q3]
Question: Which planet is known as the Red Planet?
A: Earth
B: Mars
C: Jupiter
D: Venus
[/Q3]
""".trimIndent()
                            }
                        ) {
                            Text("Load Sample MCQ", color = AmberSkip, fontSize = 12.sp)
                        }

                        TextButton(onClick = { viewModel.setHelpDialog(true) }) {
                            Text("Format Help", color = BlueAccent, fontSize = 12.sp)
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (pastedText.isNotBlank()) {
                            viewModel.importTxtContent(pastedText)
                        }
                    },
                    enabled = pastedText.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                ) {
                    Text("Import Pasted TXT", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setImportDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }

    // ERROR DIALOG (When import encounters any syntax/missing field error)
    if (state.importErrorMessage != null) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissImportError() },
            containerColor = Slate900,
            icon = {
                Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = RoseClear, modifier = Modifier.size(36.dp))
            },
            title = {
                Text(
                    text = "Import Error",
                    fontWeight = FontWeight.Bold,
                    color = RoseClear,
                    fontSize = 18.sp
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = state.importErrorMessage ?: "Unknown error occurred.",
                        color = Slate100,
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )
                    Text(
                        text = "Please check the question block mentioned above and ensure all fields (Question:, A:, B:, C:, D:) exist without missing closing tags.",
                        color = Slate400,
                        fontSize = 12.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.dismissImportError() },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseClear)
                ) {
                    Text("OK", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // TXT FORMAT HELP DIALOG
    if (state.showHelpDialog) {
        val sampleHelp = """
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

        AlertDialog(
            onDismissRequest = { viewModel.setHelpDialog(false) },
            containerColor = Slate900,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Icon(Icons.Default.HelpOutline, contentDescription = null, tint = BlueAccent)
                    Text("TXT Format Help", fontWeight = FontWeight.Bold, color = Slate100, fontSize = 20.sp)
                }
            },
            text = {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Each question must be enclosed in [Q<number>] and [/Q<number>] tags with exactly four options (A, B, C, D).",
                        fontSize = 13.sp,
                        color = Slate300
                    )

                    Surface(
                        color = Slate950,
                        shape = RoundedCornerShape(8.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text(
                            text = sampleHelp,
                            modifier = Modifier.padding(12.dp),
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp,
                            color = EmeraldAccent
                        )
                    }

                    Text(
                        text = "• Exactly 4 choices: A, B, C, D (Never E)\n• Strictly NO Answer / Correct Answer line\n• Supports UTF-8 (Hindi, Urdu, English)\n• Questions are imported in the order they appear",
                        fontSize = 12.sp,
                        color = Slate400,
                        lineHeight = 18.sp
                    )
                }
            },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("Sample MCQ Format", sampleHelp))
                            Toast.makeText(context, "Sample format copied!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                    ) {
                        Text("Copy Sample", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    TextButton(onClick = { viewModel.setHelpDialog(false) }) {
                        Text("Close", color = Slate400)
                    }
                }
            }
        )
    }

    // UNANSWERED QUESTIONS DIALOG
    if (state.showUnansweredDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setUnansweredDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Unanswered Questions (${state.unansweredCount})",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                if (state.unansweredList.isEmpty()) {
                    Text(
                        "All questions in range have been answered!",
                        color = EmeraldAccent,
                        fontSize = 16.sp
                    )
                } else {
                    LazyVerticalGrid(
                        columns = GridCells.Adaptive(minSize = 60.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .heightIn(max = 380.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(state.unansweredList) { qNum ->
                            Box(
                                modifier = Modifier
                                    .size(52.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Slate800)
                                    .border(1.dp, Slate700, RoundedCornerShape(12.dp))
                                    .clickable { viewModel.jumpTo(qNum) },
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = qNum.toString(),
                                    color = AmberSkip,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { viewModel.setUnansweredDialog(false) }) {
                    Text("Close", color = BlueAccent, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // EXPORT DIALOG
    if (state.showExportDialog) {
        var selectedFormat by remember { mutableStateOf("CSV") }
        val exportContent = remember(selectedFormat, state.answers, state.startQuestion, state.totalQuestions, state.importedQuestions) {
            if (selectedFormat == "CSV") viewModel.generateCsvExport() else viewModel.generateTxtExport()
        }

        AlertDialog(
            onDismissRequest = { viewModel.setExportDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Export Answers",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Button(
                            onClick = { selectedFormat = "CSV" },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedFormat == "CSV") BlueAccent else Slate800
                            )
                        ) {
                            Text("CSV Format")
                        }
                        Button(
                            onClick = { selectedFormat = "TXT" },
                            modifier = Modifier.weight(1f),
                            shape = RoundedCornerShape(12.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (selectedFormat == "TXT") BlueAccent else Slate800
                            )
                        ) {
                            Text("TXT Format")
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text(
                        text = if (selectedFormat == "CSV") {
                            "Simple CSV format (1,a | 2,d | 3,b):"
                        } else {
                            "Simple TXT format (1 a | 2 d | 3 b):"
                        },
                        color = Slate400,
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        shape = RoundedCornerShape(10.dp),
                        color = Slate950,
                        border = androidx.compose.foundation.BorderStroke(1.dp, Slate800)
                    ) {
                        Text(
                            text = exportContent,
                            modifier = Modifier
                                .padding(12.dp)
                                .verticalScroll(rememberScrollState()),
                            color = Slate100,
                            fontFamily = FontFamily.Monospace,
                            fontSize = 12.sp
                        )
                    }
                }
            },
            confirmButton = {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            clipboard.setPrimaryClip(ClipData.newPlainText("MCQ Answers", exportContent))
                            Toast.makeText(context, "Copied to clipboard!", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = EmeraldAccent)
                    ) {
                        Text("Copy", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                    Button(
                        onClick = {
                            val sendIntent = Intent().apply {
                                action = Intent.ACTION_SEND
                                putExtra(Intent.EXTRA_TEXT, exportContent)
                                type = if (selectedFormat == "CSV") "text/comma-separated-values" else "text/plain"
                            }
                            context.startActivity(Intent.createChooser(sendIntent, "Share MCQ Answers"))
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = BlueAccent)
                    ) {
                        Text("Share", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setExportDialog(false) }) {
                    Text("Close", color = Slate400)
                }
            }
        )
    }

    // RANGE SETUP DIALOG
    if (state.showSetupDialog) {
        var startInput by remember { mutableStateOf(state.startQuestion.toString()) }
        var totalInput by remember { mutableStateOf(state.totalQuestions.toString()) }

        AlertDialog(
            onDismissRequest = { viewModel.setSetupDialog(false) },
            containerColor = Slate900,
            title = {
                Text(
                    text = "Question Range Setup",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = Slate100
                )
            },
            text = {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    OutlinedTextField(
                        value = startInput,
                        onValueChange = { startInput = it },
                        label = { Text("Start Question Number") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedBorderColor = BlueAccent,
                            unfocusedBorderColor = Slate700
                        )
                    )
                    OutlinedTextField(
                        value = totalInput,
                        onValueChange = { totalInput = it },
                        label = { Text("Total Questions (1 - 500)") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Slate100,
                            unfocusedTextColor = Slate100,
                            focusedBorderColor = BlueAccent,
                            unfocusedBorderColor = Slate700
                        )
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Options per question:", color = Slate100, fontSize = 14.sp)
                        Surface(
                            color = BlueAccent.copy(alpha = 0.2f),
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BlueAccent)
                        ) {
                            Text(
                                text = "A - D (Exactly 4 choices)",
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                color = Slate100,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val s = startInput.toIntOrNull() ?: 1
                        val t = totalInput.toIntOrNull() ?: 500
                        viewModel.updateRange(s, t, 4)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = BlueAccent)
                ) {
                    Text("Apply Range")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setSetupDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }

    // CLEAR ALL CONFIRMATION DIALOG
    if (state.showClearAllDialog) {
        AlertDialog(
            onDismissRequest = { viewModel.setClearAllDialog(false) },
            containerColor = Slate900,
            title = {
                Text("Clear All Answers?", fontWeight = FontWeight.Bold, color = RoseClear)
            },
            text = {
                Text(
                    "This will delete all saved answers (${state.answeredCount} answered questions) and reset to question ${state.startQuestion}. This cannot be undone.",
                    color = Slate100
                )
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.clearAllAnswers() },
                    colors = ButtonDefaults.buttonColors(containerColor = RoseClear)
                ) {
                    Text("Yes, Clear All", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.setClearAllDialog(false) }) {
                    Text("Cancel", color = Slate400)
                }
            }
        )
    }
}
