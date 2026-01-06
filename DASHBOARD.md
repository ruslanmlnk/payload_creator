# Туторіал: drag + resize з нуля (покроково)

Це повний гайд для проекту `d:\payload_creator\test`.
Мета: зібрати drag‑систему на `@dnd-kit`, подивитися логи сенсорів,
зробити reorder, overlay і **плавний resize з snap після відпускання**.

## 0) Старт

```bash
cd d:\payload_creator\test
pnpm install
pnpm dev
```

Файли:
- `test/App.tsx`
- `test/index.css`
- `test/components/SortableItem.tsx`

---

## 1) Базовий грід

`test/index.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  background: #0b0b0f;
  color: #f9fafb;
}

.dashboard {
  padding: 32px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-rows: 120px;
  gap: 16px;
}

.card {
  height: 100%;
  border-radius: 16px;
  background: #16161d;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px;
  position: relative;
}

.card-title {
  font-weight: 600;
}
```

`test/App.tsx`:

```tsx
import React from 'react'
import './index.css'

export default function App() {
  return (
    <div className="dashboard">
      <h1>Dashboard Sandbox</h1>
      <div className="grid">
        <div className="card" style={{ gridColumn: 'span 4', gridRow: 'span 1' }}>
          <div className="card-title">Widget A</div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', gridRow: 'span 2' }}>
          <div className="card-title">Widget B</div>
        </div>
        <div className="card" style={{ gridColumn: 'span 4', gridRow: 'span 1' }}>
          <div className="card-title">Widget C</div>
        </div>
      </div>
    </div>
  )
}
```

---

## 2) Модель даних

```tsx
type Widget = {
  id: string
  title: string
  colSpan: number
  rowSpan: number
}

const initialWidgets: Widget[] = [
  { id: 'a', title: 'Widget A', colSpan: 4, rowSpan: 1 },
  { id: 'b', title: 'Widget B', colSpan: 4, rowSpan: 2 },
  { id: 'c', title: 'Widget C', colSpan: 4, rowSpan: 1 },
]
```

Рендеримо через `map`, використовуючи `colSpan/rowSpan`.

---

## 3) DnD контекст + логи сенсорів

На цьому кроці drag ще не працює, але ми вже бачимо логи подій
(коли додамо draggable елементи).

```tsx
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragMoveEvent, DragEndEvent } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

const sensors = useSensors(
  useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
)

const handleDragStart = (event: DragStartEvent) => {
  const { active, activatorEvent } = event
  console.log('drag start id:', active.id)
  if (activatorEvent instanceof PointerEvent || activatorEvent instanceof MouseEvent) {
    console.log('pointer:', activatorEvent.clientX, activatorEvent.clientY)
  }
}

const handleDragMove = (event: DragMoveEvent) => {
  console.log('drag move delta:', event.delta)
}

const handleDragEnd = (event: DragEndEvent) => {
  console.log('drag end', event.active.id)
}
```

---

## 4) Робимо елементи draggable (SortableItem)

Створи `test/components/SortableItem.tsx`:

```tsx
import React from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type Props = {
  id: string
  colSpan: number
  rowSpan: number
  children: React.ReactNode
}

export function SortableItem({ id, colSpan, rowSpan, children }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    gridColumn: `span ${colSpan}`,
    gridRow: `span ${rowSpan}`,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="card">
        <button className="drag-handle" {...listeners} type="button">
          :::
        </button>
        {children}
      </div>
    </div>
  )
}
```

Додай хендл‑стилі:

```css
.drag-handle {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 999px;
  width: 32px;
  height: 32px;
  cursor: grab;
}

.drag-handle:active {
  cursor: grabbing;
}
```

І в `App.tsx`:

```tsx
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable'
import { SortableItem } from './components/SortableItem'

<DndContext ...>
  <SortableContext items={widgets.map((w) => w.id)} strategy={rectSortingStrategy}>
    <div className="grid">
      {widgets.map((w) => (
        <SortableItem key={w.id} id={w.id} colSpan={w.colSpan} rowSpan={w.rowSpan}>
          <div className="card-title">{w.title}</div>
        </SortableItem>
      ))}
    </div>
  </SortableContext>
</DndContext>
```

---

## 5) Reorder (arrayMove)

```tsx
import { arrayMove } from '@dnd-kit/sortable'

const [widgets, setWidgets] = useState(initialWidgets)

const handleDragEnd = ({ active, over }: DragEndEvent) => {
  if (!over || active.id === over.id) return
  setWidgets((prev) => {
    const oldIndex = prev.findIndex((w) => w.id === active.id)
    const newIndex = prev.findIndex((w) => w.id === over.id)
    return arrayMove(prev, oldIndex, newIndex)
  })
}
```

---

## 6) Drag overlay (опціонально)

```tsx
import { DragOverlay } from '@dnd-kit/core'

const [activeId, setActiveId] = useState<string | null>(null)

const handleDragStart = (event: DragStartEvent) => {
  setActiveId(event.active.id as string)
}

const handleDragEnd = (event: DragEndEvent) => {
  setActiveId(null)
  // ... arrayMove
}
```

```tsx
<DragOverlay>
  {activeId ? <div className="card">Dragging {activeId}</div> : null}
</DragOverlay>
```

---

## 7) Плавний resize + snap після відпускання

**Ідея:**  
Поки тягнеш — міняємо ширину/висоту в пікселях (плавно).  
Коли відпускаєш — рахуємо `colSpan/rowSpan` і “снапимося” до сітки.

### 7.1) Пропси

```tsx
type Props = {
  id: string
  colSpan: number
  rowSpan: number
  onResize: (id: string, newColSpan: number) => void
  onResizeRow: (id: string, newRowSpan: number) => void
  children: React.ReactNode
}
```

### 7.2) Логіка

```tsx
const GRID_GAP = 16
const ROW_HEIGHT = 120
const MIN_COLS = 2
const MAX_COLS = 8
const MIN_ROWS = 1
const MAX_ROWS = 4
const MIN_PX = 80

const [isResizing, setIsResizing] = useState(false)
const [resizeDims, setResizeDims] = useState<{ width: number; height: number } | null>(null)
const resizeDimsRef = useRef<{ width: number; height: number } | null>(null)

const handleResizeStart = (e: React.PointerEvent, dir: 'width' | 'height') => {
  e.preventDefault()
  e.stopPropagation()
  const rect = frameRef.current!.getBoundingClientRect()
  setIsResizing(true)

  const initialDims = { width: rect.width, height: rect.height }
  setResizeDims(initialDims)
  resizeDimsRef.current = initialDims

  const startWidth = rect.width
  const startHeight = rect.height
  const startX = e.clientX
  const startY = e.clientY

  const onMove = (ev: PointerEvent) => {
    let nextWidth = startWidth
    let nextHeight = startHeight
    if (dir === 'width') {
      nextWidth = Math.max(MIN_PX, startWidth + (ev.clientX - startX))
    } else {
      nextHeight = Math.max(MIN_PX, startHeight + (ev.clientY - startY))
    }
    const nextDims = { width: nextWidth, height: nextHeight }
    resizeDimsRef.current = nextDims
    setResizeDims(nextDims)
  }

  const onUp = () => {
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerup', onUp)
    setIsResizing(false)

    const finalDims = resizeDimsRef.current
    if (finalDims) {
      if (dir === 'width') {
        const colUnit = (startWidth + GRID_GAP) / colSpan
        const newCol = Math.round((finalDims.width + GRID_GAP) / colUnit)
        const snappedCol = Math.max(MIN_COLS, Math.min(MAX_COLS, newCol))
        onResize(id, snappedCol)
      } else {
        const rowUnit = ROW_HEIGHT + GRID_GAP
        const newRow = Math.round((finalDims.height + GRID_GAP) / rowUnit)
        const snappedRow = Math.max(MIN_ROWS, Math.min(MAX_ROWS, newRow))
        onResizeRow(id, snappedRow)
      }
    }

    setResizeDims(null)
    resizeDimsRef.current = null
  }

  window.addEventListener('pointermove', onMove)
  window.addEventListener('pointerup', onUp)
}
```

### 7.3) Обгортка для плавного розміру

```tsx
<div ref={frameRef} className="resize-frame">
  <div
    className={`resize-box${isResizing ? ' resize-box--active' : ''}`}
    style={isResizing && resizeDims ? { width: resizeDims.width, height: resizeDims.height } : undefined}
  >
    <div className="card">
      <button className="drag-handle" {...listeners} type="button">:::</button>
      <div className="resize-handle resize-handle--width" onPointerDown={(e) => handleResizeStart(e, 'width')} />
      <div className="resize-handle resize-handle--height" onPointerDown={(e) => handleResizeStart(e, 'height')} />
      {children}
    </div>
  </div>
</div>
```

### 7.4) CSS для плавності

```css
.resize-frame {
  width: 100%;
  height: 100%;
  position: relative;
}

.resize-box {
  width: 100%;
  height: 100%;
  transition: width 0.2s ease, height 0.2s ease;
}

.resize-box--active {
  position: absolute;
  top: 0;
  left: 0;
  transition: none;
  z-index: 10;
}

.resize-handle {
  position: absolute;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.resize-handle--width {
  width: 10px;
  right: -6px;
  top: 0;
  bottom: 0;
  cursor: ew-resize;
}

.resize-handle--height {
  height: 10px;
  left: 0;
  right: 0;
  bottom: -6px;
  cursor: ns-resize;
}
```

---

## 8) Збереження у localStorage

```tsx
const STORAGE_KEY = 'dashboard_layout_v1'

const [widgets, setWidgets] = useState<Widget[]>(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : initialWidgets
})

React.useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets))
}, [widgets])
```

---

## 9) Далі можна

- Додати picker для створення різних типів віджетів.
- Додати графіки (`recharts`).
- Додати модифікатори snapping під час drag.
