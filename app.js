/* ========================================================================
   Get Started — AI Assistant Setup
   Application logic
   ======================================================================== */

// -----------------------------------------------------------------------
// AI Tool Configuration (extensibility point)
//
// To add support for another AI tool, add an entry here. Each tool defines
// where its config lives and how to generate an install script.
// -----------------------------------------------------------------------
const AI_TOOLS = {
  claudeCode: {
    id: "claudeCode",
    name: "Claude Code",
    configDir: "~/.claude",
    configFile: "CLAUDE.md",
    scriptFilename: "install-claude-prompt.command",
    generateScript(promptContent) {
      return [
        "#!/usr/bin/env bash",
        "# -----------------------------------------------------------------",
        "# Get Started — Claude Code system prompt installer",
        "# Generated at: " + new Date().toISOString(),
        "# -----------------------------------------------------------------",
        'set -euo pipefail',
        "",
        'clear',
        'echo "========================================="',
        'echo "  Claude Code — System Prompt Installer"',
        'echo "========================================="',
        'echo ""',
        "",
        'CONFIG_DIR="${HOME}/.claude"',
        'CONFIG_FILE="${CONFIG_DIR}/CLAUDE.md"',
        "",
        "# Create config directory if it doesn't exist",
        'if [ ! -d "$CONFIG_DIR" ]; then',
        '  mkdir -p "$CONFIG_DIR"',
        '  echo "Created directory: $CONFIG_DIR"',
        "fi",
        "",
        "# Write the system prompt",
        "cat > \"$CONFIG_FILE\" << 'GETSTARTED_EOF'",
        promptContent,
        "GETSTARTED_EOF",
        "",
        'echo "System prompt written to $CONFIG_FILE"',
        'echo ""',
        'echo "Done! Start Claude Code to use your custom prompt."',
        'echo ""',
        'echo "Press Enter to close this window."',
        'read -r',
        "",
      ].join("\n");
    },
  },
  // Example: add a new tool here in the future
  // anotherTool: { id: "anotherTool", name: "Another Tool", ... }
};

// Active tool — change this to switch targets
const activeTool = AI_TOOLS.claudeCode;

// -----------------------------------------------------------------------
// Questionnaire Data
//
// Each question has an id, question text, and an array of options.
// Each option has a label (shown to the user) and promptText (added to the
// generated system prompt when that option is selected).
// -----------------------------------------------------------------------
const QUESTIONS = [
  {
    id: 1,
    question: "What best describes your role?",
    options: [
      {
        label: "Clinician — I provide patient care and want AI help with technical tasks",
        promptText:
          "The user is a clinician whose primary expertise is patient care, not software development. Prioritize clarity and safety in all suggestions. Never assume programming knowledge. When proposing any action that touches files, systems, or data, state clearly what will happen before doing it. Frame technical concepts in terms of their practical clinical impact.",
      },
      {
        label: "Clinical researcher — I do both patient care and research",
        promptText:
          "The user is a clinical researcher who balances patient care with research activities. They may have some experience with data analysis tools but are not a software developer. Tailor suggestions to research workflows — data collection, statistical analysis, manuscript preparation — while keeping explanations accessible. Connect technical decisions to research outcomes.",
      },
      {
        label: "Bioinformatician or data scientist in healthcare",
        promptText:
          "The user is a bioinformatician or data scientist working in healthcare. They have technical programming skills and understand computational workflows. Use precise technical terminology for programming concepts. Be mindful of domain-specific tools (R/Bioconductor, Python/scanpy, genomics pipelines) and healthcare data standards (FHIR, HL7, OMOP).",
      },
      {
        label: "Healthcare administrator or operations professional",
        promptText:
          "The user works in healthcare administration or operations. They need AI help with automation, reporting, and workflow optimization rather than clinical or research tasks. Focus on practical, business-oriented solutions. Explain technical steps in terms of operational outcomes. Prioritize reliability and ease of maintenance in any solution.",
      },
    ],
  },
  {
    id: 2,
    question: "How comfortable are you with computers and technology?",
    options: [
      {
        label: "I mostly use email, web browsers, and office apps",
        promptText:
          "The user has basic computer skills limited to everyday applications. Explain every technical step in plain language as if writing instructions for a colleague who has never used a terminal. Always provide the exact text to type or click. Warn clearly before any action that modifies files or settings. Never use unexplained abbreviations or assume familiarity with developer tools.",
      },
      {
        label: "I can install software, manage files, and follow technical instructions",
        promptText:
          "The user is comfortable following technical instructions and can navigate file systems and install software independently. Provide step-by-step terminal commands with brief explanations of what each does. Define developer-specific terms on first use but do not over-explain basic computer operations.",
      },
      {
        label: "I write scripts or code occasionally for my work",
        promptText:
          "The user has some programming experience, likely in R or Python for data analysis. Reference programming concepts directly but explain advanced patterns, architecture decisions, and unfamiliar libraries when they arise. Provide context for why an approach is chosen, not just the code.",
      },
      {
        label: "I code regularly and am comfortable with development tools",
        promptText:
          "The user is an experienced programmer. Be concise and direct. Skip basic explanations. Focus on trade-offs, edge cases, and idiomatic solutions. When multiple approaches exist, briefly compare them and recommend one.",
      },
    ],
  },
  {
    id: 3,
    question: "How familiar are you with the command line (Terminal)?",
    options: [
      {
        label: "I have never used it — or I find it intimidating",
        promptText:
          "The user has no command-line experience. When a terminal command is necessary, explain it piece by piece: what the command name means, what each flag does, and what the expected output looks like. Always warn about destructive operations and explain how to undo mistakes. Suggest graphical alternatives when they exist.",
      },
      {
        label: "I can run commands if someone tells me exactly what to type",
        promptText:
          "The user can follow command-line instructions but does not write commands from scratch. Provide commands ready to copy and paste. Briefly explain non-obvious parts — flags, pipes, redirects — but skip explanations for basic navigation like cd and ls.",
      },
      {
        label: "I use the terminal regularly and comfortably",
        promptText:
          "The user is comfortable with the command line. Suggest terminal commands directly without explaining common operations or standard flags. Use shell features like pipes and wildcards freely.",
      },
    ],
  },
  {
    id: 4,
    question: "What will you primarily use this AI assistant for?",
    options: [
      {
        label: "Analyzing data — spreadsheets, clinical datasets, or statistics",
        promptText:
          "The user's primary goal is data analysis. Favor well-established data analysis tools and libraries (pandas, R/tidyverse, matplotlib, seaborn). When suggesting statistical analyses, explain what the test does and when it is appropriate. Always recommend visualizing data before running analyses. Suggest exporting results in shareable formats (CSV, PDF figures, HTML reports).",
      },
      {
        label: "Automating repetitive tasks — file organization, reports, data entry",
        promptText:
          "The user wants to automate repetitive workflows. Prioritize simple, reliable scripts over elegant but complex solutions. Favor well-known tools with good documentation. Always include clear instructions for how to run the automation again later. Add safeguards like dry-run modes and backup steps before any bulk file operations.",
      },
      {
        label: "Building tools or applications for clinical use",
        promptText:
          "The user wants to build software tools for clinical environments. Prioritize reliability, data security, and ease of use in all design decisions. Follow healthcare software best practices: input validation, audit logging, clear error messages, and graceful failure handling. Consider accessibility and the needs of end users who may not be technically sophisticated.",
      },
      {
        label: "Bioinformatics, genomics, or computational biology",
        promptText:
          "The user works on bioinformatics and computational biology workflows. Be familiar with common pipelines (alignment, variant calling, RNA-seq, single-cell analysis), standard file formats (FASTQ, BAM, VCF, BED, AnnData), and key tools (samtools, GATK, DESeq2, Seurat/scanpy). Consider computational resource requirements and recommend efficient, reproducible implementations.",
      },
    ],
  },
  {
    id: 5,
    question: "How should the AI communicate with you?",
    options: [
      {
        label: "Step by step — walk me through everything in detail",
        promptText:
          "Communicate in a detailed, step-by-step style. Number each step clearly. Explain what is happening and why at each stage. Use plain language and short sentences. It is better to over-explain than to leave the user unsure about what to do next.",
      },
      {
        label: "Clear and practical — enough context without being verbose",
        promptText:
          "Communicate clearly and practically. Lead with the action or solution, then provide enough context to understand the approach. Avoid unnecessary preamble. Use bullet points and short paragraphs for readability.",
      },
      {
        label: "Brief and direct — just tell me what to do",
        promptText:
          "Be brief and direct. Lead with the answer or code. Skip explanations unless the solution is non-obvious or the user asks for more detail. Avoid filler phrases and unnecessary preamble.",
      },
    ],
  },
  {
    id: 6,
    question: "How much should the AI teach and explain as it works?",
    options: [
      {
        label: "Teach me — I want to understand what is happening and why",
        promptText:
          "Actively teach the user. When introducing tools, commands, or techniques, explain the underlying concept in one or two sentences. Use analogies to familiar clinical or scientific workflows where possible. Suggest what to learn next when relevant. Frame mistakes as learning opportunities, not failures.",
      },
      {
        label: "Explain when it matters — but don't over-teach",
        promptText:
          "Include explanations when they add value: non-obvious design choices, unfamiliar tools, or situations where the user might need to modify the approach later. Skip explanations for concepts the user has already demonstrated understanding of in the conversation.",
      },
      {
        label: "Just solve the problem — I'll ask if I want to learn more",
        promptText:
          "Focus on delivering working solutions efficiently. Skip conceptual explanations unless the user explicitly asks. The user prefers to learn through their own research and exploration.",
      },
    ],
  },
  {
    id: 7,
    question: "How should the AI handle medical and technical terminology?",
    options: [
      {
        label: "Use medical terms freely, but explain programming jargon",
        promptText:
          "The user is fluent in medical and scientific terminology — clinical terms, drug names, anatomical references, and standard medical abbreviations can be used without explanation. However, always define programming and software engineering jargon on first use. Translate computing concepts into medical or scientific analogies when helpful.",
      },
      {
        label: "Keep all language simple — minimize jargon of any kind",
        promptText:
          "Use plain, everyday language for both medical and technical concepts. Avoid jargon and acronyms unless absolutely necessary, and always define them on first use. Use concrete examples instead of abstract descriptions. Prefer \"delete the file\" over \"remove the artifact.\"",
      },
      {
        label: "Full technical language — I'm comfortable with both domains",
        promptText:
          "Use precise terminology from both medical and computing domains without simplification. The user is comfortable with clinical vocabulary, programming jargon, and domain-specific abbreviations across both fields.",
      },
    ],
  },
  {
    id: 8,
    question: "How much should the AI do on its own versus checking with you?",
    options: [
      {
        label: "Always check first — show me your plan before making changes",
        promptText:
          "Always confirm before making changes. Present a clear plan of what you intend to do, what files will be affected, and what the expected outcome is. Wait for explicit approval before proceeding. When multiple approaches are possible, list the options with brief trade-offs and let the user choose.",
      },
      {
        label: "Handle routine tasks, but ask before anything significant",
        promptText:
          "Handle straightforward, low-risk tasks without asking — formatting, simple lookups, standard implementations. For decisions with meaningful trade-offs, changes to important files, or actions that are difficult to undo, explain what you plan to do and ask before proceeding.",
      },
      {
        label: "Take initiative — get it done and explain afterward",
        promptText:
          "Work autonomously and make reasonable decisions without confirmation on each step. Explain what you did and why afterward. Only pause to ask when a decision is genuinely ambiguous or has consequences that are difficult to reverse.",
      },
    ],
  },
  {
    id: 9,
    question: "How should the AI handle errors and unexpected results?",
    options: [
      {
        label: "Explain in simple terms and guide me through fixing it",
        promptText:
          "When errors occur, explain what went wrong in plain language — do not paste raw error messages without interpretation. Walk through the fix step by step. After resolving the issue, briefly explain what caused it so the user can recognize similar problems in the future.",
      },
      {
        label: "Tell me the cause briefly and provide the fix",
        promptText:
          "When errors occur, state the root cause concisely and provide a concrete fix. Include enough context for the user to understand why the fix works, but keep it brief and focused on getting back to the task at hand.",
      },
      {
        label: "Just fix it and move on — only flag what I need to know",
        promptText:
          "When errors occur, fix them directly and continue working. Only explain the error if it requires the user to take action or change their approach. Do not dwell on routine or self-explanatory issues.",
      },
    ],
  },
  {
    id: 10,
    question: "How should the AI handle sensitive data and patient information?",
    options: [
      {
        label: "Always remind me about privacy — I work with patient data regularly",
        promptText:
          "The user regularly handles sensitive health data. Before any operation that processes, stores, or transmits data, consider whether it could contain protected health information (PHI). Proactively warn about privacy risks: do not send data to external services, do not log PHI to console output, and do not store sensitive data in unencrypted files. Recommend de-identification when analyzing patient-level data. Suggest working with synthetic or de-identified datasets when possible.",
      },
      {
        label: "Standard precautions — warn me only when there is a specific risk",
        promptText:
          "Follow standard data handling precautions. Warn the user when a proposed action could expose sensitive data to external services, store credentials insecurely, or create unintended data persistence. Do not add excessive disclaimers when working with clearly non-sensitive data.",
      },
      {
        label: "I manage my own data governance — no special reminders needed",
        promptText:
          "The user manages their own data governance practices. Do not add unsolicited privacy warnings or data handling disclaimers. Focus on the technical task at hand.",
      },
    ],
  },
  {
    id: 11,
    question: "How should the AI reference evidence and sources?",
    options: [
      {
        label: "Cite sources — I want evidence-based recommendations",
        promptText:
          "When making recommendations with a scientific or clinical basis, reference specific sources: published guidelines, peer-reviewed research, or official documentation. Distinguish clearly between evidence-based recommendations and the AI's own reasoning. When uncertain about a claim, say so explicitly rather than presenting it as fact.",
      },
      {
        label: "Mention sources when relevant, but don't over-cite",
        promptText:
          "Reference official documentation and established sources when introducing unfamiliar tools, recommending best practices, or making claims that might be surprising. Do not cite sources for common knowledge or well-established patterns.",
      },
      {
        label: "No need for citations — just give me your best recommendation",
        promptText:
          "Provide direct recommendations without padding responses with citations or references. Focus on actionable guidance. Only include sources when the user specifically requests them.",
      },
    ],
  },
  {
    id: 12,
    question: "How do you prefer to learn new tools and concepts?",
    options: [
      {
        label: "Show me examples — I learn best from seeing things in action",
        promptText:
          "When introducing new tools or concepts, lead with a concrete, working example the user can run immediately. Show the expected output so the user knows what success looks like. Build understanding through progressively more complex examples rather than front-loading theory.",
      },
      {
        label: "Explain the concept first — I want the big picture before details",
        promptText:
          "When introducing new tools or concepts, start with a high-level explanation of what it does and why it is useful. Use analogies to clinical or scientific workflows where helpful. Follow the conceptual overview with practical implementation details and examples.",
      },
      {
        label: "Point me to documentation — I prefer official guides and tutorials",
        promptText:
          "When introducing new tools or concepts, provide links to official documentation, well-regarded tutorials, and authoritative references. Give a brief overview so the user knows what to look for, then let them explore at their own pace.",
      },
    ],
  },
];

// -----------------------------------------------------------------------
// Application State
// -----------------------------------------------------------------------

// Maps question id -> selected option index (0-based), or undefined if not answered.
// A "skip" sets the value to -1.
const selections = new Map();

// -----------------------------------------------------------------------
// DOM References
// -----------------------------------------------------------------------
const contentScroll = document.getElementById("content-scroll");
const placeholderEl = document.getElementById("placeholder");
const progressEl = document.getElementById("progress");
const btnDownloadPrompt = document.getElementById("btn-download-prompt");
const btnDownloadScript = document.getElementById("btn-download-script");
const toolLabelEl = document.getElementById("tool-label");

// -----------------------------------------------------------------------
// Render
// -----------------------------------------------------------------------

// Set tool label from config
toolLabelEl.textContent = activeTool.name;

/**
 * Render all question/prompt row pairs into the content grid.
 * Each question produces two grid children (same row):
 *   1. .question-cell (left column) — contains the question card
 *   2. .prompt-cell   (right column) — contains the prompt text block
 */
function renderQuestions() {
  QUESTIONS.forEach((q, idx) => {
    // --- Left column: question card ---
    const qCell = document.createElement("div");
    qCell.className = "question-cell";
    qCell.style.animationDelay = `${idx * 0.04}s`;

    const card = document.createElement("div");
    card.className = "question-card";
    card.dataset.questionId = q.id;

    const numEl = document.createElement("div");
    numEl.className = "question-number";
    numEl.textContent = String(q.id).padStart(2, "0");
    card.appendChild(numEl);

    const textEl = document.createElement("p");
    textEl.className = "question-text";
    textEl.textContent = q.question;
    card.appendChild(textEl);

    const listEl = document.createElement("div");
    listEl.className = "options-list";

    q.options.forEach((opt, idx) => {
      listEl.appendChild(createOptionButton(q.id, idx, opt.label, false));
    });
    listEl.appendChild(createOptionButton(q.id, -1, "Skip this question", true));

    card.appendChild(listEl);
    qCell.appendChild(card);
    contentScroll.appendChild(qCell);

    // --- Right column: prompt block ---
    const pCell = document.createElement("div");
    pCell.className = "prompt-cell";
    pCell.dataset.questionId = q.id;

    const pText = document.createElement("span");
    pText.className = "prompt-block-text";
    pCell.appendChild(pText);

    contentScroll.appendChild(pCell);
  });
}

/**
 * Create a single option button element.
 */
function createOptionButton(questionId, optionIndex, label, isSkip) {
  const btn = document.createElement("button");
  btn.className = "option-btn" + (isSkip ? " skip-btn" : "");
  btn.type = "button";

  const radio = document.createElement("span");
  radio.className = "option-radio";
  btn.appendChild(radio);

  const span = document.createElement("span");
  span.textContent = label;
  btn.appendChild(span);

  btn.addEventListener("click", () => handleSelection(questionId, optionIndex));

  return btn;
}

// -----------------------------------------------------------------------
// Selection Handling
// -----------------------------------------------------------------------

/**
 * Handle a user selecting an option (or skip) for a question.
 */
function handleSelection(questionId, optionIndex) {
  if (selections.get(questionId) === optionIndex) {
    selections.delete(questionId);
  } else {
    selections.set(questionId, optionIndex);
  }

  updateCardStyles(questionId);
  updatePromptBlock(questionId);
  updatePlaceholder();
  updateProgress();
  updateDownloadButton();
}

/**
 * Update visual state of a specific question card's option buttons.
 */
function updateCardStyles(questionId) {
  const card = contentScroll.querySelector(
    `.question-card[data-question-id="${questionId}"]`
  );
  if (!card) return;

  const currentSelection = selections.get(questionId);
  const buttons = card.querySelectorAll(".option-btn");
  const q = QUESTIONS.find((q) => q.id === questionId);

  buttons.forEach((btn, idx) => {
    const btnOptionIndex = idx < q.options.length ? idx : -1;
    btn.classList.toggle("selected", currentSelection === btnOptionIndex);
  });

  card.classList.toggle("answered", currentSelection !== undefined);
}

// -----------------------------------------------------------------------
// Prompt Building (per-block updates for visual alignment)
// -----------------------------------------------------------------------

/**
 * Update a single prompt block in the right column.
 */
function updatePromptBlock(questionId) {
  const pCell = contentScroll.querySelector(
    `.prompt-cell[data-question-id="${questionId}"]`
  );
  if (!pCell) return;

  const sel = selections.get(questionId);
  const q = QUESTIONS.find((q) => q.id === questionId);

  if (sel === undefined || sel === -1) {
    pCell.querySelector(".prompt-block-text").textContent = "";
    pCell.classList.remove("active");
  } else {
    pCell.querySelector(".prompt-block-text").textContent =
      q.options[sel].promptText;
    pCell.classList.add("active");
  }
}

/**
 * Show or hide the right-column placeholder.
 */
function updatePlaceholder() {
  const hasContent = QUESTIONS.some((q) => {
    const sel = selections.get(q.id);
    return sel !== undefined && sel !== -1;
  });
  placeholderEl.classList.toggle("hidden", hasContent);
}

/**
 * Enable or disable the download button.
 */
function updateDownloadButton() {
  const hasContent = QUESTIONS.some((q) => {
    const sel = selections.get(q.id);
    return sel !== undefined && sel !== -1;
  });
  btnDownloadPrompt.disabled = !hasContent;
  btnDownloadScript.disabled = !hasContent;
}

// -----------------------------------------------------------------------
// Progress
// -----------------------------------------------------------------------

function updateProgress() {
  const answered = [...selections.values()].filter((v) => v !== undefined).length;
  progressEl.textContent = `${answered} / ${QUESTIONS.length} answered`;
  const fillEl = document.getElementById("progress-fill");
  if (fillEl) fillEl.style.width = `${(answered / QUESTIONS.length) * 100}%`;
}

// -----------------------------------------------------------------------
// ZIP Generation (preserves Unix executable permissions across download)
// -----------------------------------------------------------------------

/**
 * Compute CRC-32 for a Uint8Array.
 */
function crc32(data) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Generate a ZIP file (Uint8Array) containing a single file with Unix 755
 * permissions. Uses STORE (no compression) since the scripts are small.
 */
function generateZip(filename, content) {
  const encoder = new TextEncoder();
  const fileData = encoder.encode(content);
  const fileNameBytes = encoder.encode(filename);
  const crc = crc32(fileData);
  const fileSize = fileData.length;

  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();

  // Local file header (30 + filename length)
  const localHeader = new ArrayBuffer(30 + fileNameBytes.length);
  const lh = new DataView(localHeader);
  lh.setUint32(0, 0x04034b50, true);
  lh.setUint16(4, 20, true);
  lh.setUint16(6, 0, true);
  lh.setUint16(8, 0, true);
  lh.setUint16(10, dosTime, true);
  lh.setUint16(12, dosDate, true);
  lh.setUint32(14, crc, true);
  lh.setUint32(18, fileSize, true);
  lh.setUint32(22, fileSize, true);
  lh.setUint16(26, fileNameBytes.length, true);
  lh.setUint16(28, 0, true);
  new Uint8Array(localHeader, 30).set(fileNameBytes);

  // Central directory header (46 + filename length)
  const centralHeader = new ArrayBuffer(46 + fileNameBytes.length);
  const ch = new DataView(centralHeader);
  ch.setUint32(0, 0x02014b50, true);
  ch.setUint16(4, 0x0314, true);   // version made by: Unix
  ch.setUint16(6, 20, true);
  ch.setUint16(8, 0, true);
  ch.setUint16(10, 0, true);
  ch.setUint16(12, dosTime, true);
  ch.setUint16(14, dosDate, true);
  ch.setUint32(16, crc, true);
  ch.setUint32(20, fileSize, true);
  ch.setUint32(24, fileSize, true);
  ch.setUint16(28, fileNameBytes.length, true);
  ch.setUint16(30, 0, true);
  ch.setUint16(32, 0, true);
  ch.setUint16(34, 0, true);
  ch.setUint16(36, 0, true);
  ch.setUint32(38, 0x81ED0000, true); // rwxr-xr-x (regular file, mode 0755)
  ch.setUint32(42, 0, true);
  new Uint8Array(centralHeader, 46).set(fileNameBytes);

  // End of central directory (22 bytes)
  const centralDirOffset = localHeader.byteLength + fileData.length;
  const centralDirSize = centralHeader.byteLength;
  const endOfDir = new ArrayBuffer(22);
  const eod = new DataView(endOfDir);
  eod.setUint32(0, 0x06054b50, true);
  eod.setUint16(4, 0, true);
  eod.setUint16(6, 0, true);
  eod.setUint16(8, 1, true);
  eod.setUint16(10, 1, true);
  eod.setUint32(12, centralDirSize, true);
  eod.setUint32(16, centralDirOffset, true);
  eod.setUint16(20, 0, true);

  // Combine all parts
  const zip = new Uint8Array(
    localHeader.byteLength +
    fileData.length +
    centralHeader.byteLength +
    endOfDir.byteLength
  );
  let offset = 0;
  zip.set(new Uint8Array(localHeader), offset);
  offset += localHeader.byteLength;
  zip.set(fileData, offset);
  offset += fileData.length;
  zip.set(new Uint8Array(centralHeader), offset);
  offset += centralHeader.byteLength;
  zip.set(new Uint8Array(endOfDir), offset);

  return zip;
}

// -----------------------------------------------------------------------
// Download
// -----------------------------------------------------------------------

/**
 * Trigger a file download from a Blob.
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

btnDownloadPrompt.addEventListener("click", () => {
  const prompt = buildPromptString();
  if (!prompt) return;
  downloadBlob(
    new Blob([prompt], { type: "text/markdown" }),
    "CLAUDE.md"
  );
});

btnDownloadScript.addEventListener("click", () => {
  const prompt = buildPromptString();
  if (!prompt) return;
  const script = activeTool.generateScript(prompt);
  const zip = generateZip(activeTool.scriptFilename, script);
  downloadBlob(
    new Blob([zip], { type: "application/zip" }),
    "install-claude-prompt.zip"
  );
});

/**
 * Build the final prompt string for the install script.
 * Blocks are joined with a single blank line (\n\n) regardless of the
 * visual spacing used in the preview.
 */
function buildPromptString() {
  const blocks = [];

  QUESTIONS.forEach((q) => {
    const sel = selections.get(q.id);
    if (sel === undefined || sel === -1) return;

    const option = q.options[sel];
    if (option && option.promptText) {
      blocks.push(option.promptText);
    }
  });

  return blocks.join("\n\n");
}

// -----------------------------------------------------------------------
// Theme Toggle
// -----------------------------------------------------------------------

const themeToggle = document.getElementById("theme-toggle");
const iconSun = document.getElementById("icon-sun");
const iconMoon = document.getElementById("icon-moon");

function getEffectiveTheme() {
  const stored = localStorage.getItem("theme");
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme) {
  if (theme === "light") {
    document.documentElement.setAttribute("data-theme", "light");
    iconSun.style.display = "none";
    iconMoon.style.display = "block";
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    iconSun.style.display = "block";
    iconMoon.style.display = "none";
  }
}

themeToggle.addEventListener("click", () => {
  const next = getEffectiveTheme() === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  applyTheme(next);
});

window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", () => {
    if (!localStorage.getItem("theme")) applyTheme(getEffectiveTheme());
  });

applyTheme(getEffectiveTheme());

// -----------------------------------------------------------------------
// Initialize
// -----------------------------------------------------------------------
renderQuestions();
updateProgress();
