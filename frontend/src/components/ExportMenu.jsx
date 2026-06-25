import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { jsPDF } from 'jspdf'
import * as XLSX from 'xlsx'

function csvEscape(val) {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export default function ExportMenu({ tasks = [] }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const headers = {
    title: t('task.title'),
    status: t('task.status'),
    priority: t('task.priority'),
    assignee: t('task.assignee'),
    dueDate: t('task.dueDate'),
    description: t('task.description'),
    labels: t('task.labels'),
  }

  const statusLabel = {
    todo: t('board.todo'),
    doing: t('board.inProgress'),
    done: t('board.done'),
  }

  const priorityLabel = {
    P0: t('filter.p0'),
    P1: t('filter.p1'),
    P2: t('filter.p2'),
    P3: t('filter.p3'),
  }

  function generateCSV() {
    const cols = [headers.title, headers.status, headers.priority, headers.assignee, headers.dueDate, headers.description]
    const rows = tasks.map((t) => [
      t.title,
      statusLabel[t.status] || t.status,
      priorityLabel[t.priority] || t.priority || '',
      t.assignee_profile?.display_name || '',
      t.due_date || '',
      (t.description || '').replace(/\n/g, ' '),
    ])
    return [cols, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
  }

  function generatePDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    let y = 20
    doc.setFontSize(16)
    doc.text(t('export.pdfTitle'), 14, y)
    y += 10
    doc.setFontSize(8)
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, y)
    y += 8

    const cols = [headers.title, headers.status, headers.priority, headers.assignee, headers.dueDate]
    const colWidths = [70, 25, 20, 35, 30]

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

    drawRow(cols, true)
    tasks.forEach((task) => {
      if (y > 275) { doc.addPage(); y = 20; drawRow(cols, true) }
      drawRow([
        task.title,
        statusLabel[task.status] || task.status,
        priorityLabel[task.priority] || task.priority || '',
        task.assignee_profile?.display_name || '',
        task.due_date || '',
      ], false)
    })
    doc.save('tasks-export.pdf')
  }

  function generateExcel() {
    const data = tasks.map((task) => ({
      [headers.title]: task.title || '',
      [headers.status]: statusLabel[task.status] || task.status,
      [headers.priority]: priorityLabel[task.priority] || task.priority || '',
      [headers.assignee]: task.assignee_profile?.display_name || '',
      [headers.dueDate]: task.due_date || '',
      [headers.labels]: (task.labels || []).map((l) => l.name).join(', '),
      [headers.description]: (task.description || '').replace(/\n/g, ' '),
    }))
    const ws = XLSX.utils.json_to_sheet(data)
    ws['!cols'] = [{ wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 20 }, { wch: 50 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks')
    XLSX.writeFile(wb, 'tasks-export.xlsx')
  }

  function handlePDF() { setOpen(false); requestAnimationFrame(generatePDF) }
  function handleExcel() { setOpen(false); requestAnimationFrame(generateExcel) }
  function handleCSV() {
    setOpen(false)
    const csv = generateCSV()
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
        <span className="hidden sm:inline ml-1">{t('export.button')}</span>
      </button>
      {open && (
        <div className="menu absolute end-0 z-50 mt-1 w-40 p-1 animate-pop-in">
          <button onClick={handleExcel} className="nav-item text-sm w-full justify-start">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M0 1.75C0 .784.784 0 1.75 0h7.5C10.216 0 11 .784 11 1.75v3.5h1.25c.966 0 1.75.784 1.75 1.75v7.25A1.75 1.75 0 0 1 12.25 16h-7.5A1.75 1.75 0 0 1 3 14.25V10.5H1.75A1.75 1.75 0 0 1 0 8.75ZM3 9V3.5h-.25A.25.25 0 0 0 2.5 3.75v5a.25.25 0 0 0 .25.25Zm1.5-7.25v7.5h5.5v-7.5Zm5.5 9H4.5v3.75c0 .138.112.25.25.25h5.5a.25.25 0 0 0 .25-.25Z" /></svg>
            {t('export.excel')}
          </button>
          <button onClick={handlePDF} className="nav-item text-sm w-full justify-start">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2.5 1.75A.75.75 0 0 1 3.25 1h5.5a.75.75 0 0 1 .53.22l3.5 3.5a.75.75 0 0 1 .22.53v8a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75Z" /></svg>
            {t('export.pdf')}
          </button>
          <button onClick={handleCSV} className="nav-item text-sm w-full justify-start">
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25Z" /></svg>
            {t('export.csv')}
          </button>
        </div>
      )}
    </div>
  )
}
