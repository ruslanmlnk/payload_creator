'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Move, ExternalLink, FileText, Image as ImageIcon, ShoppingBag, Users } from 'lucide-react'
import { useConfig } from '@payloadcms/ui'
import {
  clearCollectionsCache,
  clearMetricsCache,
  getCollectionsCached,
  getMetricsCached,
} from '../../../utils/endpoints.js'

interface CMSListWidgetProps {
  dragHandleProps?: any
  collection?: string
  title?: string
  limit?: number
  fields?: string[]
}

type RowItem = {
  id: string
  record: Record<string, unknown>
}

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

const formatFieldLabel = (field: string) =>
  field
    .replace(/\./g, ' / ')
    .replace(/[_-]/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, (char) => char.toUpperCase())

const formatCellValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return '—'
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return '—'
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime()) && trimmed.includes('-')) {
      return parsed.toLocaleDateString()
    }
    return trimmed
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat().format(value)
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (value instanceof Date) {
    return value.toLocaleDateString()
  }

  if (Array.isArray(value)) {
    return value.length ? `${value.length} items` : '—'
  }

  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    const fallback =
      (typeof record.title === 'string' && record.title) ||
      (typeof record.name === 'string' && record.name) ||
      (typeof record.label === 'string' && record.label) ||
      (typeof record.slug === 'string' && record.slug)
    if (fallback) {
      return fallback
    }
    try {
      const json = JSON.stringify(record)
      return json.length > 60 ? `${json.slice(0, 57)}...` : json
    } catch {
      return '—'
    }
  }

  return String(value)
}

const getIcon = (slug = '') => {
  const normalized = slug.toLowerCase()
  if (normalized.includes('media') || normalized.includes('upload')) return ImageIcon
  if (normalized.includes('user')) return Users
  if (normalized.includes('product') || normalized.includes('shop')) return ShoppingBag
  return FileText
}

export const CMSListWidget: React.FC<CMSListWidgetProps> = ({
  dragHandleProps,
  collection,
  title,
  limit = 5,
  fields: selectedFieldsProp,
}) => {
  const [rows, setRows] = useState<RowItem[]>([])
  const [collectionFields, setCollectionFields] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const configContext = useConfig()
  const adminBase =
    configContext?.config?.routes?.admin || configContext?.config?.admin?.route || '/admin'

  const safeLimit = useMemo(() => {
    const parsed = Number(limit)
    if (!Number.isFinite(parsed)) return 5
    return Math.max(1, Math.min(50, Math.floor(parsed)))
  }, [limit])

  const displayTitle = title || (collection ? `Recent ${collection}` : 'Collection')
  const Icon = getIcon(collection || '')
  const availableFields = useMemo(() => {
    const unique = new Set<string>()
    for (const field of collectionFields) {
      if (typeof field === 'string' && field.trim()) {
        unique.add(field)
      }
    }
    return Array.from(unique)
  }, [collectionFields])

  const selectedFields = useMemo(() => {
    if (!Array.isArray(selectedFieldsProp)) {
      return []
    }
    return selectedFieldsProp.filter((field) => typeof field === 'string' && field.trim())
  }, [selectedFieldsProp])

  const displayFields = useMemo(() => {
    if (selectedFields.length === 0) {
      return availableFields
    }
    if (availableFields.length === 0) {
      return selectedFields
    }
    const filtered = selectedFields.filter((field) => availableFields.includes(field))
    return filtered.length > 0 ? filtered : availableFields
  }, [availableFields, selectedFields])

  useEffect(() => {
    let isMounted = true

    if (!collection) {
      setCollectionFields([])
      return () => {
        isMounted = false
      }
    }

    getCollectionsCached()
      .then((data) => {
        if (!isMounted) return
        const list = Array.isArray(data.collections) ? data.collections : []
        const match = list.find((item) => item.slug === collection)
        const nextFields = Array.isArray(match?.fields) ? match?.fields : []
        setCollectionFields(nextFields)
      })
      .catch((error) => {
        if (!isMounted) return
        clearCollectionsCache()
        const message = error instanceof Error ? error.message : 'Failed to load fields'
        setErrorMessage(message)
        setCollectionFields([])
      })

    return () => {
      isMounted = false
    }
  }, [collection])

  useEffect(() => {
    let isMounted = true

    if (!collection) {
      setRows([])
      setErrorMessage(null)
      setIsLoading(false)
      return () => {
        isMounted = false
      }
    }

    setIsLoading(true)
    setErrorMessage(null)

    getMetricsCached({
      collection,
      limit: safeLimit,
      page: 1,
      sort: '-createdAt',
    })
      .then((result) => {
        if (!isMounted) return
        const docs = Array.isArray(result.docs) ? result.docs : []
        const nextRows = docs.map((doc, index) => {
          const record = doc && typeof doc === 'object' ? (doc as Record<string, unknown>) : {}
          const idRaw = record.id ?? record._id ?? index + 1
          const id =
            typeof idRaw === 'string' || typeof idRaw === 'number'
              ? String(idRaw)
              : String(index + 1)
          return { id, record }
        })
        setRows(nextRows)
      })
      .catch((error) => {
        if (!isMounted) return
        clearMetricsCache()
        const message = error instanceof Error ? error.message : 'Failed to load records'
        setErrorMessage(message)
        setRows([])
      })
      .finally(() => {
        if (!isMounted) return
        setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [collection, safeLimit])

  const handleViewAll = () => {
    if (!collection) return
    const target = `${adminBase.replace(/\/$/, '')}/collections/${collection}`
    window.location.assign(target)
  }

  return (
    <div className="cms-list-widget group">
      <div {...dragHandleProps} className="cms-list-drag">
        <Move size={14} />
      </div>

      <div className="cms-header">
        <div className="cms-title-group">
          <div className="cms-icon-box">
            <Icon size={18} />
          </div>
          <h3 className="cms-widget-title">{displayTitle}</h3>
        </div>
        <button
          className="btn-view-all"
          type="button"
          onClick={handleViewAll}
          disabled={!collection}
        >
          View All <ExternalLink size={12} />
        </button>
      </div>

      <div className="cms-content custom-scrollbar">
        <table className="cms-table">
          <thead className="cms-thead">
            <tr>
              {displayFields.length > 0 ? (
                displayFields.map((field) => (
                  <th key={field} className="cms-th">
                    {formatFieldLabel(field)}
                  </th>
                ))
              ) : (
                <th className="cms-th">Fields</th>
              )}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr className="cms-row">
                <td className="cms-td" colSpan={Math.max(displayFields.length, 1)}>
                  Loading records...
                </td>
              </tr>
            )}
            {!isLoading && errorMessage && (
              <tr className="cms-row">
                <td className="cms-td" colSpan={Math.max(displayFields.length, 1)}>
                  {errorMessage}
                </td>
              </tr>
            )}
            {!isLoading && !errorMessage && displayFields.length === 0 && (
              <tr className="cms-row">
                <td className="cms-td" colSpan={1}>
                  No fields found for this collection.
                </td>
              </tr>
            )}
            {!isLoading && !errorMessage && displayFields.length > 0 && rows.length === 0 && (
              <tr className="cms-row">
                <td className="cms-td" colSpan={displayFields.length}>
                  No records found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !errorMessage &&
              displayFields.length > 0 &&
              rows.map((item) => (
                <tr key={item.id} className="cms-row group/row">
                  {displayFields.map((field) => (
                    <td key={field} className="cms-td">
                      <span className="cms-cell-value">
                        {formatCellValue(getValueAtPath(item.record, field))}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
