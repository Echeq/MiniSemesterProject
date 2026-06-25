import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import EmptyState from './EmptyState'

const STATUS_COLOR = {
  done:  new THREE.Color(0.06, 0.73, 0.51),
  doing: new THREE.Color(0.98, 0.62, 0.07),
  todo:  new THREE.Color(0.94, 0.27, 0.27),
}

export default function DataSphere({ tasks }) {
  const { t } = useTranslation()
  const mountRef = useRef(null)
  const tooltipRef = useRef(null)
  const [tooltip, setTooltip] = useState(null) // { x, y, task }

  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const doing = tasks.filter((t) => t.status === 'doing').length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  useEffect(() => {
    const el = mountRef.current
    if (!el || total === 0) return

    const width = el.clientWidth || 600
    const height = el.clientHeight || 400

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
    camera.position.z = 3.5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    // Build particle positions using Fibonacci sphere distribution.
    const count = Math.max(80, Math.min(total * 15, 1500))
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const phi = Math.PI * (Math.sqrt(5) - 1)
    const today = new Date().toISOString().slice(0, 10)

    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const theta = phi * i
      const jitter = (Math.random() - 0.5) * 0.08

      positions[i * 3]     = (r * Math.cos(theta)) * (1 + jitter)
      positions[i * 3 + 1] = y * (1 + jitter)
      positions[i * 3 + 2] = (r * Math.sin(theta)) * (1 + jitter)

      // Colour by task status proportionally.
      const taskIdx = Math.floor((i / count) * total)
      const t = tasks[taskIdx]
      const c = STATUS_COLOR[t?.status] ?? STATUS_COLOR.todo
      colors[i * 3]     = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color',    new THREE.BufferAttribute(colors, 3))

    const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.9 })
    const sphere = new THREE.Points(geo, mat)
    scene.add(sphere)

    // Overdue indicator: larger pulsing red sphere overlay.
    const overdueTasks = tasks.filter((t) => t.due_date && t.status !== 'done' && t.due_date < today)
    let overdueRing = null
    if (overdueTasks.length > 0) {
      const ringGeo = new THREE.SphereGeometry(1.12, 12, 8)
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xef4444, wireframe: true, transparent: true, opacity: 0.0 })
      overdueRing = new THREE.Mesh(ringGeo, ringMat)
      scene.add(overdueRing)
    }

    // Subtle ambient wireframe shell.
    const shellGeo = new THREE.SphereGeometry(1.05, 16, 12)
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.07 })
    scene.add(new THREE.Mesh(shellGeo, shellMat))

    // Hover raycasting.
    const raycaster = new THREE.Raycaster()
    raycaster.params.Points.threshold = 0.05
    const mouse = new THREE.Vector2(-999, -999)

    const onMouseMove = (e) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
      tooltipRef.current = { clientX: e.clientX, clientY: e.clientY }
    }

    // Drag-to-rotate.
    let dragging = false
    let prev = { x: 0, y: 0 }
    const onDown = (e) => { dragging = true; prev = { x: e.clientX, y: e.clientY } }
    const onMove = (e) => {
      onMouseMove(e)
      if (!dragging) return
      sphere.rotation.y += (e.clientX - prev.x) * 0.01
      sphere.rotation.x += (e.clientY - prev.y) * 0.01
      prev = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { dragging = false }

    // Scroll-to-zoom.
    const onWheel = (e) => {
      e.preventDefault()
      camera.position.z = Math.max(1.5, Math.min(8, camera.position.z + e.deltaY * 0.005))
    }

    renderer.domElement.addEventListener('mousedown', onDown)
    renderer.domElement.addEventListener('mousemove', onMove)
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('mouseup', onUp)

    let rafId
    let frame = 0
    function animate() {
      rafId = requestAnimationFrame(animate)
      frame++
      if (!dragging) sphere.rotation.y += 0.003

      // Pulse overdue ring opacity.
      if (overdueRing) {
        overdueRing.material.opacity = 0.04 + 0.06 * Math.abs(Math.sin(frame * 0.04))
      }

      // Raycast for hover tooltip every 6 frames.
      if (frame % 6 === 0) {
        raycaster.setFromCamera(mouse, camera)
        const hits = raycaster.intersectObject(sphere)
        if (hits.length > 0) {
          const idx = hits[0].index
          if (idx != null) {
            const taskIdx = Math.min(Math.floor((idx / count) * total), total - 1)
            const t = tasks[taskIdx]
            if (t && tooltipRef.current) {
              setTooltip({ x: tooltipRef.current.clientX, y: tooltipRef.current.clientY, task: t })
            }
          }
        } else {
          setTooltip(null)
        }
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(rafId)
      setTooltip(null)
      renderer.domElement.removeEventListener('mousedown', onDown)
      renderer.domElement.removeEventListener('mousemove', onMove)
      renderer.domElement.removeEventListener('wheel', onWheel)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [total, pct, doing]) // re-init when task count, completion, or in-progress count changes

  if (total === 0) {
    return <EmptyState icon="search" title={t('board.noTasks')} description={t('board.noTasksDesc')} />
  }

  const STATUS_LABEL = { done: t('board.done'), doing: t('board.inProgress'), todo: t('board.todo') }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div ref={mountRef} className="flex-1 cursor-grab active:cursor-grabbing" />

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 max-w-[180px] rounded-lg border border-[var(--glass-border)] bg-[var(--glass)] p-2.5 text-xs shadow-lg backdrop-blur-xl"
          style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
        >
          <p className="truncate font-semibold">{tooltip.task.title}</p>
          <p className="mt-0.5 text-[var(--fg-muted)]">{STATUS_LABEL[tooltip.task.status]}</p>
          {tooltip.task.due_date && (
            <p className="mt-0.5 text-[var(--fg-subtle)]">{t('task.dueDate')}: {tooltip.task.due_date}</p>
          )}
          {tooltip.task.assignee_profile?.display_name && (
            <p className="mt-0.5 text-[var(--fg-subtle)]">→ {tooltip.task.assignee_profile.display_name}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 border-t border-[var(--border-muted)] px-4 py-3 text-xs text-[var(--fg-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0fba83]" /> {t('board.done')} — {done}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> {t('board.inProgress')} — {doing}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> {t('board.todo')} — {total - done - doing}
        </span>
        <span className="font-semibold text-[var(--fg)]">{pct}% {t('insights.complete')}</span>
      </div>
    </div>
  )
}
