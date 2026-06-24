import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import EmptyState from './EmptyState'

const STATUS_COLOR = {
  done:  new THREE.Color(0.06, 0.73, 0.51),
  doing: new THREE.Color(0.98, 0.62, 0.07),
  todo:  new THREE.Color(0.94, 0.27, 0.27),
}

export default function DataSphere({ tasks }) {
  const mountRef = useRef(null)

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

    // Subtle ambient wireframe shell.
    const shellGeo = new THREE.SphereGeometry(1.05, 16, 12)
    const shellMat = new THREE.MeshBasicMaterial({ color: 0x334155, wireframe: true, transparent: true, opacity: 0.07 })
    scene.add(new THREE.Mesh(shellGeo, shellMat))

    // Drag-to-rotate.
    let dragging = false
    let prev = { x: 0, y: 0 }
    const onDown = (e) => { dragging = true; prev = { x: e.clientX, y: e.clientY } }
    const onMove = (e) => {
      if (!dragging) return
      sphere.rotation.y += (e.clientX - prev.x) * 0.01
      sphere.rotation.x += (e.clientY - prev.y) * 0.01
      prev = { x: e.clientX, y: e.clientY }
    }
    const onUp = () => { dragging = false }
    renderer.domElement.addEventListener('mousedown', onDown)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)

    let rafId
    function animate() {
      rafId = requestAnimationFrame(animate)
      if (!dragging) sphere.rotation.y += 0.003
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
      renderer.domElement.removeEventListener('mousedown', onDown)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      geo.dispose()
      mat.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [total, pct]) // re-init when task count or completion changes

  if (total === 0) {
    return <EmptyState icon="search" title="No tasks" description="Create some tasks to visualise them here." />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div ref={mountRef} className="flex-1 cursor-grab active:cursor-grabbing" />
      <div className="flex items-center justify-center gap-6 border-t border-[var(--border-muted)] px-4 py-3 text-xs text-[var(--fg-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#0fba83]" /> Done — {done}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#f59e0b]" /> In progress — {doing}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#ef4444]" /> To do — {total - done - doing}
        </span>
        <span className="font-semibold text-[var(--fg)]">{pct}% complete</span>
      </div>
    </div>
  )
}
