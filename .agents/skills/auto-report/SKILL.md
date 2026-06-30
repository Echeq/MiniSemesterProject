---
name: auto-report
description: >-
  Interactive report generator. Asks one question at a time, fills a template,
  checks dependencies, and saves the result to /docs/auto-report/.
allowed-tools: Read, Write, Bash, Glob
triggers:
  - "@auto-report"
  - "@auto-report --templates"
  - "@auto-report --history"
  - "@auto-report --config"
---

# Auto Report

Interactive report builder. Asks questions one at a time, fills a Markdown
template, checks export dependencies, and saves to `/docs/auto-report/`.

## Commands

| Command | Action |
|---|---|
| `@auto-report` | Start wizard: format → language → subject → title → authors → content → export |
| `--templates` | List available template folders |
| `--history` | Show past reports table |
| `--config` | View saved settings |

## Generation flow

Ask one question at a time. After each answer, store it and ask the next.

1. **Format** — md / docx / pdf / html / tex
2. **Language** — English / Chinese / Bilingual
3. **Subject** — what is the report about? (e.g. "Operating Systems", "Machine Learning", "Chinese University")
4. **Title** — report title
5. **Authors** — individual or group
6. **Sections** — suggest sections based on subject (see Subject Adaptation below). User confirms or edits.
7. **Content** — for each section, ask user to provide content. Use their words, do not generate.
8. **Figures/Tables** — "Any figures or tables? Name and section." Insert auto-numbered placeholders.

After all content → run dependency check → generate `.md` → convert if deps exist → save as `edited_{template}_{date}.{ext}`.

## Subject Adaptation

Check if a template folder exists in `.agents/skills/auto-report/templates/<subject-normalized>/`.
- If yes → use that template's placeholders and formatting rules
- If no → load `default` template, clean it, and generate relevant sections based on the subject:
  - CS/Engineering → Implementation, Algorithm Analysis, Testing
  - Science → Experimental Setup, Results, Error Analysis
  - Humanities → Theoretical Framework, Sources, Discussion
  - Business/Economics → Data Sources, Methodology, Forecast
  - General → Introduction, Methodology, Results, Conclusion

Present the suggested sections to the user. They can add, remove, or rename any section before content collection.

## Output

```
/docs/auto-report/edited_{template}_{date}.{ext}
```

If the chosen format's dependency is missing, generate `.md` as fallback and
print the install command. No flag files.

## Supported formats

| Format | Ext | Dependency | Fallback |
|---|---|---|---|
| Markdown | `.md` | None | — |
| Word | `.docx` | pandoc | .md |
| PDF | `.pdf` | pandoc + pdf-engine | .md |
| HTML | `.html` | pandoc | .md |
| LaTeX | `.tex` | pandoc | .md |

## Error handling

- No templates found → use built-in academic template (Abstract, Intro, Body, Conclusion, Refs)
- User cancels → save partial session to `.config.md`
- Output dir missing → create `/docs/auto-report/`
- Format dependency missing → generate .md + print install command

Base directory: D:\myAI-Skills\.agents\skills\auto-report
