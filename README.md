# Get Started

A web app that guides users through a questionnaire to build a customized system prompt for AI coding assistants. Tailored for **clinical and healthcare settings**. Currently targets **Claude Code**.

No build step, no package dependencies. Open `index.html` in a browser. Fonts load from Google Fonts (requires internet on first visit).

## File Structure

```
index.html       — Page shell: header, theme toggle, 2-col grid headers, scrollable content area, download bar
style.css        — All styling: light/dark themes, CSS Grid layout, responsive breakpoints
app.js           — All logic: data, state, rendering, theme toggle, ZIP generation, downloads
env.js.example   — Template for Gemini API key (copy to env.js)
.gitignore       — Excludes env.js from version control
```

Everything is vanilla HTML/CSS/JS. The entire app lives in these three files.

## Architecture

### Layout

The page is a single scrollable 2-column CSS Grid (`content-scroll`). Each question produces two adjacent grid children — a `.question-cell` (left) and a `.prompt-cell` (right) — that share the same implicit grid row. This guarantees vertical alignment between a question and its corresponding prompt block regardless of content height.

Column headers (`.column-headers`) and the download bar (`.download-bar`) are separate 2-column grids with matching `1fr 1fr` columns so the vertical divider stays aligned across all three sections.

The vertical divider is a continuous `border-left` on every right-column element. Row gap is 0; spacing between rows comes from padding inside each cell.

On screens narrower than 820px, the grid collapses to a single column (question followed by its prompt block).

### Data Model

All 15 questions live in the `QUESTIONS` array in `app.js`. Each entry:

```js
{
  id: 1,                    // Determines display order and prompt block order
  question: "...",          // Shown in the left column
  options: [
    {
      label: "...",         // Button text
      promptText: "...",    // Text block added to the prompt when selected
    },
    // ...
  ],
}
```

Most questions use multiple-choice options. Question 15 is a `"freeform"` type with a textarea instead of options, and an optional "Convert to Prompt" button that uses the Gemini API to refine the text into a system prompt paragraph.

Application state is a single `Map<questionId, optionIndex>`:
- `undefined` = unanswered (no entry in map)
- `0, 1, 2, ...` = selected option index

Unanswered questions are left blank and excluded from the final prompt. Each question card shows a "Leave blank to skip" hint below its options.

### Prompt Building

**Visual preview**: Each question has a dedicated `.prompt-cell` element. When an answer is selected, `updatePromptBlock()` writes that option's `promptText` into the cell. The visual spacing between blocks comes from the grid row layout (matching the question cards).

**Inline editing**: Each prompt block becomes `contenteditable="plaintext-only"` when active. Users can click any prompt block and edit the text directly. Edits are stored in a `customEdits` Map keyed by question ID. Changing the selected option for a question clears its custom edit and resets to the new option's default text. The edited text is what gets downloaded. If the user clears all text from a prompt block, that question is treated as unanswered — the answered count decrements, the card loses its answered styling, and the block is excluded from the download.

**Download output**: `buildPromptString()` checks `customEdits` for each question first, falling back to the selected option's `promptText` if no edit exists. Blocks are joined with `\n\n` (single blank line separator). This compact form is what goes into CLAUDE.md.

### Download Options

Two buttons in the download bar:

1. **Download Prompt** — Downloads `CLAUDE.md` directly (plain text, `text/markdown`).

2. **Download Install Script** — Downloads `install-claude-prompt.zip` containing a platform-specific installer script. The platform is auto-detected from the browser and can be overridden with the selector in the download bar:
   - **macOS**: `.command` file — double-clickable (opens in Terminal). Bash script with heredoc.
   - **Linux**: `.sh` file — bash script, identical logic to macOS.
   - **Windows**: `.ps1` PowerShell script — uses a here-string to write the prompt file to `%USERPROFILE%\.claude\CLAUDE.md`.

The ZIP is generated in-browser with Unix 755 permissions baked into the central directory's external attributes (`0x81ED0000`), so the executable bit survives the download on macOS and Linux.

The ZIP generation (`generateZip()`) is a minimal spec-compliant implementation: single STORE entry, CRC-32, no compression, no dependencies. It writes the local file header, file data, central directory header, and end-of-central-directory record as raw bytes.

Each install script clears the terminal, shows a banner, creates the config directory if needed, writes the prompt, and pauses with "Press Enter to close" so the user can read the result.

### Gemini Integration (Optional)

The freeform question (question 15) includes a "Convert to Prompt" button that calls the Gemini API (`gemini-3-flash-preview`) to refine the user's natural-language description into a polished system prompt paragraph. Text typed in the freeform textarea does not appear in the right-column preview or the final prompt until the user clicks "Convert to Prompt". A valid API key is required for this question to contribute to the output.

Setup:
1. Copy `env.js.example` to `env.js`
2. Replace the placeholder with your Gemini API key
3. `env.js` is gitignored and will not be committed

The API call is made client-side from the browser. The key is not exposed in version control but is visible in browser network requests.

### Extensibility (AI Tool Config)

The `AI_TOOLS` object at the top of `app.js` (line ~12) is the extension point for supporting other AI tools. Each entry defines:

```js
{
  id: "claudeCode",
  name: "Claude Code",                              // Shown in the UI badge
  configFile: "CLAUDE.md",                           // Target filename
  getScriptFilename(os) { ... },                     // Returns OS-specific filename
  generateScript(promptContent, os) { ... },         // Returns the full script string
}
```

The `os` parameter is one of `"macos"`, `"linux"`, or `"windows"`. The active tool is set by `const activeTool = AI_TOOLS.claudeCode`. To add another tool, add an entry to `AI_TOOLS` and point `activeTool` at it (or build a UI selector).

### Question Topics

The questionnaire covers 15 questions tailored for clinical and healthcare professionals:

1. Role (clinician, clinical researcher, bioinformatician, administrator)
2. Technical comfort level
3. Command-line familiarity
4. Primary use case (data analysis, automation, clinical tools, bioinformatics)
5. Communication style preference
6. Teaching and explanation depth
7. Medical vs. technical terminology handling
8. AI autonomy level
9. Error handling approach
10. Sensitive data and patient information (PHI) practices
11. Evidence and source citation preferences
12. Learning style for new tools
13. Uncertainty handling (stop and ask, flag but suggest, give best answer)
14. Conversational tone (professional, warm/encouraging, relaxed)
15. Freeform customization (free text with optional AI-powered prompt conversion)

## Planned Features (Not Yet Implemented)

These informed architectural decisions but are not built:

- GUI installer option
- Automatic installation of AI tools
- User accounts and prompt saving
- Cross-device sync
- AI-powered prompt improvement based on user habits (paid feature)

## Theme

The app supports light and dark modes. On first visit it matches the operating system preference via `prefers-color-scheme`. A toggle button in the header overrides this; the choice is persisted in `localStorage`. If the user has not explicitly toggled, the app continues to follow system changes.

**Typography**: Newsreader (serif) for display headings and question text, Outfit (geometric sans) for UI elements, JetBrains Mono for prompt preview. Loaded from Google Fonts.

**Colors**: Dark mode uses deep charcoal (#0f1218) with sage-mint (#6ec4a0) and warm amber (#d4a054) accents. Light mode uses warm cream (#f7f4ee) with deep emerald (#2c6b4f) and amber. A gradient accent rule under the header and a gradient progress bar blend both accent colors.

## Key Design Decisions

- **No framework** — Vanilla JS keeps the project zero-dependency and instantly runnable. The app is small enough that a framework would add complexity without benefit.
- **Single scroll, not split scroll** — Both panels scroll together so prompt blocks align with their questions. An earlier version had independent scroll panels but the alignment requirement made synchronized scrolling the right choice.
- **ZIP for executable delivery** — Browsers cannot set file permissions on downloads. Wrapping the `.command` file in a ZIP with Unix permissions in the metadata is the only way to deliver an executable file from a static web page.
- **Heredoc with single-quoted delimiter** — The bash install script uses `<< 'GETSTARTED_EOF'` (quoted), which disables shell variable expansion inside the heredoc. The Windows PowerShell script uses `@'...'@` (single-quoted here-string) for the same reason. Both write prompt content literally without needing to escape special characters.
