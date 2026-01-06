'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Move, HardDrive, Cloud, Database } from 'lucide-react'
import { getStorage, type StorageResponse } from '../../../utils/endpoints.js'

interface StorageWidgetProps {
  dragHandleProps?: any
}

const resolveSliceIcon = (id: string) => {
  if (id.includes('media')) return Cloud
  if (id.includes('db') || id.includes('database')) return Database
  return HardDrive
}

const formatGB = (value: number) => {
  if (!Number.isFinite(value)) return '--'
  const abs = Math.abs(value)
  const maximumFractionDigits = abs < 1 ? 2 : abs < 10 ? 1 : 0
  return new Intl.NumberFormat(undefined, { maximumFractionDigits }).format(value)
}

const formatStorageSize = (valueGB: number) => {
  if (!Number.isFinite(valueGB)) return '--'
  if (valueGB < 1) {
    const mb = Math.max(1, Math.round(valueGB * 1024))
    return `${mb} MB`
  }
  return `${formatGB(valueGB)} GB`
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({ dragHandleProps }) => {
  const [storage, setStorage] = useState<StorageResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadStorage = async () => {
      try {
        const data = await getStorage()
        if (!isMounted) return
        setStorage(data)
      } catch (error) {
        if (!isMounted) return
        const message = error instanceof Error ? error.message : 'Failed to load storage data'
        setErrorMessage(message)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadStorage()

    return () => {
      isMounted = false
    }
  }, [])

  const totalGB = storage?.totalGB ?? 0
  const usedPercent = useMemo(() => {
    if (!storage) return 0
    return Math.max(0, Math.min(100, Math.round(storage.usedPercent)))
  }, [storage])
  const slices = storage?.slices ?? []
  const disk = storage?.disk ?? null
  const diskPercent = useMemo(() => {
    if (!disk) return 0
    const percent = Number(disk.usedPercent)
    if (!Number.isFinite(percent)) return 0
    return Math.max(0, Math.min(100, Math.round(percent)))
  }, [disk])

  return (
    <div className="storage-widget group">
      <div {...dragHandleProps} className="storage-drag-handle">
        <Move size={14} />
      </div>

      <div className="storage-header">
        <h3 className="storage-title">
          <HardDrive size={18} style={{ color: '#a855f7' }} /> Storage
        </h3>
      </div>

      <div className="storage-content">
        <div className="storage-chart-container">
          <svg className="circular-chart" viewBox="0 0 36 36">
            <path
              className="circle-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className="circle-progress"
              strokeDasharray={`${usedPercent}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <div className="chart-text">
            <span className="chart-percent">
              {isLoading ? '...' : errorMessage ? '--' : `${usedPercent}%`}
            </span>
            <span className="chart-label">
              {isLoading ? 'Loading' : errorMessage ? 'Unavailable' : 'Used'}
            </span>
          </div>
        </div>

        <div className="storage-legend">
          {isLoading && (
            <div className="legend-item">
              <div className="legend-header">
                <span className="legend-title">Loading...</span>
                <span className="legend-value">-- GB</span>
              </div>
              <div className="storage-progress-track">
                <div
                  className="storage-progress-bar"
                  style={{ width: '40%', backgroundColor: 'rgba(255,255,255,0.2)' }}
                ></div>
              </div>
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="legend-item">
              <div className="legend-header">
                <span className="legend-title">{errorMessage}</span>
                <span className="legend-value">--</span>
              </div>
            </div>
          )}

          {!isLoading && !errorMessage && slices.length === 0 && (
            <div className="legend-item">
              <div className="legend-header">
                <span className="legend-title">No storage data</span>
                <span className="legend-value">{totalGB ? `${totalGB} GB` : '--'}</span>
              </div>
            </div>
          )}

          {!isLoading &&
            !errorMessage &&
            slices.map((slice) => {
              const Icon = resolveSliceIcon(slice.id)
              const width = totalGB ? Math.min(100, Math.round((slice.usedGB / totalGB) * 100)) : 0
              return (
                <div className="legend-item" key={slice.id}>
                  <div className="legend-header">
                    <span className="legend-title">
                      <Icon size={12} /> {slice.label}
                    </span>
                    <span className="legend-value">{formatStorageSize(slice.usedGB)}</span>
                  </div>
                  <div className="storage-progress-track">
                    <div
                      className="storage-progress-bar"
                      style={{ width: `${width}%`, backgroundColor: slice.color }}
                    ></div>
                  </div>
                </div>
              )
            })}

          {!isLoading && !errorMessage && disk && (
            <div className="legend-item detailed-item">
              <div className="legend-header">
                <span className="legend-title highlight">
                  <HardDrive size={12} /> Disk {disk.path ? `(${disk.path})` : ''}
                </span>
                <span className="legend-value warning">{diskPercent}%</span>
              </div>
              <div className="storage-progress-track">
                <div
                  className="storage-progress-bar"
                  style={{ width: `${diskPercent}%`, backgroundColor: '#f97316' }}
                ></div>
              </div>
              <div className="legend-footer-text">
                Free {formatStorageSize(disk.freeGB)} / Total {formatStorageSize(disk.totalGB)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
