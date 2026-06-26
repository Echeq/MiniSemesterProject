---
# Pandoc metadata for Chinese academic reports
# Requires: pandoc + xelatex (for PDF) or reference.docx (for Word)
# Font standard: Chinese GB/T 7714-2015 academic formatting
documentclass: ctexart
CJKmainfont: SimSun
mainfont: SimSun
fontsize: 12pt
geometry: "left=3cm,right=2.5cm,top=2.5cm,bottom=2.5cm"
linestretch: 1.5
header-includes:
  - \usepackage{fancyhdr}
  - \pagestyle{fancy}
  - \fancyhead[L]{\small {{COURSE_NAME}}}
  - \fancyhead[R]{\small {{UNIVERSITY}}}
  - \fancyfoot[C]{\thepage}
---

<!--
╔══════════════════════════════════════════════════════════════╗
║              CHINESE UNIVERSITY REPORT STANDARD              ║
╠══════════════════════════════════════════════════════════════╣
║ Font         │ SimSun (宋体) for Chinese, Times New Roman   ║
║              │ for English/numbers                          ║
║──────────────┼───────────────────────────────────────────────║
║ Title (标题) │ 二号 (22pt) Bold, centered                    ║
║ H1 (一级标题)│ 三号 (16pt) Bold                              ║
║ H2 (二级标题)│ 四号 (14pt) Bold                              ║
║ H3 (三级标题)│ 小四 (12pt) Bold                              ║
║ Body (正文)  │ 小四 (12pt) SimSun, 1.5x line spacing        ║
║ Indent       │ First line: 2 characters (2em)               ║
║ Margins      │ Left 3cm, Right 2.5cm, Top/Bottom 2.5cm     ║
║ Page numbers │ Centered footer                              ║
╚══════════════════════════════════════════════════════════════╝
-->

# {{TITLE}}

**{{AUTHORS}}**
**{{UNIVERSITY}}** | **{{COURSE_NAME}}**
**Date:** {{DATE}}

---

## Abstract

{{ABSTRACT}}

---

## 引言 (Introduction)

{{INTRODUCTION}}

---

## 方法 (Methodology)

{{METHODOLOGY}}

---

## 结果 (Results)

{{RESULTS}}

---

## 讨论 (Discussion)

{{DISCUSSION}}

---

## 结论 (Conclusion)

{{CONCLUSION}}

---

## 参考文献

[1] {{REFERENCE_1}}
[2] {{REFERENCE_2}}
