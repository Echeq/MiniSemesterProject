import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../api/supabaseClient'
import Modal from './Modal'
import { jsPDF } from 'jspdf'
import ExcelJS from 'exceljs'

function csvEscape(val) {
  if (val == null) return ''
  const s = String(val)
  if (s.includes(',') || s.includes('"') || s.includes('\n')) return '"' + s.replace(/"/g, '""') + '"'
  return s
}

function formatDate(dateStr, format = 'display') {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  if (isNaN(d.getTime())) return dateStr
  if (format === 'csv') return dateStr
  if (format === 'excel') return d
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const LS_COLUMN_KEY = 'taskflow:export:columns'

const AVAILABLE_COLUMNS = [
  { key: 'title', labelKey: 'task.title' },
  { key: 'status', labelKey: 'task.status' },
  { key: 'priority', labelKey: 'task.priority' },
  { key: 'assignee', labelKey: 'task.assignee' },
  { key: 'dueDate', labelKey: 'task.dueDate' },
  { key: 'description', labelKey: 'task.description' },
  { key: 'labels', labelKey: 'task.labels' },
]

function loadColumns() {
  try {
    const s = localStorage.getItem(LS_COLUMN_KEY)
    return s ? new Set(JSON.parse(s)) : new Set(AVAILABLE_COLUMNS.slice(0, 5).map((c) => c.key))
  } catch { return new Set(AVAILABLE_COLUMNS.slice(0, 5).map((c) => c.key)) }
}

const FORMATS = [
  { key: 'excel', label: 'Excel (.xlsx)', icon: 'M0 1.75C0 .784.784 0 1.75 0h7.5C10.216 0 11 .784 11 1.75v3.5h1.25c.966 0 1.75.784 1.75 1.75v7.25A1.75 1.75 0 0 1 12.25 16h-7.5A1.75 1.75 0 0 1 3 14.25V10.5H1.75A1.75 1.75 0 0 1 0 8.75ZM3 9V3.5h-.25A.25.25 0 0 0 2.5 3.75v5a.25.25 0 0 0 .25.25Zm1.5-7.25v7.5h5.5v-7.5Zm5.5 9H4.5v3.75c0 .138.112.25.25.25h5.5a.25.25 0 0 0 .25-.25Z' },
  { key: 'pdf', label: 'PDF (.pdf)', icon: 'M2.5 1.75A.75.75 0 0 1 3.25 1h5.5a.75.75 0 0 1 .53.22l3.5 3.5a.75.75 0 0 1 .22.53v8a.75.75 0 0 1-.75.75H3.25a.75.75 0 0 1-.75-.75Z' },
  { key: 'csv', label: 'CSV (.csv)', icon: 'M2 1.75C2 .784 2.784 0 3.75 0h5.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 12.25 16h-8.5A1.75 1.75 0 0 1 2 14.25Z' },
]

export default function ExportModal({ tasks = [], session, onClose }) {
  const { t } = useTranslation()
  const [format, setFormat] = useState('excel')
  const [fileName, setFileName] = useState('tasks-export')
  const [columnKeys, setColumnKeys] = useState(loadColumns)
  const [busy, setBusy] = useState(false)

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

  function toggleColumn(key) {
    setColumnKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      localStorage.setItem(LS_COLUMN_KEY, JSON.stringify([...next]))
      return next
    })
  }

  const activeCols = AVAILABLE_COLUMNS.filter((c) => columnKeys.has(c.key))

  function getCell(task, colKey) {
    switch (colKey) {
      case 'title': return task.title || ''
      case 'status': return statusLabel[task.status] || task.status
      case 'priority': return priorityLabel[task.priority] || task.priority || ''
      case 'assignee': return task.assignee_profile?.display_name || ''
      case 'dueDate': return task.due_date || ''
      case 'description': return (task.description || '').replace(/\n/g, ' ')
      case 'labels': return (task.labels || []).map((l) => l.name).join(', ')
      default: return ''
    }
  }

  async function handleExport() {
    if (activeCols.length === 0) return
    setBusy(true)
    try {
      if (format === 'csv') exportCSV()
      else if (format === 'pdf') exportPDF()
      else await exportExcel()

      const userName = session?.user?.email?.split('@')[0] || session?.user?.email || 'A user'
      const fmtName = format === 'excel' ? 'Excel' : format === 'pdf' ? 'PDF' : 'CSV'
      supabase.rpc('notify_admins', {
        p_message: `${userName} exported ${tasks.length} tasks as ${fmtName}`,
      }).catch(() => {})

      onClose()
    } finally {
      setBusy(false)
    }
  }

  function exportCSV() {
    const cols = activeCols.map((c) => t(c.labelKey))
    const rows = tasks.map((t) =>
      activeCols.map((c) => c.key === 'dueDate' ? formatDate(t.due_date, 'csv') : getCell(t, c.key)),
    )
    const csv = [cols, ...rows].map((row) => row.map((v) => csvEscape(typeof v === 'string' ? v : '')).join(',')).join('\n')
    download(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName + '.csv')
  }

  function exportPDF() {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' })
    let y = 20
    doc.setFontSize(16)
    doc.text(t('export.pdfTitle'), 14, y)
    y += 10
    doc.setFontSize(8)
    doc.text(`${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, y)
    y += 8

    const colWidths = activeCols.map((c) => {
      if (c.key === 'title') return 60
      if (c.key === 'description') return 50
      if (c.key === 'labels') return 30
      return 22
    })
    const cols = activeCols.map((c) => t(c.labelKey))

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
      drawRow(activeCols.map((c) => c.key === 'dueDate' ? formatDate(task.due_date) : getCell(task, c.key)), false)
    })
    download(doc.output('blob'), fileName + '.pdf')
  }

  async function exportExcel() {
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'PivotPoint'
    workbook.created = new Date()
    const ws = workbook.addWorksheet('Tasks')

    ws.columns = activeCols.map((c) => ({
      header: t(c.labelKey),
      key: c.key,
      width: c.key === 'title' ? 40 : c.key === 'description' ? 50 : c.key === 'labels' ? 20 : 14,
    }))

    tasks.forEach((task) => {
      const row = {}
      activeCols.forEach((c) => { row[c.key] = c.key === 'dueDate' ? formatDate(task.due_date, 'excel') : getCell(task, c.key) })
      ws.addRow(row)
    })

    ws.getRow(1).font = { bold: true }
    const buffer = await workbook.xlsx.writeBuffer()
    download(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName + '.xlsx')
  }

  function download(blob, name) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal title={t('export.button')} subtitle={t('filter.taskCount', { count: tasks.length })} onClose={onClose} maxWidth="max-w-lg">
      <div className="flex flex-col gap-5">
        {/* File name */}
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">File name</span>
          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              maxLength={80}
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
              placeholder="tasks-export"
            />
            <span className="text-xs text-[var(--fg-muted)]">.{format === 'excel' ? 'xlsx' : format}</span>
          </div>
        </label>

        {/* Format selector */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">Format</span>
          <div className="flex gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] p-1">
            {FORMATS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFormat(f.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition ${
                  format === f.key ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                }`}
              >
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16" fill="currentColor"><path d={f.icon} /></svg>
                <span className="hidden sm:inline">{f.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Columns */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-[var(--fg)]">{t('export.columns')}</span>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--card)] p-3">
            {AVAILABLE_COLUMNS.map((col) => (
              <label key={col.key} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm transition hover:bg-[var(--surface-hover)]">
                <input
                  type="checkbox"
                  checked={columnKeys.has(col.key)}
                  onChange={() => toggleColumn(col.key)}
                  className="h-4 w-4 rounded border-[var(--border)] accent-[var(--accent)]"
                />
                <span className={columnKeys.has(col.key) ? 'text-[var(--fg)]' : 'text-[var(--fg-muted)]'}>
                  {t(col.labelKey)}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-[var(--fg-muted)]">
            {activeCols.length} column{activeCols.length !== 1 ? 's' : ''} · {tasks.length} task{tasks.length !== 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn btn-default">{t('task.cancel')}</button>
            <button
              type="button"
              onClick={handleExport}
              disabled={busy || activeCols.length === 0}
              className="btn btn-primary"
            >
              {busy ? t('profile.saving') : t('export.button')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
