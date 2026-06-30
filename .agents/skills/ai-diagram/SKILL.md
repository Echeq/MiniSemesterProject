---
name: ai-diagram
description: >-
  Generates diagrams as Mermaid code blocks. Supports flowcharts, sequence
  diagrams, class diagrams, Gantt charts, and bar/line/pie charts. Output
  is pure Markdown — no external tools needed for rendering in GitHub.
allowed-tools: Read, Write, Bash, Glob
triggers:
  - "@ai-diagram"
---

# AI Diagram

Generates diagrams as Mermaid code blocks. Every output is a ready-to-paste
` ```mermaid ` block that renders natively on GitHub, GitLab, and Markdown
viewers. Optionally renders to PNG/SVG if `mmdc` (Mermaid CLI) is installed.

## Commands

| Command | Action |
|---|---|
| `@ai-diagram` | Interactive: ask type → topic → details → generate |
| `@ai-diagram flowchart <topic>` | Auto-generate a flowchart from topic alone |
| `@ai-diagram sequence <topic>` | Auto-generate a sequence diagram from topic alone |
| `@ai-diagram class <topic>` | Auto-generate a class/entity diagram from topic alone |
| `@ai-diagram gantt <topic>` | Auto-generate a Gantt chart from topic alone |
| `@ai-diagram chart <topic>` | Auto-generate a bar/line/pie chart from topic alone |
| `@ai-diagram --render <file.md>` | Convert Mermaid blocks to PNG using `mmdc` (if installed) |

## How to use

### Default: auto-generate from title

When the user provides `@ai-diagram <type> <topic>`, use your knowledge of the
topic to infer the diagram content. Do NOT ask questions — generate immediately.

- **flowchart**: infer steps and decisions from the topic
- **sequence**: infer actors and message flow from the topic
- **class**: infer entities, attributes, and relationships from the topic
- **gantt**: infer phases, tasks, and dependencies from the topic
- **chart**: infer data categories and values from the topic

After generation, display the Mermaid block and ask: "Does this look right?
Type `more` to refine, or `save` to save to /docs/diagrams/."

### Fallback: interactive (only if topic is too vague)

If you genuinely cannot infer a reasonable diagram from the topic alone, ask
ONE question at a time. End when user says "done".

### Example session

```
User: @ai-diagram flowchart orchestrator

Agent: ```mermaid
flowchart TD
  A[User input] --> B{Classify}
  B -->|SIMPLE| C[Scout: execute]
  B -->|MEDIUM| D[Scout: implement]
  D --> E[Deep: review]
  B -->|COMPLEX| F[Scout: explore]
  F --> G[Deep: implement]
  B -->|VERY COMPLEX| H[Scout: explore]
  H --> I[Deep: implement]
  I --> J[Scout: review]
```

Agent: "Does this look right? Type `more` to refine, or `save` to save."
```

## Output

Diagrams are saved as standalone Markdown files in `/docs/diagrams/<topic>.md`
with the Mermaid block inside. These can be embedded into auto-report templates
by copying the code block.

## --render (optional)

If `mmdc` (Mermaid CLI) is installed, `--render` extracts Mermaid blocks from a
Markdown file and renders them to PNG:

```powershell
npm install -g @mermaid-js/mermaid-cli
mmdc -i input.md -o output.png
```

Render is optional. Mermaid blocks render natively on GitHub without any tools.

## Error handling

- If user gives vague details, ask clarifying questions (one at a time)
- For chart type, validate that data is numeric
- If mmdc not found on --render, offer to install or fall back to Markdown

Base directory: D:\myAI-Skills\.agents\skills\ai-diagram
