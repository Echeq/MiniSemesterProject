# Templates

Store your report templates here. Each template is a folder with a `template.md` file.

## Structure

```
templates/
  <template-name>/
    template.md       Required — your report template
```

## Template Format

Use `{{KEY}}` placeholders that the skill will fill:

- `{{TITLE}}` — Report title
- `{{AUTHORS}}` — Author names
- `{{DATE}}` — Generation date
- `{{ABSTRACT}}` — Abstract text
- `{{BODY}}` — Main content

Example:
```markdown
# {{TITLE}}

**Authors:** {{AUTHORS}}
**Date:** {{DATE}}

## Abstract

{{ABSTRACT}}

## Content

{{BODY}}
```
