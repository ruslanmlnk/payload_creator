import { useState, useEffect, useCallback, useRef } from 'react'
import { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import type { WidgetData, WidgetType } from '../types.js'
import { getDashboardLayout, saveDashboardLayout } from '../../../utils/endpoints.js'

export const useDashboardState = () => {
  const [items, setItems] = useState<WidgetData[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const saveTimeoutRef = useRef<number | null>(null)

  const [activeId, setActiveId] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const lastOverIdRef = useRef<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadLayout = async () => {
      try {
        const data = await getDashboardLayout<WidgetData[]>()
        const layout = Array.isArray(data?.layout) ? data.layout : []

        if (isMounted) {
          setItems(layout)
          setIsLoaded(true)
        }
      } catch (e) {
        if (isMounted) {
          console.error('Failed to load dashboard layout', e)
          setIsLoaded(true)
        }
      }
    }

    loadLayout()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) {
      return
    }

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        await saveDashboardLayout(items)
      } catch (e) {
        console.error('Failed to save dashboard layout', e)
      }
    }, 400)

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [items, isLoaded])

  const addWidget = useCallback(
    (type: WidgetType, config: any = {}, defaultCol = 4, defaultRow = 2) => {
      const id = Date.now().toString()
      const newWidget: WidgetData = {
        id,
        type,
        colSpan: defaultCol,
        rowSpan: defaultRow,
        title: config.title || 'Widget',
        content: config,
      }
      setItems((prev) => [...prev, newWidget])
      setIsPickerOpen(false)
    },
    [],
  )

  const removeWidget = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const updateWidgetConfig = useCallback((id: string, newConfig: any) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, content: { ...item.content, ...newConfig } } : item,
      ),
    )
  }, [])

  const handleResize = useCallback((id: string, newSpan: number) => {
    setItems((prev) => {
      let changed = false
      const next = prev.map((item) => {
        if (item.id !== id) {
          return item
        }
        if (item.colSpan === newSpan) {
          return item
        }
        changed = true
        return { ...item, colSpan: newSpan }
      })
      return changed ? next : prev
    })
  }, [])

  const handleResizeRow = useCallback((id: string, newRowSpan: number) => {
    setItems((prev) => {
      let changed = false
      const next = prev.map((item) => {
        if (item.id !== id) {
          return item
        }
        if (item.rowSpan === newRowSpan) {
          return item
        }
        changed = true
        return { ...item, rowSpan: newRowSpan }
      })
      return changed ? next : prev
    })
  }, [])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
    lastOverIdRef.current = null
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event
    if (!over) {
      lastOverIdRef.current = null
      return
    }

    if (active.id === over.id) {
      return
    }

    const overId = String(over.id)
    if (lastOverIdRef.current === overId) {
      return
    }
    lastOverIdRef.current = overId

    const activeId = String(active.id)

    setItems((currentItems) => {
      const activeIndex = currentItems.findIndex((i) => i.id === activeId)
      const overIndex = currentItems.findIndex((i) => i.id === overId)

      if (activeIndex === -1 || overIndex === -1) {
        return currentItems
      }

      if (activeIndex !== overIndex) {
        return arrayMove(currentItems, activeIndex, overIndex)
      }

      return currentItems
    })
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)
    lastOverIdRef.current = null

    if (!over || active.id === over.id) {
      return
    }

    setItems((currentItems) => {
      const activeIndex = currentItems.findIndex((i) => i.id === active.id)
      const overIndex = currentItems.findIndex((i) => i.id === over.id)

      if (activeIndex === -1 || overIndex === -1) {
        return currentItems
      }

      if (activeIndex !== overIndex) {
        return arrayMove(currentItems, activeIndex, overIndex)
      }

      return currentItems
    })
  }, [])

  return {
    items,
    activeId,
    isPickerOpen,
    isLoaded,
    setIsPickerOpen,
    addWidget,
    removeWidget,
    updateWidgetConfig,
    handleResize,
    handleResizeRow,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  }
}
