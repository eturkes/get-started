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
    question: "What is your programming experience level?",
    options: [
      {
        label: "Beginner — I'm just getting started with programming",
        promptText:
          "The user is a beginner programmer. Always explain concepts from first principles. Avoid unexplained jargon. Provide complete, runnable code examples rather than fragments. When introducing a new concept, briefly explain what it is and why it matters before using it.",
      },
      {
        label: "Intermediate — I'm comfortable with at least one language",
        promptText:
          "The user has intermediate programming experience. You can use standard programming terminology freely but should explain advanced or niche concepts when they arise. Provide context for architectural decisions rather than just giving code.",
      },
      {
        label: "Advanced — I work professionally with code daily",
        promptText:
          "The user is an advanced programmer. Be concise and direct. Skip explanations of common patterns. Focus on trade-offs, edge cases, and non-obvious implications. When suggesting code, prioritize idiomatic and production-ready solutions.",
      },
      {
        label: "Expert — I have deep expertise in specific domains",
        promptText:
          "The user is an expert developer. Treat them as a peer. Lead with the most nuanced, precise answer. Discuss trade-offs at an architectural level. Challenge assumptions when appropriate and point out subtle issues that less experienced developers might miss.",
      },
    ],
  },
  {
    id: 2,
    question: "How familiar are you with command-line interfaces?",
    options: [
      {
        label: "New to the terminal — I mainly use graphical interfaces",
        promptText:
          "The user is new to command-line interfaces. When suggesting terminal commands, explain each part of the command and what it does. Warn about potentially destructive operations (like rm, force flags, etc.). Always mention how to undo or recover from mistakes.",
      },
      {
        label: "Comfortable — I can navigate and run commands",
        promptText:
          "The user is comfortable with basic command-line usage. You can suggest terminal commands directly but should explain non-obvious flags or piped commands. Prefer common tools over obscure alternatives.",
      },
      {
        label: "Power user — The terminal is my primary interface",
        promptText:
          "The user is a command-line power user. Feel free to suggest shell one-liners, piped commands, and advanced CLI tools. No need to explain basic commands or common flags.",
      },
    ],
  },
  {
    id: 3,
    question: "How do you prefer the AI to communicate?",
    options: [
      {
        label: "Detailed and thorough — explain your reasoning",
        promptText:
          "Communicate in a detailed, thorough style. Explain your reasoning and the 'why' behind suggestions. Walk through your thought process step by step. It's better to over-explain than to leave the user guessing.",
      },
      {
        label: "Balanced — enough context without being verbose",
        promptText:
          "Communicate in a balanced style. Provide enough context to understand the approach without being overly verbose. Lead with the solution, then follow with brief reasoning.",
      },
      {
        label: "Concise — get straight to the point",
        promptText:
          "Be concise and direct. Lead with the answer or code. Omit explanations unless the solution is non-obvious or the user asks. Avoid filler phrases and unnecessary preamble.",
      },
    ],
  },
  {
    id: 4,
    question: "How much educational content do you want in responses?",
    options: [
      {
        label: "Teach me — I want to learn as I go",
        promptText:
          "Actively teach the user. When introducing patterns, libraries, or techniques, explain the underlying concepts. Offer links to documentation or further reading when relevant. Suggest related topics the user might want to explore. Frame mistakes as learning opportunities.",
      },
      {
        label: "Explain when relevant — but don't over-teach",
        promptText:
          "Include educational context when it adds value, such as when using a less common pattern or making a non-obvious design choice. Don't explain things the user likely already knows based on the conversation context.",
      },
      {
        label: "Just give me the answer — I'll research on my own",
        promptText:
          "Focus on delivering solutions rather than teaching. Skip conceptual explanations unless the user explicitly asks. The user prefers to learn through their own research and experimentation.",
      },
    ],
  },
  {
    id: 5,
    question: "How comfortable are you with technical jargon?",
    options: [
      {
        label: "Keep it simple — use plain language",
        promptText:
          "Use plain, everyday language. Avoid technical jargon and acronyms unless absolutely necessary, and always define them on first use. Prefer concrete examples over abstract descriptions.",
      },
      {
        label: "Standard terms are fine — but define the obscure ones",
        promptText:
          "You can use common technical terms freely (API, function, variable, repo, etc.) but define specialized or domain-specific jargon when it first appears.",
      },
      {
        label: "Full technical language — I speak the lingo",
        promptText:
          "Use precise technical terminology without simplification. The user is comfortable with industry jargon, acronyms, and specialized vocabulary across software engineering domains.",
      },
    ],
  },
  {
    id: 6,
    question: "What types of projects do you primarily work on?",
    options: [
      {
        label: "Web development — frontend, backend, or full-stack",
        promptText:
          "The user primarily works on web development projects. Favor web-oriented patterns, frameworks, and tooling. When discussing architecture, lean toward web-relevant patterns (REST/GraphQL APIs, component-based UI, SSR/CSR trade-offs, etc.).",
      },
      {
        label: "Data science and machine learning",
        promptText:
          "The user primarily works on data science and ML projects. Favor data-oriented libraries and patterns (pandas, numpy, scikit-learn, PyTorch, etc.). When suggesting solutions, consider data pipeline best practices, reproducibility, and computational efficiency.",
      },
      {
        label: "Systems programming and infrastructure",
        promptText:
          "The user primarily works on systems-level and infrastructure projects. Prioritize performance, memory safety, and reliability in suggestions. Be mindful of OS-level concerns, concurrency patterns, and deployment considerations.",
      },
      {
        label: "Varied — I work across many domains",
        promptText:
          "The user works across varied project types. Don't assume a specific tech stack. When multiple approaches exist, briefly mention the trade-offs between them so the user can choose the best fit for their current context.",
      },
    ],
  },
  {
    id: 7,
    question: "How much autonomy should the AI take when completing tasks?",
    options: [
      {
        label: "Ask first — check with me before making changes",
        promptText:
          "Always confirm with the user before making significant changes. Present your plan first and wait for approval. When multiple approaches are possible, list the options and let the user decide. Prefer caution over speed.",
      },
      {
        label: "Balanced — handle routine tasks but check on big decisions",
        promptText:
          "Handle straightforward, low-risk tasks autonomously (formatting, simple refactors, standard implementations). For decisions with meaningful trade-offs, architectural implications, or potential side effects, present options and ask before proceeding.",
      },
      {
        label: "High autonomy — just get it done and explain after",
        promptText:
          "Take initiative and execute tasks autonomously. Make reasonable decisions without asking for confirmation. Explain what you did and why afterward. Only pause to ask when a decision is truly ambiguous or has irreversible consequences.",
      },
    ],
  },
  {
    id: 8,
    question: "How should the AI handle errors and problems?",
    options: [
      {
        label: "Walk me through it — help me understand and fix issues",
        promptText:
          "When errors occur, explain what went wrong in clear terms. Walk the user through the debugging process step by step. Help them build mental models for diagnosing similar issues in the future. Suggest preventive measures.",
      },
      {
        label: "Diagnose and suggest — tell me the cause and the fix",
        promptText:
          "When errors occur, quickly identify the root cause, explain it briefly, and provide a concrete fix. Include enough context for the user to understand why the fix works, but don't turn every error into a lesson.",
      },
      {
        label: "Just fix it — resolve the issue and move on",
        promptText:
          "When errors occur, fix them directly and move on. Only explain the cause if it's something the user needs to be aware of to prevent recurrence. Don't dwell on routine or self-explanatory errors.",
      },
    ],
  },
  {
    id: 9,
    question: "What's your preference for code comments and documentation?",
    options: [
      {
        label: "Heavily commented — explain what the code does",
        promptText:
          "Write well-commented code. Add comments explaining the purpose of functions, non-obvious logic, and important decisions. Include docstrings for public APIs. Use clear, descriptive variable and function names as a first line of documentation.",
      },
      {
        label: "Moderate — comment complex parts, let clear code speak",
        promptText:
          "Write self-documenting code with clear names. Add comments only where the intent isn't obvious from the code itself: complex algorithms, workarounds, business logic, or non-obvious side effects. Skip comments that just restate what the code does.",
      },
      {
        label: "Minimal — clean code should be self-explanatory",
        promptText:
          "Minimize comments. Rely on clear naming, small functions, and good structure to make code readable. Only add comments for genuinely surprising behavior, critical warnings, or required documentation (e.g., public API docstrings).",
      },
    ],
  },
  {
    id: 10,
    question: "How do you prefer to learn new tools and concepts?",
    options: [
      {
        label: "Show me examples — I learn best from concrete code",
        promptText:
          "When introducing new concepts or tools, lead with concrete, working code examples. Show before explaining. Provide examples the user can run immediately and modify to experiment. Build understanding through progressively more complex examples.",
      },
      {
        label: "Explain the concepts — I want the mental model first",
        promptText:
          "When introducing new concepts or tools, start with the conceptual model. Explain the 'why' and the overall architecture before diving into code. Use analogies where helpful. Then follow with implementation details and examples.",
      },
      {
        label: "Point me to resources — I prefer official docs and guides",
        promptText:
          "When introducing new tools or concepts, provide references to official documentation, well-regarded tutorials, and authoritative resources. Give a brief overview to help the user know what to look for, then let them explore the resources at their own pace.",
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
  QUESTIONS.forEach((q) => {
    // --- Left column: question card ---
    const qCell = document.createElement("div");
    qCell.className = "question-cell";

    const card = document.createElement("div");
    card.className = "question-card";
    card.dataset.questionId = q.id;

    const numEl = document.createElement("div");
    numEl.className = "question-number";
    numEl.textContent = `Question ${q.id} of ${QUESTIONS.length}`;
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
// Initialize
// -----------------------------------------------------------------------
renderQuestions();
updateProgress();
