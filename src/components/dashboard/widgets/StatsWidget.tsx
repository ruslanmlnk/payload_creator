'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Move,
  Activity,
  Users,
  DollarSign,
  Command,
  Box,
  FileText,
  ShoppingCart,
  Database,
  Eye,
} from 'lucide-react'
import { clearMetricsCache, getMetricsCached, type MetricOp } from '../../../utils/endpoints.js'

interface StatsWidgetProps {
  dragHandleProps?: any
  iconName?: string
  colorTheme?: string
  value?: string
  label: string
  trend?: string
  collection?: string
  metricOp?: string
  field?: string
}

const ICON_MAP: Record<string, React.ElementType> = {
  activity: Activity,
  users: Users,
  balance: DollarSign,
  dollar: DollarSign,
  command: Command,
  box: Box,
  file: FileText,
  cart: ShoppingCart,
  database: Database,
  eye: Eye,
}

export const StatsWidget: React.FC<StatsWidgetProps> = ({
  dragHandleProps,
  iconName = 'activity',
  colorTheme = 'blue',
  value,
  label,
  trend,
  collection,
  metricOp,
  field,
}) => {
  const Icon = ICON_MAP[iconName] || Activity
  const themeClass = `theme-${colorTheme}`
  const opLabel = metricOp ? metricOp.toUpperCase() : ''
  const [metricValue, setMetricValue] = useState<string>(value || '--')
  const [isLoading, setIsLoading] = useState(false)

  const normalizedOp = (metricOp || '').toLowerCase() as MetricOp
  const canFetch =
    Boolean(collection) && Boolean(normalizedOp) && (normalizedOp === 'count' || Boolean(field))

  const formattedValue = useMemo(() => {
    return isLoading ? '...' : metricValue
  }, [isLoading, metricValue])

  useEffect(() => {
    let isMounted = true

    if (!canFetch || !collection) {
      setMetricValue(value || '--')
      return () => {
        isMounted = false
      }
    }

    setIsLoading(true)

    getMetricsCached({
      collection,
      field,
      op: normalizedOp,
    })
      .then((result) => {
        if (!isMounted) return
        const rawValue = result?.value
        let nextValue = '--'

        if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
          nextValue = new Intl.NumberFormat(undefined, {
            maximumFractionDigits: normalizedOp === 'avg' ? 2 : 0,
          }).format(rawValue)
        } else if (typeof rawValue === 'string') {
          const asNumber = Number(rawValue)
          if (!Number.isNaN(asNumber) && rawValue.trim() !== '') {
            nextValue = new Intl.NumberFormat(undefined, {
              maximumFractionDigits: normalizedOp === 'avg' ? 2 : 0,
            }).format(asNumber)
          } else {
            const parsed = new Date(rawValue)
            nextValue = Number.isNaN(parsed.getTime()) ? rawValue : parsed.toLocaleString()
          }
        } else if (rawValue === null) {
          nextValue = '--'
        }

        setMetricValue(nextValue)
      })
      .catch(() => {
        if (!isMounted) return
        clearMetricsCache()
        setMetricValue(value || '--')
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [canFetch, collection, field, normalizedOp, value])

  return (
    <div className="stats-widget group">
      <div {...dragHandleProps} className="stats-drag-handle">
        <Move size={12} />
      </div>

      <div className="stats-header">
        <div className={`stats-icon-box ${themeClass}`}>
          <Icon size={24} />
        </div>
        {trend && <span className={`stats-trend ${themeClass}`}>{trend}</span>}
      </div>

      <div className="stats-content">
        <h4 className="stats-value" title={formattedValue}>
          {formattedValue}
        </h4>
        <div className="stats-meta">
          <p className="stats-label">{label}</p>
          {collection && <span className="stats-collection-badge">{collection}</span>}
          {opLabel && <span className="stats-collection-badge">{opLabel}</span>}
        </div>
      </div>
    </div>
  )
}
