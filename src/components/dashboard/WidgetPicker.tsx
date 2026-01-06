'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  X,
  LayoutTemplate,
  BarChart3,
  Activity,
  List,
  Check,
  ChevronLeft,
  Box,
  FileText,
  Users,
  ShoppingBag,
  Zap,
  Database,
  HardDrive,
  MessageSquare,
  Layers,
} from 'lucide-react'
import type { WidgetType } from './types.js'
import type { CollectionsGetResponse } from '../../utils/endpoints.js'
import { clearCollectionsCache, getCollectionsCached } from '../../utils/endpoints.js'

interface WidgetOption {
  type: WidgetType
  title: string
  description: string
  icon: React.ElementType
  defaultCol: number
  defaultRow: number
  requiresConfig?: boolean
}

const options: WidgetOption[] = [
  {
    type: 'stats',
    title: 'Metric Card',
    description: 'Single metric with icon, ideal for CMS fields.',
    icon: Activity,
    defaultCol: 3,
    defaultRow: 1,
    requiresConfig: true,
  },
  {
    type: 'chart',
    title: 'Analytics Chart',
    description: 'Data visualization for collections.',
    icon: BarChart3,
    defaultCol: 4,
    defaultRow: 2,
    requiresConfig: true,
  },
  {
    type: 'collections',
    title: 'Collection Cards',
    description: 'Grid view of content types and counts.',
    icon: Layers,
    defaultCol: 4,
    defaultRow: 2,
  },
  {
    type: 'cms-list',
    title: 'CMS Collection',
    description: 'Table view for Posts, Products, or Users.',
    icon: Database,
    defaultCol: 6,
    defaultRow: 2,
    requiresConfig: true,
  },
  {
    type: 'hero',
    title: 'System Status',
    description: 'Large welcome banner with system overview.',
    icon: LayoutTemplate,
    defaultCol: 8,
    defaultRow: 2,
  },
  {
    type: 'shortcuts',
    title: 'Quick Actions',
    description: 'Grid of shortcut buttons for admin tasks.',
    icon: Zap,
    defaultCol: 3,
    defaultRow: 2,
  },
  {
    type: 'storage',
    title: 'Storage Usage',
    description: 'Server disk space visualization.',
    icon: HardDrive,
    defaultCol: 3,
    defaultRow: 2,
  },
  {
    type: 'comments',
    title: 'Moderation',
    description: 'Recent comments pending approval.',
    icon: MessageSquare,
    defaultCol: 4,
    defaultRow: 2,
  },
  {
    type: 'list',
    title: 'Activity Feed',
    description: 'Simple log of recent system events.',
    icon: List,
    defaultCol: 4,
    defaultRow: 2,
  },
]

const AVAILABLE_ICONS = [
  { name: 'activity', icon: Activity },
  { name: 'users', icon: Users },
  { name: 'dollar', icon: ShoppingBag },
  { name: 'box', icon: Box },
  { name: 'file', icon: FileText },
  { name: 'database', icon: Database },
]

const METRIC_OPS = [
  { value: 'sum', label: 'Sum' },
  { value: 'avg', label: 'Avg' },
  { value: 'min', label: 'Min' },
  { value: 'max', label: 'Max' },
  { value: 'count', label: 'Count' },
  { value: 'latest', label: 'Latest' },
  { value: 'earliest', label: 'Earliest' },
]

const COLORS = [
  { name: 'blue', bg: '#3b82f6' },
  { name: 'purple', bg: '#a855f7' },
  { name: 'emerald', bg: '#10b981' },
  { name: 'orange', bg: '#f97316' },
  { name: 'rose', bg: '#f43f5e' },
  { name: 'cyan', bg: '#06b6d4' },
]

interface WidgetPickerProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (type: WidgetType, config?: any, col?: number, row?: number) => void
}

export const WidgetPicker: React.FC<WidgetPickerProps> = ({ isOpen, onClose, onSelect }) => {
  const [selectedWidget, setSelectedWidget] = useState<WidgetOption | null>(null)
  const [collections, setCollections] = useState<CollectionsGetResponse['collections']>([])
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)

  const [metricConfig, setMetricConfig] = useState({
    label: 'Total Revenue',
    collection: 'Orders',
    field: 'Revenue',
    op: 'sum',
    value: '$0.00',
    icon: 'dollar',
    color: 'blue',
  })

  const [chartConfig, setChartConfig] = useState({
    title: 'Revenue Trends',
    collection: 'Orders',
    field: 'Revenue',
    xField: 'createdAt',
    limit: 12,
    color: 'purple',
  })

  const [listConfig, setListConfig] = useState({
    collection: '',
    title: 'Recent Items',
    limit: 5,
    fields: [] as string[],
  })

  const collectionOptions = useMemo(() => {
    return (collections || [])
      .filter((collection) => typeof collection?.slug === 'string' && collection.slug)
      .map((collection) => ({
        slug: collection.slug as string,
        label:
          typeof collection?.label === 'string'
            ? collection.label
            : typeof collection?.slug === 'string'
              ? collection.slug
              : 'Untitled',
        fields: Array.isArray(collection?.fields) ? collection.fields : [],
      }))
  }, [collections])

  const metricFields = useMemo(() => {
    const selected = collectionOptions.find(
      (collection) => collection.slug === metricConfig.collection,
    )
    return selected?.fields ?? []
  }, [collectionOptions, metricConfig.collection])

  const chartFields = useMemo(() => {
    const selected = collectionOptions.find(
      (collection) => collection.slug === chartConfig.collection,
    )
    return selected?.fields ?? []
  }, [collectionOptions, chartConfig.collection])

  const chartAxisFields = useMemo(() => {
    const defaults = ['createdAt', 'updatedAt']
    const combined = [...defaults, ...chartFields]
    const unique = new Set<string>()
    for (const field of combined) {
      if (typeof field === 'string' && field.trim()) {
        unique.add(field)
      }
    }
    return Array.from(unique)
  }, [chartFields])

  const listFields = useMemo(() => {
    const selected = collectionOptions.find(
      (collection) => collection.slug === listConfig.collection,
    )
    return selected?.fields ?? []
  }, [collectionOptions, listConfig.collection])

  useEffect(() => {
    let isMounted = true

    const loadCollections = async () => {
      try {
        const data = await getCollectionsCached()
        if (!isMounted) return
        setCollections(Array.isArray(data.collections) ? data.collections : [])
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Failed to load collections'
        clearCollectionsCache()
        setCollectionsError(message)
      } finally {
        if (isMounted) {
          setCollectionsLoading(false)
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (collectionOptions.length === 0) {
      return
    }

    setMetricConfig((prev) => {
      const selected =
        collectionOptions.find((collection) => collection.slug === prev.collection) ||
        collectionOptions[0]
      const nextField = selected.fields.includes(prev.field) ? prev.field : selected.fields[0] || ''
      if (
        selected.slug === prev.collection &&
        nextField === prev.field &&
        nextXField === prev.xField
      ) {
        return prev
      }
      return {
        ...prev,
        collection: selected.slug,
        field: nextField,
      }
    })

    setChartConfig((prev) => {
      const selected =
        collectionOptions.find((collection) => collection.slug === prev.collection) ||
        collectionOptions[0]
      const nextField = selected.fields.includes(prev.field) ? prev.field : selected.fields[0] || ''
      const axisOptions = ['createdAt', 'updatedAt', ...selected.fields].filter(Boolean)
      const nextXField = axisOptions.includes(prev.xField) ? prev.xField : axisOptions[0] || ''
      if (selected.slug === prev.collection && nextField === prev.field) {
        return prev
      }
      return {
        ...prev,
        collection: selected.slug,
        field: nextField,
        xField: nextXField,
      }
    })

    setListConfig((prev) => {
      const selected =
        collectionOptions.find((collection) => collection.slug === prev.collection) ||
        collectionOptions[0]
      if (!selected) {
        return prev
      }
      if (prev.collection === selected.slug) {
        const nextFields = Array.isArray(prev.fields)
          ? prev.fields.filter((field) => selected.fields.includes(field))
          : []
        const sameFields =
          Array.isArray(prev.fields) &&
          prev.fields.length === nextFields.length &&
          prev.fields.every((value, index) => value === nextFields[index])
        if (sameFields) {
          return prev
        }
        return {
          ...prev,
          fields: nextFields,
        }
      }
      const nextTitle = prev.title || `Recent ${selected.label}`
      return {
        ...prev,
        collection: selected.slug,
        title: nextTitle,
        fields: [],
      }
    })
  }, [collectionOptions])

  if (!isOpen) return null

  const handleSelect = (option: WidgetOption) => {
    if (option.requiresConfig) {
      setSelectedWidget(option)
    } else {
      onSelect(option.type, {}, option.defaultCol, option.defaultRow)
    }
  }

  const handleConfirm = () => {
    if (!selectedWidget) return

    let config = {}
    if (selectedWidget.type === 'stats') {
      config = {
        ...metricConfig,
        value: metricConfig.field === 'Revenue' ? '$45,231' : '1,234',
      }
    } else if (selectedWidget.type === 'chart') {
      const nextLimit = Number(chartConfig.limit)
      config = {
        ...chartConfig,
        limit: Number.isFinite(nextLimit) ? Math.max(1, Math.min(50, Math.floor(nextLimit))) : 12,
      }
    } else if (selectedWidget.type === 'cms-list') {
      config = {
        ...listConfig,
        limit: Number(listConfig.limit) || 5,
        fields: Array.isArray(listConfig.fields) ? listConfig.fields : [],
      }
    }

    onSelect(selectedWidget.type, config, selectedWidget.defaultCol, selectedWidget.defaultRow)
    reset()
  }

  const reset = () => {
    setSelectedWidget(null)
    setMetricConfig({
      label: 'Total Revenue',
      collection: 'Orders',
      field: 'Revenue',
      op: 'sum',
      value: '$0.00',
      icon: 'dollar',
      color: 'blue',
    })
    setChartConfig({
      title: 'Revenue Trends',
      collection: 'Orders',
      field: 'Revenue',
      xField: 'createdAt',
      limit: 12,
      color: 'purple',
    })
    setListConfig({ collection: '', title: 'Recent Items', limit: 5, fields: [] })
  }

  const closeAndReset = () => {
    reset()
    onClose()
  }

  return (
    <div className="picker-overlay">
      <div className="picker-backdrop" onClick={closeAndReset}></div>

      <div className="picker-modal">
        <div className="picker-header">
          <div className="picker-title-group">
            {selectedWidget && (
              <button onClick={() => setSelectedWidget(null)} className="btn-icon">
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h2 className="picker-title">
                {selectedWidget ? `Configure ${selectedWidget.title}` : 'Add Widget'}
              </h2>
              <p className="picker-subtitle">
                {selectedWidget ? 'Customize your widget data source' : 'Select a component to add'}
              </p>
            </div>
          </div>
          <button onClick={closeAndReset} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="picker-content custom-scrollbar">
          {!selectedWidget ? (
            <div className="picker-grid">
              {options.map((opt, idx) => (
                <button key={idx} onClick={() => handleSelect(opt)} className="widget-option">
                  <div className="option-icon-box">
                    <opt.icon size={24} />
                  </div>
                  <div>
                    <span className="option-title">{opt.title}</span>
                    <span className="option-desc">{opt.description}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="config-form">
              {selectedWidget.type === 'stats' && (
                <>
                  <div className="form-group">
                    <label className="form-label">CMS Collection</label>
                    <select
                      className="form-select"
                      value={metricConfig.collection}
                      onChange={(e) =>
                        setMetricConfig({ ...metricConfig, collection: e.target.value })
                      }
                      disabled={collectionsLoading || collectionOptions.length === 0}
                    >
                      {collectionsLoading && <option value="">Loading collections...</option>}
                      {!collectionsLoading && collectionsError && (
                        <option value="">Failed to load collections</option>
                      )}
                      {!collectionsLoading &&
                        !collectionsError &&
                        collectionOptions.length === 0 && (
                          <option value="">No collections found</option>
                        )}
                      {!collectionsLoading &&
                        !collectionsError &&
                        collectionOptions.map((collection) => (
                          <option key={collection.slug} value={collection.slug}>
                            {collection.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Field</label>
                    <select
                      className="form-select"
                      value={metricConfig.field}
                      onChange={(e) => setMetricConfig({ ...metricConfig, field: e.target.value })}
                      disabled={metricFields.length === 0}
                    >
                      {metricFields.length === 0 && <option value="">No fields available</option>}
                      {metricFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Aggregation</label>
                    <select
                      className="form-select"
                      value={metricConfig.op}
                      onChange={(e) => setMetricConfig({ ...metricConfig, op: e.target.value })}
                    >
                      {METRIC_OPS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Label</label>
                    <input
                      type="text"
                      className="form-input"
                      value={metricConfig.label}
                      onChange={(e) => setMetricConfig({ ...metricConfig, label: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Icon</label>
                    <div className="icon-grid">
                      {AVAILABLE_ICONS.map((i) => (
                        <button
                          key={i.name}
                          onClick={() => setMetricConfig({ ...metricConfig, icon: i.name })}
                          className={`btn-select-icon ${metricConfig.icon === i.name ? 'active' : ''}`}
                        >
                          <i.icon size={20} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color Theme</label>
                    <div className="color-grid">
                      {COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setMetricConfig({ ...metricConfig, color: c.name })}
                          className={`btn-color ${metricConfig.color === c.name ? 'active' : ''}`}
                          style={{ backgroundColor: c.bg }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedWidget.type === 'chart' && (
                <>
                  <div className="form-group">
                    <label className="form-label">CMS Collection</label>
                    <select
                      className="form-select"
                      value={chartConfig.collection}
                      onChange={(e) =>
                        setChartConfig({ ...chartConfig, collection: e.target.value })
                      }
                      disabled={collectionsLoading || collectionOptions.length === 0}
                    >
                      {collectionsLoading && <option value="">Loading collections...</option>}
                      {!collectionsLoading && collectionsError && (
                        <option value="">Failed to load collections</option>
                      )}
                      {!collectionsLoading &&
                        !collectionsError &&
                        collectionOptions.length === 0 && (
                          <option value="">No collections found</option>
                        )}
                      {!collectionsLoading &&
                        !collectionsError &&
                        collectionOptions.map((collection) => (
                          <option key={collection.slug} value={collection.slug}>
                            {collection.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Data Field (Y-Axis)</label>
                    <select
                      className="form-select"
                      value={chartConfig.field}
                      onChange={(e) => setChartConfig({ ...chartConfig, field: e.target.value })}
                      disabled={chartFields.length === 0}
                    >
                      {chartFields.length === 0 && <option value="">No fields available</option>}
                      {chartFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Label Field (X-Axis)</label>
                    <select
                      className="form-select"
                      value={chartConfig.xField}
                      onChange={(e) => setChartConfig({ ...chartConfig, xField: e.target.value })}
                      disabled={chartAxisFields.length === 0}
                    >
                      {chartAxisFields.length === 0 && (
                        <option value="">No fields available</option>
                      )}
                      {chartAxisFields.map((field) => (
                        <option key={field} value={field}>
                          {field}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Records to show</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="form-input"
                      value={chartConfig.limit}
                      onChange={(e) => {
                        const next = Number(e.target.value)
                        if (!Number.isFinite(next)) return
                        setChartConfig({
                          ...chartConfig,
                          limit: Math.max(1, Math.min(50, Math.floor(next))),
                        })
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Chart Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={chartConfig.title}
                      onChange={(e) => setChartConfig({ ...chartConfig, title: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color Theme</label>
                    <div className="color-grid">
                      {COLORS.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setChartConfig({ ...chartConfig, color: c.name })}
                          className={`btn-color ${chartConfig.color === c.name ? 'active' : ''}`}
                          style={{ backgroundColor: c.bg }}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedWidget.type === 'cms-list' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label className="form-label">CMS Collection</label>
                    <select
                      className="form-select"
                      value={listConfig.collection}
                      onChange={(e) =>
                        setListConfig({ ...listConfig, collection: e.target.value, fields: [] })
                      }
                      disabled={collectionsLoading || collectionOptions.length === 0}
                    >
                      {collectionsLoading && <option value="">Loading collections...</option>}
                      {!collectionsLoading && collectionsError && (
                        <option value="">Failed to load collections</option>
                      )}
                      {!collectionsLoading &&
                        !collectionsError &&
                        collectionOptions.length === 0 && (
                          <option value="">No collections found</option>
                        )}
                      {!collectionsLoading &&
                        !collectionsError &&
                        collectionOptions.map((collection) => (
                          <option key={collection.slug} value={collection.slug}>
                            {collection.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Records to show</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      className="form-input"
                      value={listConfig.limit}
                      onChange={(e) => {
                        const next = Number(e.target.value)
                        if (!Number.isFinite(next)) return
                        setListConfig({
                          ...listConfig,
                          limit: Math.max(1, Math.min(50, Math.floor(next))),
                        })
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visible fields</label>
                    <div className="chip-grid">
                      {listFields.length === 0 && (
                        <div className="chip-empty">No fields available</div>
                      )}
                      {listFields.map((field) => {
                        const isActive = listConfig.fields.includes(field)
                        return (
                          <button
                            key={field}
                            type="button"
                            className={`chip ${isActive ? 'chip--active' : ''}`}
                            onClick={() => {
                              const nextFields = isActive
                                ? listConfig.fields.filter((item) => item !== field)
                                : [...listConfig.fields, field]
                              setListConfig({ ...listConfig, fields: nextFields })
                            }}
                          >
                            {field}
                          </button>
                        )
                      })}
                    </div>
                    {listFields.length > 0 && (
                      <div className="chip-hint">If none selected, all fields are shown.</div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Widget Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={listConfig.title}
                      onChange={(e) => setListConfig({ ...listConfig, title: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="form-footer">
                <button onClick={handleConfirm} className="btn-submit">
                  <Check size={18} />
                  Add Widget
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
