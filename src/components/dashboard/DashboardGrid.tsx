'use client'

import React, { useMemo } from 'react'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  DropAnimation,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'

import { useDashboardState } from './hooks/useDashboardState.js'
import type { WidgetData } from './types.js'
import './Dashboard.css'
import { SortableItem } from './SortableItem.js'
import { WidgetPicker } from './WidgetPicker.js'
import { HeroWidget } from './widgets/HeroWidget.js'
import { ChartWidget } from './widgets/ChartWidget.js'
import { StatsWidget } from './widgets/StatsWidget.js'
import { ListWidget } from './widgets/ListWidget.js'
import { CMSListWidget } from './widgets/CMSListWidget.js'
import { QuickActionsWidget } from './widgets/QuickActionsWidget.js'
import { StorageWidget } from './widgets/StorageWidget.js'
import { RecentCommentsWidget } from './widgets/RecentCommentsWidget.js'
import { CollectionsWidget } from './widgets/CollectionsWidget.js'

const POINTER_SENSOR_OPTIONS = { activationConstraint: { distance: 5 } }
const KEYBOARD_SENSOR_OPTIONS = { coordinateGetter: sortableKeyboardCoordinates }

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: { opacity: '0.4' },
    },
  }),
}

const collisionDetectionStrategy: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args)
  return pointerCollisions.length > 0 ? pointerCollisions : rectIntersection(args)
}

export const DashboardGrid = () => {
  const {
    items,
    activeId,
    isPickerOpen,
    isLoaded,
    setIsPickerOpen,
    addWidget,
    removeWidget,
    handleResize,
    handleResizeRow,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  } = useDashboardState()

  const sensors = useSensors(
    useSensor(PointerSensor, POINTER_SENSOR_OPTIONS),
    useSensor(KeyboardSensor, KEYBOARD_SENSOR_OPTIONS),
  )

  const renderWidget = (widget: WidgetData, dragHandleProps: any) => {
    switch (widget.type) {
      case 'hero':
        return <HeroWidget dragHandleProps={dragHandleProps} />
      case 'chart':
        return (
          <ChartWidget
            dragHandleProps={dragHandleProps}
            title={widget.content?.title}
            collection={widget.content?.collection}
            field={widget.content?.field}
            xField={widget.content?.xField}
            limit={widget.content?.limit}
            colorTheme={widget.content?.color}
          />
        )
      case 'stats':
        return (
          <StatsWidget
            dragHandleProps={dragHandleProps}
            iconName={widget.content?.icon}
            colorTheme={widget.content?.color}
            value={widget.content?.value || '0'}
            label={widget.content?.label || 'Label'}
            collection={widget.content?.collection}
            field={widget.content?.field}
            metricOp={widget.content?.op}
            trend={widget.content?.trend}
          />
        )
      case 'list':
        return <ListWidget dragHandleProps={dragHandleProps} />
      case 'cms-list':
        return (
          <CMSListWidget
            dragHandleProps={dragHandleProps}
            collection={widget.content?.collection || widget.content?.dataType}
            title={widget.content?.title}
            limit={widget.content?.limit}
            fields={widget.content?.fields}
          />
        )
      case 'shortcuts':
        return <QuickActionsWidget dragHandleProps={dragHandleProps} />
      case 'storage':
        return <StorageWidget dragHandleProps={dragHandleProps} />
      case 'comments':
        return <RecentCommentsWidget dragHandleProps={dragHandleProps} />
      case 'collections':
        return <CollectionsWidget dragHandleProps={dragHandleProps} />
      default:
        return null
    }
  }

  const activeWidget = items.find((x) => x.id === activeId)
  const sortableIds = useMemo(() => items.map((item) => item.id), [items])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="custom-dashboard__container">
        {!isLoaded ? (
          <div className="custom-dashboard__loading">
            <div className="custom-dashboard__spinner" aria-hidden="true" />
            <div className="custom-dashboard__loading-text">Loading dashboard...</div>
          </div>
        ) : (
          <div className="custom-dashboard__body">
            <div className="custom-dashboard__header">
              <div className="custom-dashboard__headline">
                <h1 className="custom-dashboard__title">CMS Dashboard</h1>
                <p className="custom-dashboard__subtitle">
                  Manage your content and analyze performance.
                </p>
              </div>
              <div className="custom-dashboard__actions">
                <button onClick={() => setIsPickerOpen(true)} className="custom-dashboard__add-btn">
                  <Plus size={16} />
                  Add Widget
                </button>
              </div>
            </div>

            {items.length === 0 && (
              <div className="custom-dashboard__empty">
                <div className="custom-dashboard__empty-icon">
                  <Plus size={40} />
                </div>
                <h3 className="custom-dashboard__empty-title">Workspace Ready</h3>
                <p className="custom-dashboard__empty-text">
                  Configure your CMS dashboard. Add metrics for collections, content lists, or quick
                  action shortcuts.
                </p>
                <button
                  onClick={() => setIsPickerOpen(true)}
                  className="custom-dashboard__empty-btn"
                >
                  Start Adding
                </button>
              </div>
            )}

            <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
              <div className="custom-dashboard__grid">
                {items.map((widget) => (
                  <SortableItem
                    key={widget.id}
                    id={widget.id}
                    colSpan={widget.colSpan}
                    rowSpan={widget.rowSpan}
                    onResize={handleResize}
                    onResizeRow={handleResizeRow}
                    onRemove={() => removeWidget(widget.id)}
                  >
                    {(dragHandleProps) => renderWidget(widget, dragHandleProps)}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </div>
        )}

        <DragOverlay dropAnimation={dropAnimation}>
          {activeWidget ? (
            <div
              className="custom-dashboard__drag-preview"
              style={{
                width: '100%',
                maxWidth: activeWidget.colSpan === 12 ? '100%' : '600px',
                height: `${activeWidget.rowSpan * 180 + (activeWidget.rowSpan - 1) * 24}px`,
                cursor: 'grabbing',
              }}
            >
              {renderWidget(activeWidget, {})}
            </div>
          ) : null}
        </DragOverlay>

        <WidgetPicker
          isOpen={isPickerOpen}
          onClose={() => setIsPickerOpen(false)}
          onSelect={addWidget}
        />
      </div>
    </DndContext>
  )
}
