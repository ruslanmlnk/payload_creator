type ApiErrorResponse = {
  error?: string
}

type CollectionsFieldInfo = {
  slug?: string
  label?: string
  fields?: string[]
  hidden?: boolean | null
}

export type CollectionsGetResponse = {
  total: number
  collections: CollectionsFieldInfo[]
}

export type DashboardLayoutResponse<T = unknown> = {
  layout: T
}

export type MetricOp = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'earliest' | 'latest'

export type MetricsRequest = {
  collection: string
  field?: string
  op?: MetricOp
  where?: Record<string, unknown>
  limit?: number
  page?: number
  depth?: number
  sort?: string
  all?: boolean
  maxDocs?: number
  includeDocs?: boolean
}

export type MetricsResponse = {
  collection: string
  field?: string
  op?: MetricOp
  value?: number | string | null
  totalDocs?: number
  processed?: number
  validCount?: number
  truncated?: boolean
  docs?: unknown[]
  limit?: number
  page?: number
  totalPages?: number
  hasNextPage?: boolean
  hasPrevPage?: boolean
  error?: string
}

export type StorageSlice = {
  id: string
  label: string
  usedGB: number
  color: string
}

export type StorageResponse = {
  totalGB: number
  usedGB: number
  usedPercent: number
  slices: StorageSlice[]
  database?: {
    type: string
    bytes: number
  } | null
  disk?: {
    path: string
    totalBytes: number
    freeBytes: number
    usedBytes: number
    totalGB: number
    freeGB: number
    usedGB: number
    freePercent: number
    usedPercent: number
  } | null
  debug?: {
    collections: Array<{
      collection: string
      label: string
      files: Array<{
        id: string
        filename: string | null
        filesize: string | number | null
        sizes: Record<string, number | string | null> | null
        totalBytes: number
        totalMB: number
      }>
    }>
    diskError?: string
    diskPath?: string
  }
  error?: string
}

const buildApiPath = (path: string) => {
  if (!path.startsWith('/')) {
    return `/api/${path}`
  }
  if (path.startsWith('/api/')) {
    return path
  }
  return `/api${path}`
}

const withJsonHeaders = (options: RequestInit) => {
  const headers = new Headers(options.headers)
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  return { ...options, headers }
}

const getErrorMessage = async (res: Response) => {
  try {
    const data = (await res.json()) as ApiErrorResponse
    if (data && typeof data.error === 'string') {
      return data.error
    }
  } catch {}
  return res.statusText || 'Request failed'
}

const fetchJson = async <T>(path: string, options: RequestInit = {}) => {
  const res = await fetch(buildApiPath(path), {
    credentials: 'include',
    ...withJsonHeaders(options),
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return (await res.json()) as T
}

const fetchText = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(buildApiPath(path), {
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    throw new Error(await getErrorMessage(res))
  }

  return res.text()
}

export const getCollections = () =>
  fetchJson<CollectionsGetResponse>('/collections-get', {
    method: 'POST',
  })

let collectionsPromise: Promise<CollectionsGetResponse> | null = null

export const getCollectionsCached = (options: { force?: boolean } = {}) => {
  if (options.force) {
    collectionsPromise = null
  }

  if (!collectionsPromise) {
    collectionsPromise = getCollections()
  }

  return collectionsPromise
}

export const clearCollectionsCache = () => {
  collectionsPromise = null
}

export const getDashboardLayout = <T = unknown>() =>
  fetchJson<DashboardLayoutResponse<T>>('/dashboard-layout')

export const saveDashboardLayout = <T = unknown>(layout: T) =>
  fetchJson<DashboardLayoutResponse<T>>('/dashboard-layout', {
    method: 'POST',
    body: JSON.stringify({ layout }),
  })

export const getAnalyticsScript = () => fetchText('/analytics.js')

export const trackAnalytics = (payload: unknown) =>
  fetchText('/analytics/track', {
    method: 'POST',
    ...withJsonHeaders({
      body: JSON.stringify(payload ?? {}),
    }),
  })

export const getMetrics = (payload: MetricsRequest) =>
  fetchJson<MetricsResponse>('/metrics-get', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const getStorage = () => fetchJson<StorageResponse>('/storage-get')

const metricsCache = new Map<string, Promise<MetricsResponse>>()

export const getMetricsCached = (payload: MetricsRequest, options: { force?: boolean } = {}) => {
  const key = JSON.stringify(payload)
  if (options.force) {
    metricsCache.delete(key)
  }

  const existing = metricsCache.get(key)
  if (existing) {
    return existing
  }

  const request = getMetrics(payload)
  metricsCache.set(key, request)
  return request
}

export const clearMetricsCache = () => {
  metricsCache.clear()
}
