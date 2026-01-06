export type WidgetType =
  | 'hero'
  | 'chart'
  | 'stats'
  | 'list'
  | 'cms-list'
  | 'shortcuts'
  | 'storage'
  | 'comments'
  | 'collections'

export interface WidgetData {
  id: string
  type: WidgetType
  title?: string
  colSpan: number
  rowSpan: number
  content?: {
    label?: string
    value?: string
    icon?: string
    color?: string
    collection?: string
    trend?: string
    dataType?: 'posts' | 'products' | 'users'
    [key: string]: any
  }
}

export interface DraggableItemProps {
  id: string
  children: React.ReactNode
  className?: string
  colSpan: number
  rowSpan: number
}
