import { useEffect, useRef } from 'react'
import { drawMosaic } from '../utils/canvas'

function makeDraggableResizable(el, onUpdate) {
  let dragging = false
  let startX, startY, startLeft, startTop

  el.addEventListener('pointerdown', e => {
    e.stopPropagation()
    dragging = true
    el._wasDragged = false
    startX = e.clientX
    startY = e.clientY
    startLeft = parseFloat(el.style.left)
    startTop = parseFloat(el.style.top)
    el.setPointerCapture(e.pointerId)
  })

  el.addEventListener('pointermove', e => {
    if (!dragging) return
    const dx = e.clientX - startX
    const dy = e.clientY - startY
    el.style.left = startLeft + dx + 'px'
    el.style.top = startTop + dy + 'px'
    el._wasDragged = true
  })

  el.addEventListener('pointerup', e => {
    dragging = false
    el.releasePointerCapture(e.pointerId)
    if (onUpdate) onUpdate(el)
  })

  const WHEEL_STEP = 1
  const WHEEL_THRESHOLD = 70
  let wheelDelta = 0
  el.addEventListener('wheel', e => {
    e.preventDefault()
    wheelDelta += e.deltaY
    let delta = 0
    while (wheelDelta <= -WHEEL_THRESHOLD) {
      delta += WHEEL_STEP
      wheelDelta += WHEEL_THRESHOLD
    }
    while (wheelDelta >= WHEEL_THRESHOLD) {
      delta -= WHEEL_STEP
      wheelDelta -= WHEEL_THRESHOLD
    }
    if (delta === 0) return
    let size = parseFloat(el.style.width)
    const centerX = parseFloat(el.style.left) + size / 2
    const centerY = parseFloat(el.style.top) + size / 2
    size += delta
    size = Math.max(10, size)
    el.style.width = size + 'px'
    el.style.height = size + 'px'
    el.style.left = centerX - size / 2 + 'px'
    el.style.top = centerY - size / 2 + 'px'
    el.style.fontSize = size + 'px'
    if (onUpdate) onUpdate(el)
  })
}

function drawMosaicCanvas(canvas, image, pixel) {
  if (!image) return
  const scaleX = image.naturalWidth / image.clientWidth
  const scaleY = image.naturalHeight / image.clientHeight
  const left = parseFloat(canvas.style.left)
  const top = parseFloat(canvas.style.top)
  const width = parseFloat(canvas.style.width)
  const height = parseFloat(canvas.style.height)
  const sx = left * scaleX
  const sy = top * scaleY
  const sw = width * scaleX
  const sh = height * scaleY
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)
  drawMosaic(ctx, image, sx, sy, sw, sh, pixel, 0, 0, width, height)
}

export default function Marker({ marker, uploadedImage, onUpdate, onToggle }) {
  const ref = useRef(null)
  const markerRef = useRef(marker)
  const imageRef = useRef(uploadedImage)
  const onUpdateRef = useRef(onUpdate)
  const onToggleRef = useRef(onToggle)


  useEffect(() => {
    markerRef.current = marker
    imageRef.current = uploadedImage
    onUpdateRef.current = onUpdate
    onToggleRef.current = onToggle
    const el = ref.current
    if (!el) return
    el.style.left = marker.x + 'px'
    el.style.top = marker.y + 'px'
    el.style.width = marker.size + 'px'
    el.style.height = marker.size + 'px'
    el.style.fontSize = marker.size + 'px'
    el.dataset.pixel = marker.pixel
    if (marker.type === 'mosaic') {
      drawMosaicCanvas(el, uploadedImage, marker.pixel)
    }
  }, [marker, uploadedImage, onUpdate, onToggle])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = el => {
      const m = markerRef.current
      const img = imageRef.current
      const x = parseFloat(el.style.left)
      const y = parseFloat(el.style.top)
      const size = parseFloat(el.style.width)
      onUpdateRef.current(m.id, { x, y, size })
      if (m.type === 'mosaic') {
        drawMosaicCanvas(el, img, m.pixel)
      }
    }
    makeDraggableResizable(el, update)
    const handleClick = e => {
      e.stopPropagation()
      if (el._wasDragged) {
        el._wasDragged = false
        return
      }
      onToggleRef.current(markerRef.current.id)
    }
    el.addEventListener('click', handleClick)
    return () => {
      el.removeEventListener('click', handleClick)
    }
  }, [])

  const className = `${marker.type === 'emoji' ? 'emoji-marker' : 'mosaic-marker'}${marker.dimmed ? ' dimmed' : ''}`

  if (marker.type === 'emoji') {
    return <span ref={ref} className={className}>{marker.emoji}</span>
  }
  return <canvas ref={ref} className={className}></canvas>
}

export { makeDraggableResizable, drawMosaicCanvas }
