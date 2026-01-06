'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useSortable, AnimateLayoutChanges, defaultAnimateLayoutChanges } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X } from 'lucide-react'

interface SortableItemProps {
  id: string
  colSpan: number
  rowSpan: number
  onResize: (id: string, newSpan: number) => void
  onResizeRow: (id: string, newRowSpan: number) => void
  onRemove: () => void
  children: (dragHandleProps: any) => React.ReactNode
}

const animateLayoutChanges: AnimateLayoutChanges = (args) => {
  const { isSorting, wasDragging } = args
  if (isSorting || wasDragging) {
    return defaultAnimateLayoutChanges(args)
  }
  return false
}

export const SortableItem: React.FC<SortableItemProps> = ({
  id,
  colSpan,
  rowSpan,
  onResize,
  onResizeRow,
  onRemove,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    animateLayoutChanges,
  })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? undefined : transition,
    opacity: isDragging ? 0.3 : 1,
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
    zIndex: isDragging ? 50 : 'auto',
  }

  const nodeRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDims, setResizeDims] = useState<{ width: number; height: number } | null>(null)

  const resizeDimsRef = useRef<{ width: number; height: number } | null>(null)

  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const startWidthRef = useRef(0)
  const startHeightRef = useRef(0)
  const startSpanRef = useRef(colSpan)
  const startRowSpanRef = useRef(rowSpan)

  useEffect(() => {
    if (isResizing) {
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
    return () => {
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handleResizeStart = (e: React.PointerEvent, direction: 'width' | 'height') => {
    e.preventDefault()
    e.stopPropagation()

    if (!nodeRef.current) return

    const rect = nodeRef.current.getBoundingClientRect()

    setIsResizing(true)
    const initialDims = { width: rect.width, height: rect.height }
    setResizeDims(initialDims)
    resizeDimsRef.current = initialDims

    startXRef.current = e.clientX
    startYRef.current = e.clientY
    startWidthRef.current = rect.width
    startHeightRef.current = rect.height
    startSpanRef.current = colSpan
    startRowSpanRef.current = rowSpan

    const moveHandler = (ev: PointerEvent) => handleResizeMove(ev, direction)
    const upHandler = () => handleResizeEnd(moveHandler, upHandler)

    window.addEventListener('pointermove', moveHandler)
    window.addEventListener('pointerup', upHandler)
  }

  const handleResizeMove = (e: PointerEvent, direction: 'width' | 'height') => {
    let newWidth = startWidthRef.current
    let newHeight = startHeightRef.current

    if (direction === 'width') {
      const deltaX = e.clientX - startXRef.current
      newWidth = Math.max(100, startWidthRef.current + deltaX)
    } else {
      const deltaY = e.clientY - startYRef.current
      newHeight = Math.max(100, startHeightRef.current + deltaY)
    }

    const newDims = { width: newWidth, height: newHeight }

    resizeDimsRef.current = newDims
    setResizeDims(newDims)
  }

  const handleResizeEnd = (moveHandler: (ev: PointerEvent) => void, upHandler: () => void) => {
    window.removeEventListener('pointermove', moveHandler)
    window.removeEventListener('pointerup', upHandler)

    setIsResizing(false)

    const finalDims = resizeDimsRef.current

    if (finalDims) {
      const gridGap = 24
      const currentTotalWidth = startWidthRef.current
      const startSpan = startSpanRef.current

      const colUnit = (currentTotalWidth + gridGap) / startSpan

      const finalWidth = finalDims.width
      const newColSpan = Math.round((finalWidth + gridGap) / colUnit)
      const clampedColSpan = Math.max(2, Math.min(12, newColSpan))

      if (clampedColSpan !== startSpan) {
        onResize(id, clampedColSpan)
      }

      const baseRowHeight = 180
      const rowUnit = baseRowHeight + gridGap
      const startRowSpan = startRowSpanRef.current
      const finalHeight = finalDims.height

      const newRowSpan = Math.round((finalHeight + gridGap) / rowUnit)
      const clampedRowSpan = Math.max(1, Math.min(10, newRowSpan))

      if (clampedRowSpan !== startRowSpan) {
        onResizeRow(id, clampedRowSpan)
      }
    }

    setResizeDims(null)
    resizeDimsRef.current = null
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      className={`sortable-item${isResizing ? ' sortable-item--resizing' : ''}`}
      id={`widget-${id}`}
    >
      <div ref={nodeRef} className="sortable-item__frame">
        <div
          ref={contentRef}
          className={`sortable-item__content${isResizing ? ' sortable-item__content--resizing' : ''}`}
          style={
            isResizing && resizeDims ? { width: resizeDims.width, height: resizeDims.height } : {}
          }
        >
          {children({ ...listeners })}

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onRemove()
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="sortable-item__remove"
            title="Remove Widget"
            type="button"
          >
            <X size={14} strokeWidth={3} />
          </button>

          <div
            onPointerDown={(e) => handleResizeStart(e, 'width')}
            onMouseDown={(e) => e.stopPropagation()}
            className="sortable-item__resize sortable-item__resize--width"
          >
            <div className="sortable-item__resize-bar" />
          </div>

          <div
            onPointerDown={(e) => handleResizeStart(e, 'height')}
            onMouseDown={(e) => e.stopPropagation()}
            className="sortable-item__resize sortable-item__resize--height"
          >
            <div className="sortable-item__resize-bar" />
          </div>
        </div>

        {isResizing && <div className="sortable-item__ghost" />}
      </div>
    </div>
  )
}
