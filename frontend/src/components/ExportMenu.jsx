import { useEffect, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'

function csvEscape(val) {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

function generateCSV(tasks) {
  const headers = ['Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Description']
  const rows = tasks.map((t) => [
    t.title,
    t.status,
    t.priority || '',
    t.assignee_profile?.display_name || '',
    t.due_date || '',
    (t.description || '').replace(/\n/g, ' '),
  ])
  const lines = [headers, ...rows].map((row) => row.map(csvEscape).join(','))
  return lines.join('\n')
}

function generatePDF(tasks) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = 20

  doc.setFontSize(16)
  doc.text('Task Export', 14, y)
  y += 10

  doc.setFontSize(8)
  doc.text(`Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, y)
  y += 8

  const headers = ['Title', 'Status', 'Priority', 'Assignee', 'Due Date']
  const colWidths = [70, 25, 20, 35, 30]
  const totalWidth = colWidths.reduce((a, b) => a + b, 0)

  function drawRow(cells, isHeader) {
    let x = 14
    doc.setFontSize(isHeader ? 9 : 8)
    doc.setFont(undefined, isHeader ? 'bold' : 'normal')
    cells.forEach((cell, i) => {
      doc.text(String(cell || ''), x + 1, y + 4)
      x += colWidths[i]
    })
    y += 6
  }

  drawRow(headers, true)

  tasks.forEach((t) => {
    if (y > 275) {
      doc.addPage()
      y = 20
      drawRow(headers, true)
    }
    drawRow([
      t.title,
      t.status,
      t.priority || '',
      t.assignee_profile?.display_name || '',
      t.due_date || '',
    ], false)
  })

  doc.save('tasks-export.pdf')
}

export default function ExportMenu({ tasks = [] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handlePDF() {
    setOpen(false)
    generatePDF(tasks)
  }

  function handleCSV() {
    setOpen(false)
    const csv = generateCSV(tasks)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tasks-export.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="btn btn-default !px-2">
        <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
          <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Zm10 0H4v1.5h8Zm0 3H4v1.5h8Zm-8 3h8v1.5H4Z" />
        </svg>
        <span className="hidden sm:inline ml-1">Export</span>
      </button>
      {open && (
        <div className="menu absolute right-0 z-50 mt-1 w-36 p-1 animate-pop-in">
          <button onClick={handlePDF} className="nav-item text-sm w-full justify-start">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 1.75A.75.75 0 0 1 3.25 1h5.5a.75.75 0 0 1 .53.22l3.5 3.5a.75.75 0 0 1 .22.53v8a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75Z" /></svg>
            Export PDF
          </button>
          <button onClick={handleCSV} className="nav-item text-sm w-full justify-start">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25Z" /></svg>
            Export CSV
          </button>
        </div>
      )}
    </div>
  )
}
