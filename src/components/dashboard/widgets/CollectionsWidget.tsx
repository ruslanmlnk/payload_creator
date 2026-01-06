'use client'

import React, { useEffect, useMemo, useState } from 'react'
import {
  Move,
  Layers,
  FileText,
  Image as ImageIcon,
  Users,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react'
import { clearCollectionsCache, getCollectionsCached } from '../../../utils/endpoints.js'
import { useConfig } from '@payloadcms/ui'

interface CollectionsWidgetProps {
  dragHandleProps?: any
}

type CollectionItem = {
  slug?: string
  label?: string
  fields?: string[]
}

const resolveIcon = (slug = '') => {
  const normalized = slug.toLowerCase()
  if (normalized.includes('media') || normalized.includes('upload')) return ImageIcon
  if (normalized.includes('user')) return Users
  if (normalized.includes('product') || normalized.includes('shop')) return ShoppingBag
  return FileText
}

export const CollectionsWidget: React.FC<CollectionsWidgetProps> = ({ dragHandleProps }) => {
  const [collections, setCollections] = useState<CollectionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const configContext = useConfig()
  const adminBase =
    configContext?.config?.routes?.admin || configContext?.config?.admin?.route || '/admin'

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
        setErrorMessage(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadCollections()

    return () => {
      isMounted = false
    }
  }, [])

  const cards = useMemo(
    () =>
      collections.map((collection) => {
        const label = collection.label || collection.slug || 'Untitled'
        const count = Array.isArray(collection.fields)
          ? `${collection.fields.length} fields`
          : 'No fields'
        return {
          id: collection.slug || label,
          slug: collection.slug,
          label,
          count,
          Icon: resolveIcon(collection.slug),
        }
      }),
    [collections],
  )

  const handleNavigate = (slug?: string) => {
    if (!slug) return
    const target = `${adminBase.replace(/\/$/, '')}/collections/${slug}`
    window.location.assign(target)
  }

  return (
    <div className="collections-widget group">
      <div {...dragHandleProps} className="col-drag-handle">
        <Move size={14} />
      </div>

      <div className="col-header">
        <h3 className="col-title">
          <Layers size={20} />
          Collections
        </h3>
      </div>

      <div className="col-grid custom-scrollbar">
        {isLoading && (
          <div className="collection-card collection-card--loading">
            <div className="card-icon-wrapper" />
            <div className="card-content">
              <span className="card-label">Loading...</span>
              <span className="card-count">Fetching collections</span>
            </div>
          </div>
        )}

        {!isLoading && errorMessage && (
          <div className="collection-card collection-card--empty">
            <div className="card-content">
              <span className="card-label">Failed to load</span>
              <span className="card-count">{errorMessage}</span>
            </div>
          </div>
        )}

        {!isLoading && !errorMessage && cards.length === 0 && (
          <div className="collection-card collection-card--empty">
            <div className="card-content">
              <span className="card-label">No collections</span>
              <span className="card-count">Create one to get started</span>
            </div>
          </div>
        )}

        {!isLoading &&
          !errorMessage &&
          cards.map((item) => (
            <button
              key={item.id}
              type="button"
              className="collection-card group/card"
              onClick={() => handleNavigate(item.slug)}
              disabled={!item.slug}
            >
              <div className="card-icon-wrapper">
                <item.Icon size={20} />
              </div>
              <div className="card-content">
                <span className="card-label">{item.label}</span>
                <span className="card-count">{item.count}</span>
              </div>
              {item.slug && (
                <div className="card-arrow">
                  <ArrowRight size={16} />
                </div>
              )}
            </button>
          ))}
      </div>
    </div>
  )
}
