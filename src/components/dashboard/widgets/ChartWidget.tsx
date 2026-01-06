'use client'

import React, { useEffect, useMemo, useState, useId } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { MoreHorizontal, Move, TrendingDown, TrendingUp } from 'lucide-react'
import { clearMetricsCache, getMetricsCached } from '../../../utils/endpoints.js'

type ChartPoint = {
  name: string
  value: number
}

interface ChartWidgetProps {
  dragHandleProps?: any
  title?: string
  collection?: string
  field?: string
  xField?: string
  limit?: number
  colorTheme?: string
}

const COLORS: Record<string, string> = {
  blue: '#60a5fa',
  purple: '#a855f7',
  emerald: '#34d399',
  orange: '#fb923c',
  rose: '#fb7185',
  cyan: '#22d3ee',
}

const CHART_MARGIN = { top: 10, right: 0, left: 8, bottom: 0 }

const getValueAtPath = (input: Record<string, unknown>, path: string) => {
  if (!path) return undefined
  const parts = path.split('.').filter(Boolean)
  let current: unknown = input

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return undefined
    }
    current = (current as Record<string, unknown>)[part]
  }

  return current
}

const toNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

const formatXAxisValue = (value: unknown, index: number) => {
  const fallback = `Item ${index + 1}`

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return fallback
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime()) && /[-/T]/.test(trimmed)) {
      return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    }
    return trimmed
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    if (Math.abs(value) > 1000000000) {
      const parsed = new Date(value)
      if (!Number.isNaN(parsed.getTime())) {
        return parsed.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }
    }
    return new Intl.NumberFormat().format(value)
  }

  return fallback
}

const formatValue = (value: number) => {
  const maximumFractionDigits = Number.isInteger(value) ? 0 : 2
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  dragHandleProps,
  title,
  collection,
  field,
  xField,
  limit = 12,
  colorTheme = 'purple',
}) => {
  const normalizedCollection = typeof collection === 'string' ? collection : ''
  const normalizedField = typeof field === 'string' ? field : ''
  const xFieldKey = typeof xField === 'string' && xField.trim() ? xField : 'createdAt'

  const safeLimit = useMemo(() => {
    const parsed = Number(limit)
    if (!Number.isFinite(parsed)) return 12
    return Math.max(1, Math.min(50, Math.floor(parsed)))
  }, [limit])

  const color = useMemo(() => COLORS[colorTheme] || COLORS.purple, [colorTheme])
  const displayTitle = useMemo(() => {
    if (title) return title
    if (normalizedCollection && normalizedField) {
      return `${normalizedCollection} ${normalizedField}`
    }
    if (normalizedCollection) return normalizedCollection
    return 'Analytics'
  }, [title, normalizedCollection, normalizedField])

  const emptyMessage = useMemo(() => {
    if (!normalizedCollection) return 'Select a collection'
    if (!normalizedField) return 'Select a numeric field'
    return 'No data found'
  }, [normalizedCollection, normalizedField])

  const gradientId = useId()

  const [data, setData] = useState<ChartPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    if (!normalizedCollection || !normalizedField) {
      setData([])
      setErrorMessage(null)
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    setIsLoading(true)
    setErrorMessage(null)

    const sortKey = xFieldKey ? `-${xFieldKey}` : undefined
    const shouldReverse = Boolean(sortKey)

    getMetricsCached({
      collection: normalizedCollection,
      limit: safeLimit,
      page: 1,
      sort: sortKey,
      depth: 0,
    })
      .then((result) => {
        if (!isMounted) return
        const docs = Array.isArray(result.docs) ? result.docs : []
        const points: ChartPoint[] = []

        for (const doc of docs) {
          if (!doc || typeof doc !== 'object') {
            continue
          }
          const record = doc as Record<string, unknown>
          const rawValue = getValueAtPath(record, normalizedField)
          const numericValue = toNumber(rawValue)
          if (numericValue === null) {
            continue
          }
          const rawLabel = xFieldKey ? getValueAtPath(record, xFieldKey) : undefined
          const label = formatXAxisValue(rawLabel, points.length)
          points.push({ name: label, value: numericValue })
        }

        const nextPoints = shouldReverse ? points.slice().reverse() : points
        setData(nextPoints)
      })
      .catch((error) => {
        if (!isMounted) return
        clearMetricsCache()
        const message = error instanceof Error ? error.message : 'Failed to load chart data'
        setErrorMessage(message)
        setData([])
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [normalizedCollection, normalizedField, safeLimit, xFieldKey])

  const totalValue = useMemo(() => {
    if (isLoading) return '...'
    if (data.length === 0) return '--'
    const latest = data[data.length - 1]?.value
    if (typeof latest !== 'number' || !Number.isFinite(latest)) return '--'
    return formatValue(latest)
  }, [data, isLoading])

  const trendPercent = useMemo(() => {
    if (data.length < 2) return null
    const prev = data[data.length - 2]?.value
    const current = data[data.length - 1]?.value
    if (!Number.isFinite(prev) || !Number.isFinite(current) || prev === 0) {
      return null
    }
    return ((current - prev) / Math.abs(prev)) * 100
  }, [data])

  const trendLabel = useMemo(() => {
    if (trendPercent === null) return null
    const sign = trendPercent >= 0 ? '+' : '-'
    return `${sign}${Math.abs(trendPercent).toFixed(1)}%`
  }, [trendPercent])

  const TrendIcon = trendPercent !== null && trendPercent >= 0 ? TrendingUp : TrendingDown

  return (
    <div className="chart-widget group">
      <div {...dragHandleProps} className="drag-handle-chart">
        <Move size={14} />
      </div>

      <div className="chart-header">
        <div className="chart-info">
          <p className="chart-subtitle">{normalizedCollection || 'Collection'}</p>
          <h3 className="chart-title">{displayTitle}</h3>
          <div className="chart-value-row">
            <span className="chart-value">{totalValue}</span>
            {trendLabel && (
              <div
                className={`chart-trend ${
                  trendPercent !== null && trendPercent >= 0 ? 'trend-positive' : 'trend-negative'
                }`}
              >
                <TrendIcon size={14} style={{ marginRight: '4px' }} />
                {trendLabel}
              </div>
            )}
          </div>
        </div>
        <button className="chart-options-btn" type="button">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="chart-container-wrapper">
        {isLoading && <div className="chart-status">Loading data...</div>}
        {!isLoading && errorMessage && (
          <div className="chart-status chart-status--error">{errorMessage}</div>
        )}
        {!isLoading && !errorMessage && data.length === 0 && (
          <div className="chart-status">{emptyMessage}</div>
        )}
        {!isLoading && !errorMessage && data.length > 0 && (
          <ResponsiveContainer width="100%" height="100%" debounce={120}>
            <AreaChart data={data} margin={CHART_MARGIN}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={56}
                tickMargin={10}
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  borderColor: '#333',
                  borderRadius: '12px',
                  color: '#fff',
                }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={3}
                fillOpacity={1}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
