---
name: auto-report
description: Interactive report generator. Collects user input, inserts content into a Markdown template, checks export dependencies, and outputs to /docs/auto-report/.
allowed-tools: Read, Write, Bash, Glob
triggers:
  - "@auto-report"
  - "@auto-report --templates"
  - "@auto-report --history"
  - "@auto-report --config"
---

# ROLE: Report Generator

Interactive report builder. Ask ONE question at a time. Fill a template, check dependencies for the target format, and save the result.

## Quick Start

| Mode | Trigger | What happens |
|---|---|---|
| Generate | `@auto-report` | 6-step wizard → choose format → dependency check → save as `edited_{template}.{ext}` |
| Templates | `@auto-report --templates` | List available template folders |
| History | `@auto-report --history` | Show past reports table |
| Config | `@auto-report --config` | View/edit saved settings |

## Output

```
/docs/auto-report/
├── .config.md                    Session history + defaults
├── README.md                     Report index
├── edited_{template}_{date}.{ext}  Generated reports
└── install_{tool}.flag           Dependency installers (created on demand)
```

### Supported formats

| Format | Extension | Dependency | Fallback |
|---|---|---|---|
| Markdown | `.md` | None (native) | — |
| Word | `.docx` | `pandoc --version` | Warn + offer .md |
| PDF | `.pdf` | `pandoc --version` + pdf-engine | Warn + offer .md |
| HTML | `.html` | `pandoc --version` | Warn + offer .md |
| LaTeX | `.tex` | `pandoc --version` | Warn + offer .md |

The filename uses the template folder name (e.g., `default`) + date + extension:
`edited_default_2026-06-24.docx`

## Template Location

Templates are plain Markdown files in `.agents/skills/auto-report/templates/<name>/template.md`. Each template has its own placeholder set. Common placeholders: `{{TITLE}}`, `{{AUTHORS}}`, `{{DATE}}`, `{{ABSTRACT}}`, `{{BODY}}`.

### Available templates

| Template | Use case | Placeholders |
|---|---|---|
| `default` | Standard academic reports | TITLE, AUTHORS, DATE, ABSTRACT, INTRODUCTION, SECTION_1_TITLE, SECTION_1, SECTION_2, SECTION_3 |
| `chinese-university` | Chinese university reports (GB/T 7714-2015 format) | TITLE, AUTHORS, UNIVERSITY, COURSE_NAME, DATE, ABSTRACT, INTRODUCTION, METHODOLOGY, RESULTS, DISCUSSION, CONCLUSION, REFERENCE_1, REFERENCE_2 |

### Chinese University Format (GB/T 7714-2015)

When user selects "Chinese University" as subject, apply this standard:

| Element | Standard |
|---|---|
| Body font | SimSun (宋体) 12pt (小四) |
| Heading font | SimHei (黑体) or bold SimSun |
| Title | 22pt (二号) bold, centered |
| H1 | 16pt (三号) bold |
| H2 | 14pt (四号) bold |
| Body text | SimSun 12pt (小四), 1.5x line spacing |
| First-line indent | 2 characters (2em) |
| Page margins | L: 3cm, R: 2.5cm, T/B: 2.5cm |
| Header | Course name (left), University (right) |
| Footer | Centered page number |
| English/numbers | Times New Roman |

The template includes pandoc YAML frontmatter for proper CJK rendering. For PDF output, requires `xelatex` or `ctex` LaTeX distribution.

## Dependency Detection

After the user chooses a format, run:

```
# Check pandoc (for docx, pdf, html, tex)
pandoc --version

# Check pdf engine (if format is pdf and pandoc exists)
pandoc --version | findstr "pdf"  # Windows
# OR on Linux/Mac:
pandoc --version | grep pdf
```

**If all dependencies found**: Proceed with conversion after generating .md.

**If missing**:
1. Generate `.md` version as fallback.
2. Write a `.flag` file to `/docs/auto-report/install_{tool}.flag` containing the install command for the current OS.
3. Report to user:
   > "⚠️ `pandoc` not found. Generated `.md` fallback. Flag file created: `docs/auto-report/install_pandoc.flag`. Run it to install."

### Flag files

Created when a required dependency is missing. Saved alongside reports. Run them to install.

| File | Content (Windows) | Content (Linux/Mac) |
|---|---|---|
| `install_pandoc.flag` | `winget install pandoc` or `choco install pandoc` | `brew install pandoc` or `sudo apt install pandoc` |
| `install_pdf-engine.flag` | `pip install weasyprint` | `brew install weasyprint` or `sudo apt install weasyprint` |

Flag files are plain text — review before running on your system.

## Generation Flow (6 steps)

Ask ONE question at a time:

1. **Format** — "Output format? 1) Markdown .md  2) Word .docx  3) PDF  4) HTML  5) LaTeX .tex"
2. **Language** — "Language? 1) English 2) Chinese 3) Bilingual"
3. **Subject** — "Subject type? (CS, Chemistry, Literature, Economics, Chinese University, General)"
   - If "Chinese University" → use `chinese-university` template, ask for `{{UNIVERSITY}}` and `{{COURSE_NAME}}`
   - Otherwise → use `default` template
4. **Title** — "Report title?"
5. **Authors** — "Individual or group? If group, member names?"
6. **Sections** — Suggest sections based on subject (see Subject Adaptation). User confirms or edits.
7. **Content** — For each section, ask 1 question. Use their words, do not generate.

After content: "Any figures or tables? Name and section. I'll add auto-numbered placeholders."

Then run Dependency Detection. If okay, generate → convert → save as `edited_{template}_{date}.{ext}`.

### Output file

For `default` template: `edited_default_{date}.{ext}`
For `chinese-university` template: `edited_chinese-university_{date}.{ext}`

```markdown
# {{TITLE}}

## Section 1
Content from user...

**Figure 1.1 — Description** *(Insert image)*
```

## Subject Adaptation

| Subject | Template | Extra sections to suggest |
|---|---|---|
| CS, Programming, OS, AI, Web | `default` | Implementation, Algorithm Analysis, Complexity |
| Chemistry, Physics, Biology | `default` | Experimental Setup, Safety, Error Analysis |
| Literature, History | `default` | Theoretical Framework, Sources |
| Economics, Psychology | `default` | Data Sources, Statistical Methods |
| **Chinese University** | **`chinese-university`** | 引言, 方法, 结果, 讨论, 结论, 参考文献 |
| General | `default` | Standard sections only |

## Figure & Table Placeholders

Auto-number per section (1.1, 1.2, …). User says "I have a diagram" during the interview → skill inserts:

```markdown
**Figure 1.1 — Description** *(Insert image here)*
**Table 1.1 — Description** *(Insert table here)*
```

Language adapts label: English → "Figure/Table", Chinese → "图/表".

## Error Handling

| Issue | Action |
|---|---|
| No templates found | Use built-in academic template (Abstract, Introduction, Body, Conclusion, References) |
| User cancels mid-flow | Save partial session to `.config.md`, exit |
| Output dir missing | Create `/docs/auto-report/` |
| Dependency not found | Generate .md + write `install_{tool}.flag` with OS-specific install command |
| Format unsupported | Fall back to .md |
