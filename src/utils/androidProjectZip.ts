import JSZip from 'jszip';

export async function downloadAndroidProjectZip(): Promise<void> {
  const zip = new JSZip();

  // Root files
  zip.file(
    'settings.gradle.kts',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "MCQAnswerPad"
include(":app")
`
  );

  zip.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application") version "8.7.3" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`
  );

  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  );

  const wrapper = zip.folder('gradle')?.folder('wrapper');
  wrapper?.file(
    'gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.10.2-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  // App module
  const app = zip.folder('app');
  app?.file(
    'build.gradle.kts',
    `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.mcq.answerpad"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.mcq.answerpad"
        minSdk = 26
        targetSdk = 35
        versionCode = 2
        versionName = "2.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation(platform("androidx.compose:compose-bom:2024.12.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    testImplementation("junit:junit:4.13.2")
}
`
  );

  app?.file(
    'proguard-rules.pro',
    `# Proguard rules for MCQ Answer Pad
-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.* <fields>;
}
`
  );

  // Src main
  const main = app?.folder('src')?.folder('main');
  main?.file(
    'AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="MCQ Answer Pad"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@android:style/Theme.Material.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // Kotlin source
  const javaPkg = main?.folder('java')?.folder('com')?.folder('mcq')?.folder('answerpad');
  
  javaPkg?.file(
    'MainActivity.kt',
    `package com.mcq.answerpad

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.mcq.answerpad.ui.MCQScreen
import com.mcq.answerpad.ui.theme.MCQAnswerPadTheme

class MainActivity : ComponentActivity() {
    private val viewModel: MCQViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MCQAnswerPadTheme {
                MCQScreen(viewModel = viewModel)
            }
        }
    }
}
`
  );

  javaPkg?.file(
    'MCQItem.kt',
    `package com.mcq.answerpad

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
`
  );

  javaPkg?.file(
    'MCQTxtParser.kt',
    `package com.mcq.answerpad

sealed class ParseResult {
    data class Success(val questions: List<MCQItem>) : ParseResult()
    data class Error(val message: String) : ParseResult()
}

object MCQTxtParser {

    private val startTagPattern = Regex("""^\\[Q(\\d+)\\]\\s*$""", RegexOption.IGNORE_CASE)
    private val endTagPattern = Regex("""^\\[/Q(\\d+)\\]\\s*$""", RegexOption.IGNORE_CASE)

    fun parse(content: String): ParseResult {
        if (content.isBlank()) {
            return ParseResult.Error("The imported file is empty.")
        }

        val normalized = content.replace("\\r\\n", "\\n").replace("\\r", "\\n")
        val lines = normalized.split("\\n")

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
                val endMatch = endTagPattern.find(trimmedLine)
                if (endMatch != null) {
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
                    when (currentSection) {
                        "Question" -> questionText = (questionText ?: "") + "\\n" + trimmedLine
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
            return ParseResult.Error("Question block $currentBlockTag (started at line $blockStartLine) is missing its closing tag.")
        }

        if (questions.isEmpty()) {
            return ParseResult.Error("No valid question blocks found in file.\\nExpected format:\\n[Q1]\\nQuestion: ...\\nA: ...\\nB: ...\\nC: ...\\nD: ...\\n[/Q1]")
        }

        return ParseResult.Success(questions)
    }
}
`
  );

  // GitHub Action
  const github = zip.folder('.github')?.folder('workflows');
  github?.file(
    'build-apk.yml',
    `name: Build Android APK
on: [push, workflow_dispatch]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'
      - uses: gradle/actions/setup-gradle@v4
      - run: chmod +x gradlew || true
      - run: ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: MCQ-Answer-Pad.apk
          path: app/build/outputs/apk/debug/app-debug.apk
`
  );

  zip.file(
    'README.md',
    `# MCQ Answer Pad - Native Android App (Jetpack Compose)

This is the complete native Android Jetpack Compose project for **MCQ Answer Pad**.

## TXT Import Format
[Q1]
Question: What is the capital of France?
A: Berlin
B: Madrid
C: Paris
D: Rome
[/Q1]

Supports UTF-8 Unicode including Hindi, Urdu, and English.
No Answer line is allowed or required.
`
  );

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'MCQ-Answer-Pad-Android-Project.zip');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
