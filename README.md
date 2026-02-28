# Get Started

A web app that guides users through a questionnaire to build a customized system prompt for AI coding assistants. Tailored for **clinical and healthcare settings**. Currently targets **Claude Code**.

No build step, no dependencies. Open `index.html` in a browser.

## File Structure

```
index.html   — Page shell: header, theme toggle, 2-col grid headers, scrollable content area, download bar
style.css    — All styling: light/dark themes, CSS Grid layout, responsive breakpoints
app.js       — All logic: data, state, rendering, theme toggle, ZIP generation, downloads
```

Everything is vanilla HTML/CSS/JS. The entire app lives in these three files.

## Architecture

### Layout

The page is a single scrollable 2-column CSS Grid (`content-scroll`). Each question produces two adjacent grid children — a `.question-cell` (left) and a `.prompt-cell` (right) — that share the same implicit grid row. This guarantees vertical alignment between a question and its corresponding prompt block regardless of content height.

Column headers (`.column-headers`) and the download bar (`.download-bar`) are separate 2-column grids with matching `1fr 1fr` columns so the vertical divider stays aligned across all three sections.

The vertical divider is a continuous `border-left` on every right-column element. Row gap is 0; spacing between rows comes from padding inside each cell.

On screens narrower than 820px, the grid collapses to a single column (question followed by its prompt block).

### Data Model

All 12 questions live in the `QUESTIONS` array in `app.js` (line ~72). Each entry:

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

Application state is a single `Map<questionId, optionIndex>`:
- `undefined` = unanswered (no entry in map)
- `-1` = explicitly skipped
- `0, 1, 2, ...` = selected option index

### Prompt Building

**Visual preview**: Each question has a dedicated `.prompt-cell` element. When an answer is selected, `updatePromptBlock()` writes that option's `promptText` into the cell. The visual spacing between blocks comes from the grid row layout (matching the question cards).

**Download output**: `buildPromptString()` collects prompt text from all non-skipped questions in ID order and joins them with `\n\n` (single blank line separator). This compact form is what goes into CLAUDE.md.

### Download Options

Two buttons in the download bar:

1. **Download Prompt** — Downloads `CLAUDE.md` directly (plain text, `text/markdown`).

2. **Download Install Script** — Downloads `install-claude-prompt.zip` containing `install-claude-prompt.command`. The `.command` extension makes it double-clickable on macOS (opens in Terminal). The ZIP is generated in-browser with Unix 755 permissions baked into the central directory's external attributes (`0x81ED0000`), so the executable bit survives the download.

The ZIP generation (`generateZip()` at line ~519) is a minimal spec-compliant implementation: single STORE entry, CRC-32, no compression, no dependencies. It writes the local file header, file data, central directory header, and end-of-central-directory record as raw bytes.

The install script clears the terminal, shows a banner, creates `~/.claude/` if needed, writes the prompt via heredoc, and pauses with "Press Enter to close" so the user can read the result.

### Extensibility (AI Tool Config)

The `AI_TOOLS` object at the top of `app.js` (line ~12) is the extension point for supporting other AI tools. Each entry defines:

```js
{
  id: "claudeCode",
  name: "Claude Code",                          // Shown in the UI badge
  configDir: "~/.claude",                       // Used in the install script
  configFile: "CLAUDE.md",                      // Target filename
  scriptFilename: "install-claude-prompt.command", // Filename inside the ZIP
  generateScript(promptContent) { ... },         // Returns the full bash script string
}
```

The active tool is set by `const activeTool = AI_TOOLS.claudeCode`. To add another tool, add an entry to `AI_TOOLS` and point `activeTool` at it (or build a UI selector).

### Question Topics

The questionnaire covers 12 questions tailored for clinical and healthcare professionals:

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

## Planned Features (Not Yet Implemented)

These informed architectural decisions but are not built:

- Plain text editing of the prompt before download
- OS auto-detection in the installer
- GUI installer option
- Automatic installation of AI tools
- User accounts and prompt saving
- Cross-device sync
- AI-powered prompt improvement based on user habits (paid feature)
- Windows support

## Theme

The app supports light and dark modes. On first visit it matches the operating system preference via `prefers-color-scheme`. A toggle button in the header overrides this; the choice is persisted in `localStorage`. If the user has not explicitly toggled, the app continues to follow system changes.

## Key Design Decisions

- **No framework** — Vanilla JS keeps the project zero-dependency and instantly runnable. The app is small enough that a framework would add complexity without benefit.
- **Single scroll, not split scroll** — Both panels scroll together so prompt blocks align with their questions. An earlier version had independent scroll panels but the alignment requirement made synchronized scrolling the right choice.
- **ZIP for executable delivery** — Browsers cannot set file permissions on downloads. Wrapping the `.command` file in a ZIP with Unix permissions in the metadata is the only way to deliver an executable file from a static web page.
- **Heredoc with single-quoted delimiter** — The install script uses `<< 'GETSTARTED_EOF'` (quoted), which disables shell variable expansion inside the heredoc. This means prompt content is written literally without needing to escape `$` or backticks.
